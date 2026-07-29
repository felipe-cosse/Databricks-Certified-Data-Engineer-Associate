# Section 3 — Data Transformation and Modeling

**Exam weight:** 22%  
**Official objectives:** 7  
**Mock allocation:** 10 of 45 questions

## Orientation

1. **Objective 3.1:** Read bronze data, correct nulls and types, standardize values, and write validated silver tables.
2. **Objective 3.2:** Combine datasets with the join or set operation that preserves the required rows and columns.
3. **Objective 3.3:** Reshape data by adding, dropping, splitting, renaming, filtering, and exploding fields.
4. **Objective 3.4:** Remove duplicates and produce exact or approximate aggregates at the correct grain.
5. **Objective 3.5:** Change a small set of Spark tuning parameters only after measuring a bottleneck, then measure again.
6. **Objective 3.6:** Choose a table, view, materialized view, or streaming table for the gold-layer consumer and refresh pattern.
7. **Objective 3.7:** Apply constraints or pipeline expectations with an intentional response to bad data.

## 3.1 Bronze to silver

Medallion architecture describes increasing data quality:

- **Bronze:** raw, append-oriented, source-faithful data that enables replay and auditing
- **Silver:** cleaned, typed, deduplicated, validated, and integrated detail
- **Gold:** business-facing aggregates, dimensions, facts, and serving objects

Do not perform destructive cleanup before preserving the raw source unless a legal or security requirement says otherwise.

### PySpark cleaning example

```python
from pyspark.sql import functions as F
from pyspark.sql.types import DecimalType

bronze = spark.read.table("main.bronze.orders_raw")

silver = (
    bronze
    .filter(F.col("order_id").isNotNull())
    .withColumn("order_id", F.col("order_id").cast("long"))
    .withColumn("customer_id", F.col("customer_id").cast("long"))
    .withColumn("order_ts", F.to_timestamp("order_ts"))
    .withColumn("amount", F.col("amount").cast(DecimalType(12, 2)))
    .withColumn("status", F.upper(F.trim("status")))
    .withColumn("country", F.coalesce(F.upper("country"), F.lit("UNKNOWN")))
    .filter(F.col("amount") >= 0)
    .dropDuplicates(["order_id"])
)

(
    silver.write
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .saveAsTable("main.silver.orders")
)
```

### Null decisions

Choose based on meaning:

- Drop a row when a required business key is null and no safe repair exists.
- Impute only when a defensible rule exists.
- Preserve null when “unknown” is meaningfully different from a real value.
- Do not replace every numeric null with zero; zero is data, not absence.

### Type decisions

Cast deliberately and inspect failures. In ANSI mode, invalid casts can fail; `try_cast` returns null and is helpful when you need to quarantine invalid values.

```sql
CREATE OR REPLACE TABLE main.silver.orders AS
SELECT
  try_cast(order_id AS BIGINT) AS order_id,
  try_cast(order_ts AS TIMESTAMP) AS order_ts,
  try_cast(amount AS DECIMAL(12,2)) AS amount,
  upper(trim(status)) AS status
FROM main.bronze.orders_raw
WHERE order_id IS NOT NULL;
```

A reliable silver pipeline measures rejected, rescued, or quarantined rows. Silently filtering them without a metric makes data loss invisible.

### Write the silver contract before the code

For each output column, record:

| Contract element | Example |
|---|---|
| Name and type | `amount DECIMAL(12,2)` |
| Null rule | `order_id` must not be null |
| Accepted values | `status` is one of `OPEN`, `PAID`, `CANCELLED` |
| Grain | One row per `order_id` |
| Freshness | Available within 15 minutes of bronze |
| Failure response | Invalid amount goes to quarantine; missing key fails the update |

This separates a transformation from a guess. `coalesce(country, "UNKNOWN")`
is correct only if the business contract defines that category. Casting
`amount` is incomplete unless invalid cast results are measured and handled.

### Preserve evidence while improving quality

A useful pattern produces three observable outputs:

1. **Valid silver rows** that meet the contract.
2. **Quarantine rows** with the raw value, source identifier, failed rule, and ingestion time.
3. **Quality metrics** showing input, valid, rejected, and rescued counts.

The counts should reconcile. If 10,000 bronze rows produce 9,970 silver rows
and 20 quarantine rows, ten rows are unexplained. That reconciliation is often
more valuable than a transformation that merely completes successfully.

## 3.2 Joins and set operations

### Join semantics

| Operation | Rows preserved | Use |
|---|---|---|
| Inner join | Matching rows from both sides | Keep only facts with a valid match |
| Left outer join | Every left row plus matching right values | Enrich facts while preserving every fact |
| Broadcast join | Same logical join, but small side is copied to executors | Avoid shuffling a large table when one side is safely small |
| Multi-key join | Rows matching all specified key predicates | Match composite business keys |
| Cross join | Every left row paired with every right row | Deliberate Cartesian product, such as a small date/scenario scaffold |

```python
from pyspark.sql import functions as F

orders = spark.table("main.silver.orders").alias("o")
customers = spark.table("main.silver.customers").alias("c")

enriched = (
    orders.join(
        F.broadcast(customers),
        on=[
            F.col("o.customer_id") == F.col("c.customer_id"),
            F.col("o.country") == F.col("c.country"),
        ],
        how="left",
    )
    .select("o.*", F.col("c.segment").alias("customer_segment"))
)
```

Broadcast only when the smaller side fits safely in executor memory. The optimizer can broadcast automatically below `spark.sql.autoBroadcastJoinThreshold`; an explicit broadcast hint can override the size-based decision.

### `union`, `unionByName`, `UNION`, and `UNION ALL`

PySpark `DataFrame.union` combines rows by column position and does not remove duplicates. `unionByName` aligns columns by name and can optionally allow missing columns.

```python
combined = january.unionByName(february, allowMissingColumns=True)
```

In SQL:

- `UNION ALL` appends all rows.
- `UNION` removes duplicate result rows and therefore adds deduplication work.

Use `UNION ALL` unless the requirement explicitly needs duplicate elimination.

### Cross-join warning

If A has 1 million rows and B has 1,000 rows, the cross join has 1 billion rows. Cross join is valid only when the Cartesian product is intended and bounded.

### Trace row preservation with a tiny example

Customers contain IDs 1 and 2. Orders contain customer IDs 1 and 3:

| Operation | Result |
|---|---|
| Inner join | Only the order for customer 1 |
| Left join from orders | Both orders; customer columns are null for ID 3 |
| Left anti join from orders | Only the unmatched order for ID 3 |
| Left semi join from orders | Only the order whose customer ID exists, without customer columns |

Use this miniature trace when wording becomes confusing. Ask which input must
be preserved and whether columns from the other side are required.

### Logical result versus physical strategy

“Left join” answers which rows survive. “Broadcast” answers how Spark moves
data to execute that join. A broadcast hint does not turn a left join into an
inner join, and increasing shuffle partitions does not correct the wrong join
type.

Choose in this order:

1. Logical operation from the required rows and columns.
2. Join keys from the business relationship.
3. Physical strategy from size and runtime evidence.

This order eliminates distractors that offer a fast implementation of the
wrong result.

## 3.3 Shape columns and rows

### Common column operations

```python
from pyspark.sql import functions as F

shaped = (
    spark.table("main.bronze.customers_raw")
    .withColumn("full_name", F.concat_ws(" ", "first_name", "last_name"))
    .withColumn("email_domain", F.split("email", "@").getItem(1))
    .withColumnRenamed("id", "customer_id")
    .drop("temporary_note")
    .filter(F.col("is_active"))
)
```

### Exploding arrays

```python
orders = spark.table("main.bronze.orders_nested")

items = (
    orders
    .withColumn("item", F.explode("items"))
    .select(
        "order_id",
        F.col("item.sku").alias("sku"),
        F.col("item.quantity").alias("quantity"),
    )
)
```

`explode` creates one row per array element. `explode_outer` also preserves the parent when the input is null or empty. Pick based on row-preservation requirements.

### Rename before ambiguous joins

If both sides contain `name`, `status`, or `updated_at`, qualify or rename columns. An answer that uses unqualified duplicate names can create ambiguity even when the join keys are correct.

### Shape operations can change cardinality

Column operations such as rename, cast, split, and drop normally preserve row
count. Filters reduce rows. `explode` can multiply rows. A cross join can
multiply rows dramatically. Before and after each step, state:

```text
input grain → operation → output grain
```

For example:

```text
one row per order → explode(items) → one row per order item
```

If an order-level shipping charge remains on every item row, summing it after
the explode overcounts. Keep order measures at order grain, allocate them by an
explicit rule, or aggregate them before the row multiplication.

### Prefer explicit projections

After a join or nested transformation, select the intended columns explicitly.
This prevents duplicate keys, debug fields, and raw sensitive values from
leaking into silver or gold. It also makes the output contract readable:

```python
clean = joined.select(
    F.col("o.order_id"),
    F.col("o.order_ts"),
    F.col("c.segment").alias("customer_segment"),
)
```

## 3.4 Deduplication and aggregation

### Exact duplicate rows

```python
unique_rows = df.distinct()
```

### Duplicate business keys

```python
one_per_order = df.dropDuplicates(["order_id"])
```

`dropDuplicates(["order_id"])` does not promise which duplicate survives. If the requirement says “keep the most recent,” use a window:

```python
from pyspark.sql import Window, functions as F

w = Window.partitionBy("order_id").orderBy(
    F.col("updated_at").desc(),
    F.col("ingested_at").desc(),
)

latest = (
    df.withColumn("_rank", F.row_number().over(w))
      .filter(F.col("_rank") == 1)
      .drop("_rank")
)
```

Add a deterministic tie-breaker where possible.

### Aggregation

```python
summary = (
    spark.table("main.silver.orders")
    .groupBy("order_date", "country")
    .agg(
        F.count("*").alias("order_count"),
        F.countDistinct("customer_id").alias("exact_customers"),
        F.approx_count_distinct("customer_id").alias("approx_customers"),
        F.mean("amount").alias("mean_amount"),
    )
)
```

- `count("*")` counts rows.
- `count(column)` excludes null values in that column.
- `countDistinct` is exact and can require more work.
- `approx_count_distinct` trades bounded estimation error for scale.
- `mean` and `avg` are aliases.
- `df.summary()` returns descriptive statistics across selected columns.

Always confirm the grouping grain. A correct aggregate function at the wrong grain is still wrong.

### Make “latest” deterministic

Ordering only by `updated_at DESC` is ambiguous when two records share the same
timestamp. Add a stable secondary rule such as ingestion time, source sequence,
or version number. Document what happens when every ordering field ties.

Do not confuse these requirements:

- **Remove byte-for-byte duplicate rows:** `distinct`.
- **Keep one arbitrary row per key:** `dropDuplicates(keys)`.
- **Keep a specific winner per key:** window function with a complete ordering.
- **Merge source changes into a target:** a keyed `MERGE` design, not generic deduplication alone.

### Validate aggregates with invariants

Useful checks include:

- sum of grouped row counts equals the input row count when every row belongs to exactly one group;
- `count(column)` is never greater than `count(*)`;
- exact distinct count is not greater than total non-null rows;
- aggregate grain columns form the declared business key;
- totals before and after a join are compared when the join can duplicate facts.

An aggregate can execute successfully and still be wrong because the join
multiplied rows or the grouping omitted a dimension.

## 3.5 Tune and re-measure

The objective names four areas:

| Parameter | Influences | Symptom when poorly chosen |
|---|---|---|
| `spark.sql.shuffle.partitions` | Partitions created for SQL/DataFrame shuffles | Too few: large slow/spilling tasks; too many: scheduler overhead and tiny tasks |
| `spark.default.parallelism` | Default partition count for some RDD-derived and non-SQL operations | Under- or over-parallelized stages |
| Driver/executor memory | Capacity for plans/results on driver and working data on executors | Driver OOM, executor OOM, or disk spill |
| `spark.sql.autoBroadcastJoinThreshold` | Automatic broadcast eligibility | Missed broadcast or unsafe memory pressure |

### Tuning loop

1. Establish a baseline: duration, task distribution, shuffle read/write, spill, input size.
2. Locate the slow stage in Spark UI or query profile.
3. Form one hypothesis.
4. Change one relevant parameter or data shape.
5. Run the same workload and input.
6. Compare to the baseline.
7. Keep or revert based on evidence.

```python
baseline_partitions = spark.conf.get("spark.sql.shuffle.partitions")
spark.conf.set("spark.sql.shuffle.partitions", "400")

# Run and measure the same workload.

spark.conf.set("spark.sql.shuffle.partitions", baseline_partitions)
```

Adding memory does not fix every bottleneck:

- One task far slower than peers often means skew.
- High shuffle volume can require join/filter/partition changes.
- Disk spill can indicate insufficient memory per task or oversized partitions.
- Many tiny tasks can mean too many partitions.

Adaptive Query Execution can coalesce shuffle partitions and split some skewed partitions at runtime, but the exam still expects you to interpret the evidence.

### Worked diagnosis sequence

Suppose a stage has 400 tasks:

- median duration: 8 seconds;
- maximum duration: 7 minutes;
- one partition reads 18 GB while the median reads 220 MB;
- most tasks do not spill, but the straggler spills heavily.

The primary evidence is skew, not simply “too few partitions.” Increasing the
global partition count can leave the hot key concentrated in one partition.
Investigate the key distribution, filter earlier, broadcast the safely small
side, let AQE split skewed partitions where applicable, or salt the hot key
when necessary.

Now change the evidence: all 8 partitions are 9 GB and all spill similarly.
That is broad per-task pressure. Increasing justified parallelism or reducing
row width is more relevant than skew salting.

### Compare like with like

A valid before/after test holds constant:

- input snapshot and volume;
- code except for the tested change;
- compute type and size;
- cache state where practical;
- success criteria and output row counts.

Normalize duration by input volume when volume changed. A job that takes twice
as long for three times the input may have improved throughput even though raw
duration increased.

## 3.6 Choose the gold object

| Object | Stores data? | Refresh/compute behavior | Best fit |
|---|---|---|---|
| Table | Yes | Changed by explicit writes | Durable fact/dimension or independently managed output |
| View | No result storage | Query is recomputed when used | Lightweight abstraction over current source data |
| Materialized view | Cached results | Pipeline refreshes, often incrementally when possible | Repeated aggregates or transformations needing faster reads |
| Streaming table | Yes, incrementally maintained | One or more streaming flows append/update it | Ingestion and incremental processing of an unbounded source |

### Examples

- Daily executive sales summary read many times: materialized view.
- Stable customer dimension maintained with batch logic: table.
- Security/semantic projection that should always reflect source: view.
- Continuously arriving events: streaming table.

Gold design should match consumer grain and performance. “Gold” does not mean every object must be an aggregate; it means business-ready.

### Ask four object-selection questions

1. Must the result be physically stored?
2. Should consumers see source changes immediately or only after a controlled refresh?
3. Is the input bounded batch data or an unbounded stream?
4. Is repeated query cost high enough to justify stored, maintained results?

A standard view is attractive for current lightweight logic, but every query
recomputes it. A materialized view trades storage and refresh work for faster
repeated reads. A streaming table is not simply a faster table; it expresses
incremental maintenance from streaming inputs.

### Gold still needs a contract

For a metric such as revenue, document:

- business definition and exclusions;
- grain and dimensions;
- currency and time zone;
- late-arriving-data policy;
- refresh or streaming behavior;
- owner and freshness expectation.

Two technically correct SQL queries can produce different “revenue” because
one includes refunds or uses order time while another uses settlement time.

## 3.7 Data quality

### Delta constraints

Delta supports enforced `NOT NULL` and `CHECK` constraints. A violating write fails.

```sql
CREATE TABLE main.silver.payments (
  payment_id BIGINT NOT NULL,
  amount DECIMAL(12,2),
  status STRING,
  CONSTRAINT valid_amount CHECK (amount >= 0)
) USING DELTA;
```

Primary-key, foreign-key, and unique constraints are informational rather than enforced. Do not claim they prevent duplicates.

### Pipeline expectations

Expectations evaluate a Boolean rule for each record and select an action:

- **Warn:** write invalid records and emit metrics
- **Drop:** remove invalid records and emit metrics
- **Fail:** stop the update

```sql
CREATE OR REFRESH STREAMING TABLE main.silver.valid_orders (
  CONSTRAINT positive_amount EXPECT (amount >= 0) ON VIOLATION DROP ROW,
  CONSTRAINT order_id_present EXPECT (order_id IS NOT NULL) ON VIOLATION FAIL UPDATE
)
AS
SELECT * FROM STREAM(main.bronze.orders_raw);
```

Choose the response from business impact:

- Warn when preserving all raw data is essential and downstream can tolerate flagged records.
- Drop when invalid rows are expected and must not propagate.
- Fail when any invalid row signals a critical contract breach.
- Quarantine when you must keep invalid records for repair without mixing them into clean output.

### Layer quality controls

Use the control that owns the failure boundary:

- Bronze preserves source evidence and ingestion metadata.
- Silver applies type, key, domain, and deduplication rules.
- Delta constraints protect a table from violating writes regardless of the calling notebook.
- Pipeline expectations add row-level actions and metrics inside a Lakeflow pipeline.
- Gold validates business rules and reconciles published measures.

A notebook filter protects only the path that runs that notebook. A persistent
table constraint protects every compatible writer. An expectation in a
different pipeline does not govern writes it never evaluates.

### Quality observability

Track more than pass/fail:

| Metric | What it reveals |
|---|---|
| Invalid rows by rule | Which contract is failing |
| Invalid rate over time | Whether quality is deteriorating relative to volume |
| Rescued-data rate | Upstream schema drift |
| Quarantine age | Whether repair work is accumulating |
| Reconciliation difference | Silent loss or duplication between layers |
| Freshness | A technically valid dataset that arrived too late |

Quality rules without metrics can silently discard data. Metrics without an
owner and response threshold become decorative.

## Exam traps

- A left join preserves left rows; an inner join does not.
- A broadcast hint changes physical execution, not logical join semantics.
- PySpark `union` is positional and does not deduplicate.
- SQL `UNION` removes duplicates; `UNION ALL` does not.
- `dropDuplicates(keys)` cannot guarantee the latest row.
- `explode` changes row count.
- `count(column)` ignores nulls.
- Increasing partitions, threshold, or memory without evidence is not optimization.
- A view does not cache results; a materialized view does.
- Informational primary keys do not enforce uniqueness.
- Expectations and table constraints are related but have different actions and observability.

## Hands-on task

Complete labs 4–6:

1. Clean a bronze table into silver.
2. Left join a small dimension with broadcast.
3. Explode a nested items array.
4. Keep the latest event per key with a window.
5. Create a gold aggregate.
6. Add a `CHECK` constraint and a pipeline expectation.
7. Record baseline and adjusted shuffle behavior.

## Repair prompt

> I missed objective [3.x]. State the required row preservation, grain, refresh behavior, or performance symptom. Trace the input and output rows for the correct operation, show a minimal SQL or PySpark example, and explain the exact failure mode of each distractor. Cite official Databricks docs.

## Official references

- [Medallion architecture](https://docs.databricks.com/aws/en/lakehouse/medallion)
- [`explode`](https://docs.databricks.com/aws/en/pyspark/reference/functions/explode)
- [Spark UI debugging](https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui)
- [Materialized views](https://docs.databricks.com/aws/en/ldp/materialized-views)
- [Delta constraints](https://docs.databricks.com/aws/en/tables/constraints)
- [Pipeline expectations](https://docs.databricks.com/aws/en/ldp/expectations)
- [Section 3 Diagnostic](../../assessments/diagnostics/section-03-diagnostic.md)
