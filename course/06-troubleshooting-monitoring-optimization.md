# Section 6 — Troubleshooting, Monitoring, and Optimization

**Exam weight:** 10%  
**Official objectives:** 5  
**Mock allocation:** 4 of 45 questions

## Orientation

1. **Objective 6.1:** Compare current job duration and phases against prior successful runs before declaring a regression.
2. **Objective 6.2:** Read job status, task DAG, run times, and failure history to find the first upstream failure or recurring health trend.
3. **Objective 6.3:** Use stage and task distributions in Spark UI to distinguish skew, excessive shuffle, and disk spill.
4. **Objective 6.4:** Explain how liquid clustering and predictive optimization reduce manual table-layout maintenance.
5. **Objective 6.5:** Triage cluster-start, library, driver-memory, and executor-memory failures from the appropriate logs and metrics.

## 6.1 Use a baseline before changing anything

A single slow run does not identify a cause. Compare it with similar successful runs:

- Same job and task
- Similar input volume
- Same code revision
- Same compute/runtime
- Same trigger and parameters

Inspect:

- Total duration
- Setup, queue, execution, and cleanup phases when available
- Per-task duration
- Success, failure, timeout, skip, and cancellation history
- Input size and record/file count
- Recent code, data, runtime, library, or compute changes

If setup time increased but execution stayed stable, changing shuffle partitions is unrelated. If queue time increased, inspect concurrency and capacity. If one transformation task doubled while upstream volume grew tenfold, the change might be expected rather than a regression.

## 6.2 Read the Lakeflow Jobs UI

### Status-first triage

1. Open the failed or slow run.
2. Inspect the DAG.
3. Find the earliest failed or blocked upstream task.
4. Open its task details, output, logs, and parameters.
5. Compare its history to a successful run.
6. Inspect downstream statuses only after explaining the upstream failure.

Typical outcomes:

- **Succeeded:** all leaf tasks succeeded.
- **Succeeded with failures:** some tasks failed, but leaf tasks satisfied the configured flow.
- **Failed:** at least one leaf task failed.
- **Skipped:** run or task did not execute, for example due to a concurrency limit or run condition.
- **Timed Out:** runtime exceeded the configured limit.
- **Canceled:** a user or platform action canceled the run.

A downstream task can be skipped because an upstream dependency failed; the skip is a symptom, not the root cause.

### Trend questions

Track:

- Median and high-percentile duration, not only averages
- Failure rate by task
- Retry rate
- Input volume normalized duration
- Day/time patterns
- Runtime or code-version changes

Run history answers “is this abnormal?” Logs and Spark/query execution evidence answer “why?”

## 6.3 Diagnose Spark work

### Skew

Evidence:

- Most tasks finish quickly, but one or a few run much longer.
- Maximum shuffle read is many times the median.
- Stragglers dominate stage duration.

Likely response:

- Confirm Adaptive Query Execution skew handling.
- Repartition or salt a heavily skewed key when automatic handling is insufficient.
- Filter earlier.
- Broadcast a genuinely small join side.
- Reconsider the join key or data model.

Adding more workers does not divide one oversized partition automatically.

### Excessive shuffle

Shuffles move data across executors for joins, aggregates, repartitions, distinct operations, and sorts.

Evidence:

- Large shuffle read/write relative to useful output
- Long exchange stages
- Many network/disk bytes
- Repeated repartitions or wide transformations

Responses:

- Project and filter before the shuffle.
- Avoid unnecessary `distinct`, `orderBy`, and repartition operations.
- Broadcast a safe small dimension.
- Align partitioning with repeated operations where justified.
- Tune `spark.sql.shuffle.partitions` from observed partition sizes.

Shuffle is not automatically a bug. The goal is to eliminate unnecessary movement and size necessary movement sensibly.

### Disk spill

Spark spills when in-memory execution structures do not fit.

Evidence:

- Nonzero memory or disk spill metrics
- Large partitions
- High executor memory pressure or garbage collection
- Executor loss or out-of-memory failures

Responses:

- Increase parallelism so each task processes less data.
- Reduce row width before the operation.
- Address skew.
- Avoid collecting or caching unnecessary data.
- Increase appropriate executor memory only after fixing data-shape problems where possible.

### Driver versus executor OOM

**Driver OOM** often follows:

- `collect()` or `toPandas()` on large data
- Very large query plans
- Excessive task or file metadata
- Large local Python objects
- Overly large notebook results

**Executor OOM** often follows:

- Oversized partitions
- Skewed joins
- Large broadcast data
- Memory-heavy aggregation or caching
- UDF memory pressure

Choose a fix for the component that failed. Increasing driver memory does not repair executor OOM.

### Serverless distinction

Classic all-purpose and job compute expose Spark UI and compute metrics. Serverless notebooks and jobs use query insights and query profiles; Spark UI is not available. Read the compute type before choosing a troubleshooting interface.

## 6.4 Liquid clustering

Liquid clustering is a data-layout technique that replaces rigid partitioning and `ZORDER` for many Databricks tables.

Benefits:

- Clustering keys can change as access patterns change.
- Data is colocated for data skipping without directory partition design.
- Incremental `OPTIMIZE` reclusters data as needed.
- It works with streaming tables and materialized views.
- Automatic liquid clustering can choose keys from query patterns.

```sql
CREATE TABLE main.gold.orders_by_customer
CLUSTER BY (customer_id, order_date)
AS SELECT * FROM main.silver.orders;

ALTER TABLE main.gold.orders_by_customer
CLUSTER BY (country, order_date);

OPTIMIZE main.gold.orders_by_customer;
```

Choose keys frequently used in filters. More keys are not automatically better. Liquid clustering is not compatible with traditional partitioning or `ZORDER` on the same table.

Current guidance recommends liquid clustering for new tables, particularly for:

- High-cardinality filters
- Skewed data
- Fast-growing tables
- Changing query patterns
- Tables that are awkward to partition

## 6.5 Predictive optimization

Predictive optimization automatically runs maintenance on Unity Catalog managed tables:

- `OPTIMIZE` for file layout and incremental clustering
- `VACUUM` for obsolete file cleanup
- `ANALYZE` for query-planning statistics

It reduces scheduled-maintenance code and adapts work to observed needs. Automatic liquid clustering depends on predictive optimization for key selection and maintenance.

Critical boundary: predictive optimization applies to eligible **Unity Catalog managed tables**, not arbitrary external tables whose lifecycle you manage.

If predictive optimization manages `OPTIMIZE`, do not keep redundant scheduled optimize jobs.

## 6.6 Cluster startup failures

Use the compute event log and failure message.

Common categories:

- Cloud capacity or quota
- Instance/role permissions
- Storage or metastore access
- Network or control-plane reachability
- Invalid compute policy/configuration
- Failing init script
- Library installation failure
- Unsupported runtime or node type

Do not debug transformation code when the cluster never started.

### Startup triage

1. Read the exact event-log message and failure code.
2. Determine whether nodes launched.
3. Inspect cloud permissions, quota, and network only if the message points there.
4. Inspect init-script and library installation logs if bootstrap failed.
5. Compare to a recently successful cluster definition.
6. Retry only when the cause can be transient.

## 6.7 Library conflicts

Symptoms:

- Import resolves an unexpected version.
- A package installation fails due to incompatible dependencies.
- Code works interactively but fails in a job.
- Driver and executors have inconsistent availability.

Responses:

- Pin compatible versions.
- Remove duplicate cluster-, task-, and notebook-scoped installs.
- Use a clean environment or job environment.
- Align runtime and library compatibility.
- Reproduce with the same compute and dependency definition as production.

“Install one more version” can worsen the conflict.

## Evidence-to-action table

| Evidence | Most likely category | First action |
|---|---|---|
| One task 20× median, max shuffle 12× median | Skew | Inspect key distribution and AQE skew handling |
| Every task slows and input is 8× larger | Volume/scale | Normalize duration and inspect stage scaling |
| High disk spill across many tasks | Partition/memory pressure | Reduce per-task data and row width; then consider memory |
| Driver lost after `collect()` | Driver OOM | Remove collection or bound the result |
| Job setup time rises, execution stable | Startup/setup | Inspect compute startup, libraries, queue, and setup phase |
| Downstream tasks skipped | Upstream or run condition | Inspect first failed dependency |
| Queries repeatedly filter high-cardinality customer ID | Data layout | Consider liquid clustering on the filter key |
| Managed tables have manual optimize/vacuum schedules | Maintenance duplication | Enable/verify predictive optimization and remove redundant jobs |

## Exam traps

- Averages hide skew; compare max, median, and distribution.
- More executors do not split one skewed partition.
- Fewer shuffle partitions can increase spill.
- More memory is not the first answer to every performance problem.
- A skipped task can be caused by an upstream failure.
- Run history finds trends; Spark UI/query profile finds execution bottlenecks.
- Liquid clustering is not used together with partitioning or `ZORDER`.
- Predictive optimization is for eligible Unity Catalog managed tables.
- Serverless uses query insights/profile, not Spark UI.

## Hands-on task

Complete lab 9:

1. Run an aggregation or join with a deliberately skewed key.
2. Capture stage duration, task max/median, shuffle, and spill.
3. Apply one justified change.
4. Re-run with the same input.
5. Record the before/after evidence.
6. Inspect a table's clustering and predictive-optimization settings.

## Repair prompt

> I missed objective [6.x]. Separate the observed symptom from the inferred cause. Identify the exact UI, metric, or log that supports the cause, then choose the smallest relevant fix and define the before/after measurement. Cite current official Databricks docs.

## Official references

- [Monitor Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)
- [Debugging with Spark UI](https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui)
- [View compute metrics](https://docs.databricks.com/aws/en/compute/cluster-metrics)
- [Troubleshoot compute](https://docs.databricks.com/aws/en/compute/troubleshooting/)
- [Liquid clustering](https://docs.databricks.com/aws/en/delta/clustering)
- [Predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)
- [Section 6 Diagnostic](diagnostics/section-06-diagnostic.md)

