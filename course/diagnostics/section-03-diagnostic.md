# Section 3 Diagnostic — Data Transformation and Modeling

### D01
<!-- meta: objective=3.1; answer=B -->
**Question:** A bronze row has an invalid numeric string. Silver must preserve the row for repair without failing the entire query. Which expression is most suitable?

A. `cast(value AS DECIMAL)` with no error strategy  
B. `try_cast(value AS DECIMAL)` plus quarantine logic  
C. Replace every invalid value with zero  
D. Drop the bronze table

**Rationale:** `try_cast` yields null for invalid input, enabling explicit quarantine or quality handling.

**Reference:** [Medallion architecture](https://docs.databricks.com/aws/en/lakehouse/medallion)

### D02
<!-- meta: objective=3.2; answer=C -->
**Question:** All order rows must remain even when no customer dimension row matches. Which join is required?

A. Inner  
B. Cross  
C. Left outer  
D. Left semi

**Rationale:** A left outer join preserves all rows from the left DataFrame.

**Reference:** [Spark SQL joins](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-join)

### D03
<!-- meta: objective=3.2; answer=A -->
**Question:** A 4 MB dimension is joined to a 2 TB fact table. Which optimization can avoid shuffling the fact table if executor memory is sufficient?

A. Broadcast the dimension.  
B. Cross join the tables.  
C. Reduce driver memory.  
D. Use SQL `UNION`.

**Rationale:** Broadcasting the safely small dimension makes it available on executors and can avoid a large shuffle.

**Reference:** [Join hints](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-hints)

### D04
<!-- meta: objective=3.2; answer=D -->
**Question:** Which statement about PySpark `DataFrame.union` is correct?

A. It aligns columns by name and removes duplicates.  
B. It performs an inner join.  
C. It requires identical row values.  
D. It aligns by position and keeps duplicates.

**Rationale:** PySpark `union` is positional and has SQL `UNION ALL` semantics.

**Reference:** [Set operators](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-setops)

### D05
<!-- meta: objective=3.3; answer=C -->
**Question:** What does `explode(items)` do to an array column?

A. Converts the array to a JSON string.  
B. Removes duplicate array items only.  
C. Produces one output row per array element.  
D. Sorts the array in place.

**Rationale:** `explode` is a generator that creates a row for each array element.

**Reference:** [`explode`](https://docs.databricks.com/aws/en/pyspark/reference/functions/explode)

### D06
<!-- meta: objective=3.4; answer=B -->
**Question:** A table has multiple versions of each key and must retain the row with the latest `updated_at`. Which approach is deterministic?

A. `dropDuplicates(["key"])` alone  
B. `row_number` over a key partition ordered by timestamp descending  
C. `distinct()`  
D. `approx_count_distinct`

**Rationale:** A window specifies which duplicate survives; `dropDuplicates` does not promise the latest.

**Reference:** [Window functions](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-window-functions)

### D07
<!-- meta: objective=3.4; answer=A -->
**Question:** Which aggregate trades a small estimation error for more scalable distinct counting?

A. `approx_count_distinct`  
B. `mean`  
C. `count("*")`  
D. `summary`

**Rationale:** Approximate distinct counting reduces the cost of exact cardinality at scale.

**Reference:** [PySpark functions](https://docs.databricks.com/aws/en/pyspark/reference/functions/approx_count_distinct)

### D08
<!-- meta: objective=3.5; answer=D -->
**Question:** A stage has very large tasks and disk spill. What is the best first tuning procedure?

A. Increase every memory setting and do not re-run.  
B. Reduce shuffle partitions.  
C. Change the runtime, data, and code simultaneously.  
D. Capture a baseline, adjust a relevant partition/data-shape factor, and re-measure the same workload.

**Rationale:** Evidence-based tuning changes one relevant factor and compares the same workload to a baseline.

**Reference:** [Spark UI](https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui)

### D09
<!-- meta: objective=3.6; answer=C -->
**Question:** Analysts repeatedly query a costly daily aggregate and need fast reads after scheduled refreshes. Which object best fits?

A. Standard view  
B. Temporary view  
C. Materialized view  
D. Raw bronze table

**Rationale:** A materialized view caches query results and refreshes them, improving repeated read performance.

**Reference:** [Materialized views](https://docs.databricks.com/aws/en/ldp/materialized-views)

### D10
<!-- meta: objective=3.7; answer=B -->
**Question:** A critical key must never be null; any violation should stop a pipeline update. Which expectation action fits?

A. Warn  
B. Fail update  
C. Drop the column  
D. Approximate the key

**Rationale:** `ON VIOLATION FAIL UPDATE` prevents the update from succeeding when the critical contract is broken.

**Reference:** [Expectations](https://docs.databricks.com/aws/en/ldp/expectations)

