# Hands-on Lab Manual

These ten labs implement the AI Prep Guide's hands-on minimum. Each is designed for about 15–30 minutes. Use Databricks Free Edition or a trial. Product availability and permissions vary.

## Lab evidence rule

Mark a lab:

- **Complete:** you ran the important operations and inspected the result.
- **Partial:** you ran only part of the workflow.
- **Simulated:** the feature was unavailable; you wrote and checked the intended configuration against official docs.
- **Blocked:** you could not produce either runtime or design evidence.

Never mark a lab complete because the code looked plausible.

## Shared setup

Choose a catalog where you can create schemas. Replace `main` if necessary.

```sql
CREATE SCHEMA IF NOT EXISTS main.dea_bronze;
CREATE SCHEMA IF NOT EXISTS main.dea_silver;
CREATE SCHEMA IF NOT EXISTS main.dea_gold;
CREATE SCHEMA IF NOT EXISTS main.dea_security;
```

Keep all course artifacts in these schemas so cleanup is easy.

---

## Lab 1 — Build a medallion path

**Maps to:** 1.1, 1.2, 3.1, 3.6
**Target time:** 20 minutes

### Goal

Create a raw bronze table, clean it into silver, and aggregate it into gold.

### Bronze

```sql
CREATE OR REPLACE TABLE main.dea_bronze.orders_raw AS
SELECT * FROM VALUES
  ('1', '101', '2026-07-01 10:00:00', '49.90', ' paid '),
  ('2', '102', '2026-07-01 11:00:00', 'BAD',   'pending'),
  ('2', '102', '2026-07-01 11:00:00', '20.00', 'PENDING'),
  ('3', NULL,  '2026-07-02 09:30:00', '-5.00',  'paid'),
  ('4', '104', 'not-a-time',           '80.00',  'paid')
AS t(order_id, customer_id, order_ts, amount, status);
```

### Silver

```sql
CREATE OR REPLACE TABLE main.dea_silver.orders AS
WITH typed AS (
  SELECT
    try_cast(order_id AS BIGINT) AS order_id,
    try_cast(customer_id AS BIGINT) AS customer_id,
    try_cast(order_ts AS TIMESTAMP) AS order_ts,
    try_cast(amount AS DECIMAL(12,2)) AS amount,
    upper(trim(status)) AS status
  FROM main.dea_bronze.orders_raw
),
ranked AS (
  SELECT *,
    row_number() OVER (
      PARTITION BY order_id
      ORDER BY
        CASE WHEN amount IS NOT NULL THEN 0 ELSE 1 END,
        order_ts DESC
    ) AS row_rank
  FROM typed
)
SELECT order_id, customer_id, order_ts, amount, status
FROM ranked
WHERE row_rank = 1
  AND order_id IS NOT NULL
  AND customer_id IS NOT NULL
  AND order_ts IS NOT NULL
  AND amount >= 0;
```

### Gold

```sql
CREATE OR REPLACE TABLE main.dea_gold.daily_orders AS
SELECT
  date(order_ts) AS order_date,
  count(*) AS order_count,
  sum(amount) AS revenue,
  avg(amount) AS average_order
FROM main.dea_silver.orders
GROUP BY date(order_ts);
```

### Verify

```sql
SELECT * FROM main.dea_bronze.orders_raw;
SELECT * FROM main.dea_silver.orders;
SELECT * FROM main.dea_gold.daily_orders;
DESCRIBE HISTORY main.dea_silver.orders;
```

### Explain

- Why bronze keeps bad rows
- Why silver excludes them
- Why gold changes the grain
- Which duplicate row for order 2 survives and whether the tie-breaking rule is sufficient

### Evidence

Save row counts at each layer and one sentence about rejected records. Also record:

- the compute type you used;
- whether the workload is interactive or scheduled;
- which different compute type you would choose for a nightly production run, and why.

---

## Lab 2 — Prove `COPY INTO` idempotence

**Maps to:** 2.1, 2.2, 2.6
**Target time:** 20 minutes

### Goal

Load files, rerun the command, then add a file and confirm that only the new file adds rows.

### Create a volume

```sql
CREATE VOLUME IF NOT EXISTS main.dea_bronze.landing;
```

In a Python notebook cell:

```python
base = "/Volumes/main/dea_bronze/landing/orders"

# Reset only this lab's files so the expected counts remain reproducible.
dbutils.fs.rm(base, True)
dbutils.fs.mkdirs(base)
dbutils.fs.put(
    f"{base}/orders-001.csv",
    "order_id,customer_id,amount\n10,201,10.00\n11,202,12.50\n",
    True,
)
dbutils.fs.put(
    f"{base}/orders-002.csv",
    "order_id,customer_id,amount\n12,201,8.25\n",
    True,
)
```

### Load

Reset the target table as well. `COPY INTO` file history belongs to the table, so
deleting only the source files is not a complete reset.

```sql
DROP TABLE IF EXISTS main.dea_bronze.orders_copy;

CREATE TABLE main.dea_bronze.orders_copy (
  order_id BIGINT,
  customer_id BIGINT,
  amount DECIMAL(12,2)
) USING DELTA;
```

```sql
COPY INTO main.dea_bronze.orders_copy
FROM '/Volumes/main/dea_bronze/landing/orders'
FILEFORMAT = CSV
FORMAT_OPTIONS ('header' = 'true');
```

Record the row count. Run the same `COPY INTO` again and verify that the count does not change.

Add another file:

```python
dbutils.fs.put(
    f"{base}/orders-003.csv",
    "order_id,customer_id,amount\n13,203,99.00\n",
    True,
)
```

Run `COPY INTO` a third time.

### Explain

- Why this is incremental batch
- What state `COPY INTO` is tracking
- Why a database CDC scenario would need a different method
- Why Auto Loader would be unnecessary for this small, bounded load

### Evidence

After running the reset cells, record counts after each of the three commands:
expected `3 → 3 → 4`. If you intentionally skip the reset on a later attempt,
explain why the existing table history changes that expectation.

---

## Lab 3 — Incremental files with Auto Loader

**Maps to:** 2.3–2.7
**Target time:** 25 minutes

### Goal

Use `cloudFiles`, a checkpoint, and a schema location. Introduce a new field.

```python
source = "/Volumes/main/dea_bronze/landing/events"
checkpoint = "/Volumes/main/dea_bronze/landing/_checkpoints/events"
schema_location = "/Volumes/main/dea_bronze/landing/_schemas/events"

# Reset only this lab's table and state. A new stream must not reuse another
# stream's checkpoint.
spark.sql("DROP TABLE IF EXISTS main.dea_bronze.events_auto")
for path in (source, checkpoint, schema_location):
    dbutils.fs.rm(path, True)

dbutils.fs.mkdirs(source)
dbutils.fs.put(
    f"{source}/events-001.json",
    '{"event_id":"e1","kind":"open"}\n{"event_id":"e2","kind":"click"}\n',
    True,
)

def run_loader():
    query = (
        spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.schemaLocation", schema_location)
        .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
        .load(source)
        .writeStream
        .option("checkpointLocation", checkpoint)
        .trigger(availableNow=True)
        .toTable("main.dea_bronze.events_auto")
    )
    query.awaitTermination()

run_loader()
```

Add a new field:

```python
dbutils.fs.put(
    f"{source}/events-002.json",
    '{"event_id":"e3","kind":"purchase","campaign":"summer"}\n',
    True,
)

try:
    run_loader()
except Exception as exc:
    message = str(exc)
    expected_schema_change = (
        "UnknownFieldException" in message
        or "NEW_FIELDS_IN_FILE_SCHEMA" in message
    )
    if not expected_schema_change:
        raise
    print("Expected schema-evolution stop; restart the stream to use the updated schema.")

# With addNewColumns, discovery of the new field updates schemaLocation and
# stops the stream. The restart processes the pending file with that schema.
run_loader()
```

With `addNewColumns`, the first run that discovers `campaign` stops after
updating the schema location. The second call is the required restart. In a
production Lakeflow Job, configure retries so this expected restart can happen
automatically. Inspect the table and schema history.

```sql
SELECT * FROM main.dea_bronze.events_auto ORDER BY event_id;
DESCRIBE TABLE main.dea_bronze.events_auto;
```

### Challenge

Run a variant using `_rescued_data` or a schema hint. Introduce a mismatched type and inspect what is preserved.

### Source-method transfer

Complete this decision table. No external credentials are required.

| Source | Candidate | Operational responsibility |
|---|---|---|
| Supported CRM requiring CDC | Lakeflow Connect managed connector | Databricks manages source-aware ingestion, retries, and schema handling |
| Database exposed only through ODBC | Notebook client in a Lakeflow Job | Your team owns query partitioning, incremental state, retries, secrets, and driver compatibility |
| Unsupported cursor-based REST API | Notebook client in a Lakeflow Job | Your team owns pagination, rate limits, cursor state, idempotence, and API changes |
| High-volume object-storage files | Auto Loader | Your team owns the data contract; Auto Loader manages scalable file discovery and progress |

For the ODBC row, write a parameterized extraction query for a half-open
watermark interval (`updated_at >= ? AND updated_at < ?`). Explain where you
would store the two bound values and why string interpolation and a hard-coded
password are unsafe. Then identify the managed-connector option you would
prefer if the same source became supported.

### Explain

- Checkpoint versus schema location
- Why an independent stream needs an independent checkpoint
- Directory listing versus file events
- Why Lakeflow Connect, custom ODBC/REST code, and Auto Loader assign different operational work to your team

### Evidence

Save the expected schema-evolution error, the successful restart, the final
schema, the checkpoint path, and the completed source-method decision table.

---

## Lab 4 — Clean, join, explode, and deduplicate

**Maps to:** 3.1, 3.2, 3.3, 3.4
**Target time:** 25 minutes

### Goal

Practice the high-frequency PySpark operations from the blueprint.

```python
from pyspark.sql import Row, Window
from pyspark.sql import functions as F

orders = spark.createDataFrame([
    Row(order_id=1, customer_id=10, updated_at="2026-07-01T10:00:00", items=[
        Row(sku="A", quantity=2), Row(sku="B", quantity=1)
    ]),
    Row(order_id=1, customer_id=10, updated_at="2026-07-01T11:00:00", items=[
        Row(sku="A", quantity=3)
    ]),
    Row(order_id=2, customer_id=99, updated_at="2026-07-01T09:00:00", items=[]),
])

customers = spark.createDataFrame([
    Row(customer_id=10, segment="enterprise"),
    Row(customer_id=11, segment="consumer"),
])

w = Window.partitionBy("order_id").orderBy(F.col("updated_at").desc())

latest = (
    orders
    .withColumn("updated_at", F.to_timestamp("updated_at"))
    .withColumn("_rank", F.row_number().over(w))
    .filter("_rank = 1")
    .drop("_rank")
)

enriched = latest.join(F.broadcast(customers), "customer_id", "left")

line_items = (
    enriched
    .withColumn("item", F.explode_outer("items"))
    .select(
        "order_id",
        "customer_id",
        "segment",
        F.col("item.sku").alias("sku"),
        F.col("item.quantity").alias("quantity"),
    )
)

line_items.show(truncate=False)
```

### Questions

- Why does customer 99 remain?
- Why does the latest order 1 survive?
- What changes if `explode` replaces `explode_outer`?
- When could broadcast be unsafe?

### Challenge

Create a second compatible DataFrame and compare `union`, `unionByName`, SQL `UNION`, and SQL `UNION ALL`.

### Evidence

Save the output and answer the four questions.

---

## Lab 5 — Compare gold object types

**Maps to:** 3.6
**Target time:** 20 minutes

### Goal

Create a table and view, then create or design a materialized view and streaming table.

```sql
CREATE OR REPLACE TABLE main.dea_gold.customer_totals AS
SELECT customer_id, sum(amount) AS lifetime_value
FROM main.dea_silver.orders
GROUP BY customer_id;

CREATE OR REPLACE VIEW main.dea_gold.high_value_customers AS
SELECT *
FROM main.dea_gold.customer_totals
WHERE lifetime_value >= 50;
```

If materialized views are available:

```sql
CREATE OR REFRESH MATERIALIZED VIEW main.dea_gold.daily_revenue_mv AS
SELECT date(order_ts) AS order_date, sum(amount) AS revenue
FROM main.dea_silver.orders
GROUP BY date(order_ts);
```

If streaming tables are available:

```sql
CREATE OR REFRESH STREAMING TABLE main.dea_bronze.orders_stream
AS SELECT * FROM STREAM read_files(
  '/Volumes/main/dea_bronze/landing/orders',
  format => 'csv',
  header => true
);
```

Syntax and availability depend on the current SQL/pipeline interface. If unavailable, mark these two objects simulated and compare your design with the official docs.

### Evidence

Complete a four-row table answering: stored data, refresh behavior, best consumer, and one poor use case for each object type.

---

## Lab 6 — Enforce data quality

**Maps to:** 3.7
**Target time:** 20 minutes

### Delta constraints

```sql
CREATE OR REPLACE TABLE main.dea_silver.payments (
  payment_id BIGINT NOT NULL,
  amount DECIMAL(12,2),
  CONSTRAINT amount_nonnegative CHECK (amount >= 0)
) USING DELTA;

INSERT INTO main.dea_silver.payments VALUES (1, 25.00);
```

Try each invalid insert separately and capture the failure:

```sql
INSERT INTO main.dea_silver.payments VALUES (NULL, 10.00);
INSERT INTO main.dea_silver.payments VALUES (2, -1.00);
```

### Pipeline expectations

If Lakeflow pipeline expectations are available:

```sql
CREATE OR REFRESH STREAMING TABLE main.dea_silver.orders_quality (
  CONSTRAINT valid_order EXPECT (order_id IS NOT NULL) ON VIOLATION FAIL UPDATE,
  CONSTRAINT valid_amount EXPECT (amount >= 0) ON VIOLATION DROP ROW
)
AS SELECT * FROM STREAM(main.dea_bronze.orders_stream);
```

### Explain

For each rule, decide whether warn, drop, fail, or quarantine is appropriate and why.

### Evidence

Save one successful write, two failed writes, and an expectation action decision.

---

## Lab 7 — Build a Lakeflow Jobs DAG

**Maps to:** 4.1–4.4, 6.1, 6.2
**Target time:** 30 minutes

### Goal

Build or diagram:

```text
ingest → validate → if/else
                    ├─ true → transform → refresh_dashboard
                    └─ false → quality_alert
```

### Requirements

- `ingest`: notebook or pipeline task
- `validate`: SQL task returning a row count or task value
- `if/else`: branch on validation
- `transform`: notebook task, two retries for transient errors
- `quality_alert`: notebook task on the false branch
- `refresh_dashboard`: dashboard task or a documented placeholder

Configure one trigger and justify it:

- Scheduled
- File arrival
- Table update

Run twice if available. Compare durations and inspect task details.

### Evidence

Save a DAG screenshot or a diagram plus:

- Task types
- Dependencies
- Run conditions
- Retry choice
- Trigger choice
- First place you would investigate after a failure

---

## Lab 8 — Validate a Declarative Automation Bundle

**Maps to:** 5.1–5.4
**Target time:** 30 minutes

### Local files

Create this structure:

```text
dea-bundle/
├── databricks.yml
└── src/
    └── hello.py
```

`src/hello.py`:

```python
import re
import sys

from pyspark.sql import SparkSession

if len(sys.argv) != 2:
    raise ValueError("Usage: hello.py <catalog>")

catalog = sys.argv[1]
if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", catalog):
    raise ValueError(f"Unsafe catalog identifier: {catalog!r}")

spark = SparkSession.builder.getOrCreate()
spark.sql(f"CREATE SCHEMA IF NOT EXISTS {catalog}.dea_bundle_demo")
print(f"Ready: {catalog}.dea_bundle_demo")
```

`databricks.yml`:

```yaml
bundle:
  name: dea-course-lab

variables:
  catalog:
    description: Existing Unity Catalog catalog used by the demo job
    default: main

resources:
  jobs:
    hello_job:
      name: dea-course-${bundle.target}
      tasks:
        - task_key: hello
          spark_python_task:
            python_file: ./src/hello.py
            parameters:
              - ${var.catalog}
          environment_key: default
      environments:
        - environment_key: default
          spec:
            client: "1"

targets:
  dev:
    default: true
    mode: development
    variables:
      catalog: main
  prod:
    mode: production
    variables:
      catalog: prod
```

This uses a serverless Python-script task. Python scripts receive bundle
parameters through `sys.argv`; notebook widgets apply to notebook tasks, not
`spark_python_task`. The `environment_key` links the task to its serverless
environment. Replace `main` and `prod` with catalogs that exist in your
workspace before running either target.

### Commands

```bash
databricks bundle validate -t dev
databricks bundle summary -t dev
databricks bundle validate -t prod
databricks bundle summary -t prod
```

If credentials and a workspace are available:

```bash
databricks bundle deploy -t dev
databricks bundle run -t dev hello_job
```

### Evidence

Save validation output for both targets and explain why the same source produces different resolved configuration.
In each summary, locate the resolved `catalog` argument. Confirm that dev uses
`main` and prod uses `prod` (or the two accessible catalogs you substituted).

---

## Lab 9 — Diagnose and improve a skewed job

**Maps to:** 3.5, 6.3–6.5
**Target time:** 25 minutes

### Create skew

Run this lab on classic Spark compute so the Spark UI is available. First
disable automatic broadcast and AQE for a deliberately poor baseline. Save the
original settings so you can restore them.

```python
from pyspark.sql import functions as F

original_aqe = spark.conf.get("spark.sql.adaptive.enabled")
original_broadcast_threshold = spark.conf.get(
    "spark.sql.autoBroadcastJoinThreshold"
)

spark.conf.set("spark.sql.adaptive.enabled", "false")
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")

large = (
    spark.range(0, 5_000_000)
    .withColumn(
        "join_key",
        F.when(F.col("id") < 4_500_000, F.lit(0))
         .otherwise((F.col("id") % 1000) + 1)
    )
)

small = spark.range(0, 1001).select(
    F.col("id").alias("join_key"),
    F.concat(F.lit("group-"), F.col("id")).alias("label"),
)

baseline = large.join(small, "join_key").groupBy("label").count()
baseline.count()
```

The small side is intentionally tiny, but the disabled broadcast threshold
forces a shuffle join. Disabling AQE prevents Spark from repairing the
demonstration before you can observe the skew. Do not use these settings as
general production advice.

Inspect Spark UI or query profile:

- Task duration distribution
- Max versus median input/shuffle
- Spill
- Longest stage

### Apply one change

Use explicit broadcast as the first repair:

```python
improved = (
    large
    .join(F.broadcast(small), "join_key")
    .groupBy("label")
    .count()
)
improved.count()
```

Compare the same stage and task metrics. Then restore the session settings:

```python
spark.conf.set("spark.sql.adaptive.enabled", original_aqe)
spark.conf.set(
    "spark.sql.autoBroadcastJoinThreshold",
    original_broadcast_threshold,
)
```

Optional follow-up experiments:

- Remove the explicit broadcast, enable AQE, and confirm whether AQE changes the plan
- Filter earlier
- Salt the hot key
- Adjust shuffle partitions from measured partition size

Change one variable per run and record the new metrics. If your classic compute
cannot safely process five million rows, reduce the range while retaining the
90% hot-key distribution and document the new size.

### Evidence

Create a table:

| Metric | Before | After |
|---|---:|---:|
| Total duration | | |
| Longest task | | |
| Median task | | |
| Shuffle read/write | | |
| Spill | | |

Explain why the change targets the measured problem.

---

## Lab 10 — Govern access with Unity Catalog

**Maps to:** 7.1–7.4
**Target time:** 30 minutes

### Table lifecycle

```sql
CREATE OR REPLACE TABLE main.dea_security.customers (
  customer_id BIGINT,
  region STRING,
  account_number STRING
) USING DELTA;

INSERT INTO main.dea_security.customers VALUES
  (1, 'US', '1111222233334444'),
  (2, 'EU', '5555666677778888');
```

If you can create an external location, create an external table and compare `DESCRIBE DETAIL`. Otherwise document the DDL and expected drop behavior.

### Privileges

Replace the group with one available to you:

```sql
GRANT USE CATALOG ON CATALOG main TO `dea_analysts`;
GRANT USE SCHEMA ON SCHEMA main.dea_security TO `dea_analysts`;
GRANT SELECT ON TABLE main.dea_security.customers TO `dea_analysts`;
SHOW GRANTS ON TABLE main.dea_security.customers;
```

Then revoke:

```sql
REVOKE SELECT ON TABLE main.dea_security.customers FROM `dea_analysts`;
```

### Column mask design

```sql
CREATE OR REPLACE FUNCTION main.dea_security.mask_account(account_number STRING)
RETURN CASE
  WHEN is_account_group_member('dea_privileged') THEN account_number
  ELSE concat('************', right(account_number, 4))
END;

ALTER TABLE main.dea_security.customers
ALTER COLUMN account_number
SET MASK main.dea_security.mask_account;
```

If permissions or compute prevent execution, mark the mask simulated and verify the syntax in current docs.

### ABAC design

Write a policy design:

- Governed tag: `classification=pii`
- Scope: `main` catalog or `dea_security` schema
- Match: columns with the governed tag
- Mask function: `mask_account`
- Applies to: account users
- Exemption: privileged steward group

### Evidence

Save:

- Managed versus external drop statement
- Grant hierarchy
- Mask result for two identities or expected results
- ABAC policy design
- One sentence explaining why `DENY` is not the Unity Catalog answer

---

# Completion checklist

| Lab | Status | Mapped objectives demonstrated |
|---|---|---|
| 1. Medallion path | | |
| 2. `COPY INTO` | | |
| 3. Auto Loader | | |
| 4. PySpark transformation | | |
| 5. Gold objects | | |
| 6. Data quality | | |
| 7. Lakeflow Jobs | | |
| 8. Bundle CI/CD | | |
| 9. Performance diagnosis | | |
| 10. Unity Catalog security | | |

Hands-on readiness means no objective-critical lab remains blocked and you can explain the output without the walkthrough.
