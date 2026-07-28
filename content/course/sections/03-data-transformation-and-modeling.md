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
