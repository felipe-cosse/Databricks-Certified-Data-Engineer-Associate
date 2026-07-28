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

**Maps to:** 1.1, 3.1, 3.6  
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

Save row counts at each layer and one sentence about rejected records.

---

## Lab 2 — Prove `COPY INTO` idempotence

**Maps to:** 2.1, 2.2  
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

```sql
CREATE TABLE IF NOT EXISTS main.dea_bronze.orders_copy (
  order_id BIGINT,
  customer_id BIGINT,
  amount DECIMAL(12,2)
) USING DELTA;

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

### Evidence

Record counts after each of the three commands: expected `3 → 3 → 4`.

---

## Lab 3 — Incremental files with Auto Loader

**Maps to:** 2.3, 2.7  
**Target time:** 25 minutes

### Goal

Use `cloudFiles`, a checkpoint, and a schema location. Introduce a new field.

```python
source = "/Volumes/main/dea_bronze/landing/events"
checkpoint = "/Volumes/main/dea_bronze/landing/_checkpoints/events"
schema_location = "/Volumes/main/dea_bronze/landing/_schemas/events"

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
run_loader()
```

Depending on configured schema-evolution behavior, the first update after a new column can require a restart. Inspect the table and schema history.

```sql
SELECT * FROM main.dea_bronze.events_auto ORDER BY event_id;
DESCRIBE TABLE main.dea_bronze.events_auto;
```

### Challenge

Run a variant using `_rescued_data` or a schema hint. Introduce a mismatched type and inspect what is preserved.

### Explain

- Checkpoint versus schema location
- Why an independent stream needs an independent checkpoint
- Directory listing versus file events

### Evidence

Save the final schema and the checkpoint path.

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
catalog = dbutils.widgets.get("catalog")
spark.sql(f"CREATE SCHEMA IF NOT EXISTS {catalog}.dea_bundle_demo")
print(f"Ready: {catalog}.dea_bundle_demo")
```

`databricks.yml`:

```yaml
bundle:
  name: dea-course-lab

variables:
  catalog:
    default: dev

resources:
  jobs:
    hello_job:
      name: dea-course-${bundle.target}
      tasks:
        - task_key: hello
          spark_python_task:
            python_file: ./src/hello.py

targets:
  dev:
    default: true
    mode: development
    variables:
      catalog: dev
  prod:
    mode: production
    variables:
      catalog: prod
```

The precise task definition can require adjustment for your available compute. The learning goal is target resolution and lifecycle.

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

---

## Lab 9 — Diagnose and improve a skewed job

**Maps to:** 3.5, 6.3–6.5  
**Target time:** 25 minutes

### Create skew

```python
from pyspark.sql import functions as F

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

result = large.join(small, "join_key").groupBy("label").count()
result.count()
```

Inspect Spark UI or query profile:

- Task duration distribution
- Max versus median input/shuffle
- Spill
- Longest stage

### Apply one change

Examples:

- Broadcast `small`
- Confirm AQE skew handling
- Filter earlier
- Salt the hot key
- Adjust shuffle partitions from measured partition size

Run the same input and record the new metrics.

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

