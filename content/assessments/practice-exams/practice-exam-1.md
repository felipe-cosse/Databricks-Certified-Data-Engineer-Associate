# Practice Exam 1 — Foundation and Selection

**Questions:** 45
**Time:** 90 minutes
**Format:** One best answer
**Blueprint:** 3 / 9 / 10 / 7 / 5 / 4 / 7

Complete all questions before reading the rationales embedded below each item. The interactive site hides answers until submission.

### Q01
<!-- meta: section=2; objective=2.4; answer=A; source=https://docs.databricks.com/aws/en/ingestion/lakeflow-connect -->
**Question:** A supported CRM must be ingested with source-aware incremental reads, automatic retries, schema evolution, and minimal code. Which method is most appropriate?

A. Lakeflow Connect managed connector
B. A scheduled JDBC full snapshot maintained by the team
C. Lakehouse Federation, leaving the data in the CRM
D. A custom notebook that implements source-specific CDC and retries

**Rationale:** All four can access data in some circumstances, but the managed connector is the only choice that directly satisfies durable ingestion, source-aware increments, and minimal maintenance.

### Q02
<!-- meta: section=3; objective=3.1; answer=A; source=https://docs.databricks.com/aws/en/data-engineering/ -->
**Question:** A silver pipeline receives invalid amount strings. The team must preserve bad records for repair while producing typed valid records. Which approach is best?

A. Use `try_cast`, route null cast results to quarantine, and publish valid rows to silver.
B. Replace every bad amount with zero.
C. Drop the bronze source.
D. Use `collect()` and fix values manually.

**Rationale:** `try_cast` supports explicit validation and quarantine without inventing values or losing raw data.

### Q03
<!-- meta: section=5; objective=5.1; answer=D; source=https://docs.databricks.com/aws/en/repos/git-folders-concepts -->
**Question:** A developer finishes a feature in a Databricks Git folder. What is the next collaboration path?

A. Edit production directly.
B. Merge the feature branch locally and bypass the remote review policy.
C. Export the notebook and attach it to a production change request.
D. Commit and push the branch, then open a pull request in the Git provider.

**Rationale:** Git folders support branch work; the remote provider handles PR review and merge.

### Q04
<!-- meta: section=4; objective=4.2; answer=B; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A job must run an existing Lakeflow pipeline update after a notebook prepares configuration. Which downstream task type should it use?

A. Notebook task that invokes the pipeline API itself
B. Pipeline task
C. SQL task that queries the pipeline event log
D. Run Job task pointed at a separate orchestration job

**Rationale:** A pipeline task runs an existing Lakeflow pipeline as part of the Jobs DAG.

### Q05
<!-- meta: section=2; objective=2.2; answer=C; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into -->
**Question:** A `COPY INTO` load succeeded, but the notebook lost its connection before recording success. What should the engineer do?

A. Delete the target table before retrying.
B. Rename every source file.
C. Re-run the same command because loaded files are tracked by default.
D. Append all source files with a DataFrame write.

**Rationale:** `COPY INTO` is retryable and idempotent for previously processed files by default.

### Q06
<!-- meta: section=7; objective=7.1; answer=C; source=https://docs.databricks.com/aws/en/tables/types -->
**Question:** A table must reference existing Parquet files whose lifecycle remains owned by another platform. Which table type fits?

A. Managed table
B. Temporary table
C. External table
D. Materialized view

**Rationale:** External tables register user-managed cloud files while Unity Catalog manages metadata.

### Q07
<!-- meta: section=4; objective=4.1; answer=C; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A validation task emits `valid=false`. The job must run an alert instead of transformation. Which control best represents this?

A. A dependency cycle
B. A success-only dependency on transformation
C. An If/else task with true and false branches
D. A retry policy on validation

**Rationale:** If/else routes execution according to the validation result.

### Q08
<!-- meta: section=2; objective=2.3; answer=B; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/ -->
**Question:** Auto Loader scans a path containing tens of millions of files. Cloud listing calls have become expensive. Which change best targets the issue?

A. Keep directory listing mode but run it less frequently.
B. Enable managed file events where supported.
C. Wrap the same directory-listing stream in a Jobs file-arrival trigger.
D. Start each run with a new checkpoint and schema location.

**Rationale:** Managed file events directly replace repeated large listings with event-based discovery. A trigger changes when a job starts, not how Auto Loader discovers files.

### Q09
<!-- meta: section=3; objective=3.2; answer=B; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A fact table must retain every transaction while adding a segment from a customer dimension when available. Which join is required?

A. Inner
B. Left outer
C. Cross
D. Left anti

**Rationale:** A left outer join preserves all fact rows and adds matching dimension attributes.

### Q10
<!-- meta: section=1; objective=1.2; answer=C; source=https://docs.databricks.com/aws/en/compute/ -->
**Question:** A team of analysts runs concurrent ad hoc SQL against governed Delta tables throughout the day. They want rapid startup and minimal infrastructure management. Which compute should they select?

A. A single-node personal cluster
B. Classic job compute for every query
C. A serverless SQL warehouse
D. A dedicated R notebook cluster

**Rationale:** SQL warehouses are designed for SQL analytics and concurrency; serverless provides fast, managed elasticity.

### Q11
<!-- meta: section=5; objective=5.2; answer=B; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** Dev and prod use different catalog names. Where should the difference be expressed?

A. In duplicated business-logic files
B. Bundle variables and target overrides
C. In a committed secret
D. In a manual post-deploy edit

**Rationale:** Targets parameterize environment configuration while preserving one codebase.

### Q12
<!-- meta: section=6; objective=6.1; answer=B; source=https://docs.databricks.com/aws/en/jobs/monitor -->
**Question:** A run's total duration increased, but execution time is unchanged and setup time tripled. Where should investigation focus?

A. The longest Spark stage and its shuffle partitions
B. Compute startup, libraries, queue, and setup changes
C. Target-table file size and clustering keys
D. The downstream dashboard refresh interval

**Rationale:** The phase comparison localizes the regression to setup rather than query execution.

### Q13
<!-- meta: section=3; objective=3.2; answer=D; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A 6 MB country dimension is joined to a multi-terabyte event table. Which physical strategy can avoid shuffling the large table?

A. `UNION`
B. Cross join
C. Repartition both to one partition
D. Broadcast the country dimension

**Rationale:** Broadcasting a safely small dimension can remove the large-side shuffle.

### Q14
<!-- meta: section=4; objective=4.1; answer=A; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** The same notebook must process a bounded list of 20 source tables. Which feature should the job use?

A. For each with controlled concurrency
B. An If/else branch per table hard-coded into the DAG
C. A Run Job task that starts the same parent job recursively
D. Twenty independent scheduled copies of the notebook

**Rationale:** For each runs a nested task per item without violating DAG acyclicity.

### Q15
<!-- meta: section=6; objective=6.3; answer=C; source=https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui -->
**Question:** Most tasks finish in 20 seconds, one runs for 9 minutes, and its shuffle read is 15 times the median. What is the best diagnosis?

A. A uniformly undersized shuffle partition count
B. Driver OOM before any stage launches
C. Data skew
D. Evenly distributed disk spill across every task

**Rationale:** The straggler and max-to-median shuffle imbalance show an oversized partition.

### Q16
<!-- meta: section=7; objective=7.1; answer=A; source=https://docs.databricks.com/aws/en/tables/types -->
**Question:** A Unity Catalog external table is dropped accidentally. What remains?

A. The underlying cloud files
B. The table metadata only
C. Neither data nor metadata
D. A managed-table copy

**Rationale:** Dropping an external table removes metadata but does not delete user-managed data.

### Q17
<!-- meta: section=2; objective=2.3; answer=D; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/ -->
**Question:** An Auto Loader stream must remember its input schema across restarts and track future schema changes. Which option should be configured?

A. `checkpointLocation`
B. `cloudFiles.schemaHints`
C. `cloudFiles.inferColumnTypes`
D. `cloudFiles.schemaLocation`

**Rationale:** Schema location stores inferred schema history; checkpoint location stores streaming progress.

### Q18
<!-- meta: section=4; objective=4.3; answer=D; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** A vendor drops a file at unpredictable times. The SLA starts when the file arrives. Which trigger is best?

A. Daily schedule
B. Manual trigger
C. Table update on the target
D. File arrival

**Rationale:** File arrival models the real source event and avoids empty scheduled runs.

### Q19
<!-- meta: section=3; objective=3.2; answer=C; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** Two PySpark DataFrames contain the same named columns in different orders. Which operation appends rows using names rather than positions?

A. `join`
B. `union`
C. `unionByName`
D. `intersect`

**Rationale:** `unionByName` aligns columns by name; plain `union` is positional.

### Q20
<!-- meta: section=4; objective=4.4; answer=B; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** A finance report must refresh at 07:00 every weekday regardless of upstream changes. Which trigger should be used?

A. File arrival
B. Scheduled
C. Table update
D. For each

**Rationale:** The requirement is explicitly clock-based.

### Q21
<!-- meta: section=3; objective=3.3; answer=A; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** One order row contains an array of five line items. Which operation creates five line-item rows?

A. `explode`
B. `transform`
C. `element_at`
D. `array_distinct`

**Rationale:** `explode` emits one row per array element.

### Q22
<!-- meta: section=7; objective=7.2; answer=D; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/ -->
**Question:** A group has `SELECT` on a table but no access to its parent containers. Which grants are required?

A. `MODIFY` and `MANAGE`
B. `CREATE TABLE` and ownership
C. `READ VOLUME` and `WRITE VOLUME`
D. `USE CATALOG` and `USE SCHEMA`

**Rationale:** The group must traverse the Unity Catalog hierarchy before using the table privilege.

### Q23
<!-- meta: section=1; objective=1.1; answer=B; source=https://docs.databricks.com/aws/en/lakehouse-architecture/reference -->
**Question:** A regulated pipeline needs reliable rollback after a bad write, table history for audit, and consistent governed access across workspaces. Which combination directly provides those capabilities?

A. CSV files plus Git folders
B. Delta Lake plus Unity Catalog
C. Lakeflow Jobs plus a dashboard
D. Auto Loader plus an all-purpose cluster

**Rationale:** Delta Lake supplies transactions/history, while Unity Catalog supplies unified governance and lineage.

### Q24
<!-- meta: section=3; objective=3.4; answer=D; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** Multiple updates exist per account. The latest `updated_at` row must survive. Which solution is correct?

A. `distinct()`
B. `dropDuplicates(["account_id"])` with no ordering
C. `approx_count_distinct`
D. `row_number` over account ordered by `updated_at DESC`, then keep rank 1

**Rationale:** The window explicitly chooses the latest row; generic deduplication does not.

### Q25
<!-- meta: section=2; objective=2.5; answer=A; source=https://docs.databricks.com/aws/en/connect/ -->
**Question:** A niche SaaS API has no supported connector. It uses cursor pagination and rate limits. Which design is strongest?

A. A Jobs-orchestrated REST notebook with secret-based auth, persisted cursor state, retry/backoff, and idempotent bronze writes
B. A REST notebook that keeps the next cursor only in driver memory
C. A REST notebook that embeds a long-lived bearer token and retries every status immediately
D. A paginated REST notebook that advances durable cursor state before its bronze commit

**Rationale:** Custom API ingestion owns paging, state, retries, security, and idempotence; the correct design makes those responsibilities durable and coordinates state with committed output.

### Q26
<!-- meta: section=3; objective=3.4; answer=B; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A dashboard needs the number of rows including rows whose `customer_id` is null. Which expression fits?

A. `count(customer_id)`
B. `count(*)`
C. `mean(customer_id)`
D. `approx_count_distinct(customer_id)`

**Rationale:** `count(*)` counts rows, while `count(customer_id)` excludes null customer IDs.

### Q27
<!-- meta: section=6; objective=6.4; answer=A; source=https://docs.databricks.com/aws/en/optimizations/ -->
**Question:** A new managed table is filtered frequently by high-cardinality customer IDs and query patterns may change. Which layout strategy is recommended?

A. Liquid clustering
B. Static partitioning on the high-cardinality customer ID
C. `ZORDER` plus liquid clustering simultaneously
D. Unclustered storage with a recurring full-table `OPTIMIZE`

**Rationale:** Liquid clustering supports high-cardinality filtering and evolving keys and replaces partitioning/Z-order on its table.

### Q28
<!-- meta: section=2; objective=2.6; answer=C; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** Five years of Parquet files already exist in a governed volume and must be loaded once. No new arrivals are expected. Which solution is simplest?

A. Auto Loader with `AvailableNow` and a permanent checkpoint
B. A batch DataFrame read followed by an append write
C. `COPY INTO`
D. A notebook that lists and compares filenames manually

**Rationale:** Several choices can move the data, but `COPY INTO` provides the simplest SQL-native, retryable file-load history for a bounded backfill.

### Q29
<!-- meta: section=7; objective=7.2; answer=B; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/ -->
**Question:** Which statement about `DENY SELECT` is correct for a Unity Catalog table?

A. It is the preferred override for inherited grants.
B. It is unsupported; `DENY` applies to legacy `hive_metastore`.
C. It converts the table to managed.
D. It applies only to dashboards.

**Rationale:** Unity Catalog uses grants/revokes and fine-grained controls; SQL `DENY` is legacy Hive-metastore behavior.

### Q30
<!-- meta: section=5; objective=5.3; answer=C; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** Which current feature packages source files and resource definitions for repeatable deployment?

A. Databricks Repos
B. A Git folder alone
C. Declarative Automation Bundles
D. A Jobs UI configuration exported after each deployment

**Rationale:** Bundles define code and Databricks resources as a deployable project.

### Q31
<!-- meta: section=2; objective=2.7; answer=B; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** Auto Loader receives evolving JSON with new fields and occasional type mismatches. The pipeline must retain unexpected values for later repair while keeping stable fields queryable. Which design best fits?

A. Use `addNewColumns` and silently discard every value that conflicts with an existing type.
B. Define stable fields, keep a schema location, and route unexpected fields or type mismatches to `_rescued_data`.
C. Use a strict schema and delete every file that stops the stream.
D. Re-infer the entire history into a replacement table on every arrival.

**Rationale:** Rescued data preserves fields and mismatched values outside the active schema while stable columns remain typed. New-column evolution alone does not solve type conflicts.

### Q32
<!-- meta: section=1; objective=1.2; answer=D; source=https://docs.databricks.com/aws/en/compute/ -->
**Question:** A Python job requires a compute-scoped init script and a custom Spark data-source extension. Which choice best fits?

A. Serverless SQL warehouse
B. Serverless notebook compute
C. Serverless jobs with default settings
D. Classic job compute with compatible configuration

**Rationale:** Serverless compute restricts compute-scoped init scripts and custom Spark extensions; classic compute exposes these controls.

### Q33
<!-- meta: section=6; objective=6.5; answer=D; source=https://docs.databricks.com/aws/en/compute/troubleshooting/ -->
**Question:** Executors fail with OOM during a skewed aggregation while the driver remains healthy. Which response best targets the problem?

A. Increase driver memory.
B. Raise executor memory without checking task input distribution.
C. Increase shuffle partitions without confirming whether the hot key remains concentrated.
D. Address skew and reduce data per executor task before considering executor memory.

**Rationale:** The failure is executor-side and tied to oversized partitions; driver memory is unrelated.

### Q34
<!-- meta: section=5; objective=5.4; answer=A; source=https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands -->
**Question:** Which sequence correctly checks configuration, applies resources, and starts a job?

A. `bundle validate` → `bundle deploy` → `bundle run`
B. `bundle summary` → `bundle run` → `bundle deploy`
C. `bundle deploy` → `bundle validate` → `bundle run`
D. `bundle validate` → `bundle run` → `bundle deploy`

**Rationale:** Validate checks, deploy applies, and run executes a deployed resource.

### Q35
<!-- meta: section=7; objective=7.3; answer=A; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks -->
**Question:** Users outside a privileged group should see only rows for their assigned region. Which feature directly implements this on one table?

A. Row filter
B. A dynamic view maintained separately for this otherwise single-table rule
C. A column mask returning null for unauthorized regions
D. A schema-level `SELECT` grant per region

**Rationale:** A row filter returns a Boolean per row according to identity or group logic.

### Q36
<!-- meta: section=4; objective=4.3; answer=C; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** A gold job should start only when `main.silver.orders` is updated. Which trigger avoids guessing when upstream completes?

A. A schedule five minutes later
B. A notebook retry
C. Table update
D. File arrival on an unrelated path

**Rationale:** A table-update trigger follows actual source-table changes.

### Q37
<!-- meta: section=7; objective=7.3; answer=C; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks -->
**Question:** Analysts may query a customer table but should see only the last four digits of account numbers. Which feature fits?

A. A row filter that removes rows with account numbers
B. A dynamic view maintained instead of a table-level value policy
C. Column mask
D. A schema grant that exposes only selected columns

**Rationale:** A column mask transforms the visible value at query time without rewriting stored data.

### Q38
<!-- meta: section=3; objective=3.5; answer=C; source=https://docs.databricks.com/aws/en/optimizations/aqe -->
**Question:** A shuffle stage has many tiny tasks and scheduler overhead dominates. Which parameter is directly relevant, followed by remeasurement?

A. Increase `spark.sql.shuffle.partitions`.
B. Increase driver memory only.
C. Reduce `spark.sql.shuffle.partitions` to a measured level.
D. Increase `spark.sql.autoBroadcastJoinThreshold` without a join.

**Rationale:** Too many shuffle partitions create tiny tasks; a justified reduction can reduce overhead.

### Q39
<!-- meta: section=2; objective=2.5; answer=D; source=https://docs.databricks.com/aws/en/connect/ -->
**Question:** A JDBC read of a very large relational table uses one connection and is a bottleneck. The table has a uniformly distributed numeric key. What should the engineer consider?

A. Increase `fetchsize` while retaining one unpartitioned connection.
B. Read the entire table through a Python client and parallelize the collected rows.
C. Partition on a highly skewed status code with no bounds.
D. A partitioned JDBC read with bounds and multiple partitions

**Rationale:** Parallel JDBC partitions can distribute a large read when a well-distributed partition column, bounds, and the source all support it.

### Q40
<!-- meta: section=3; objective=3.6; answer=A; source=https://docs.databricks.com/aws/en/views/ -->
**Question:** A frequently read weekly revenue aggregate is expensive to recompute and can refresh on a schedule. Which object is most appropriate?

A. Materialized view
B. Standard view
C. Temporary view
D. Bronze file

**Rationale:** A materialized view stores refreshed query results for faster repeated reads.

### Q41
<!-- meta: section=4; objective=4.1; answer=A; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A task fails from a temporary service timeout about once a month. Which policy is reasonable?

A. A small retry count with delay and a final alert
B. Infinite retries with no delay
C. One immediate retry for every deterministic failure type
D. A long timeout with no retry or terminal notification

**Rationale:** Bounded retries handle transient failures while preserving failure visibility.

### Q42
<!-- meta: section=2; objective=2.1; answer=C; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** Analysts need to query current rows in an external database without copying them into Databricks. Which pattern differs from ingestion by leaving data in place?

A. Auto Loader
B. `COPY INTO`
C. Lakehouse Federation
D. Managed CDC ingestion

**Rationale:** Federation queries remote data without moving it; ingestion creates a Databricks-side copy.

### Q43
<!-- meta: section=3; objective=3.7; answer=D; source=https://docs.databricks.com/aws/en/ldp/expectations -->
**Question:** Invalid noncritical records should not reach silver, but the pipeline should continue and record how many were removed. Which expectation action fits?

A. Warn
B. Fail update
C. Quarantine by failing the complete update
D. Drop row

**Rationale:** Drop-row expectations exclude invalid records and emit quality metrics without stopping the update.

### Q44
<!-- meta: section=5; objective=5.3; answer=D; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** A bundle-deployed production job needs a configuration change. What should the team do?

A. Change only the UI and leave source unchanged.
B. Update the bundle source but patch the production UI before review.
C. Clone the job in production and maintain the clone outside the bundle.
D. Update bundle source, review it, and redeploy the production target.

**Rationale:** The bundle definition should remain authoritative to prevent drift.

### Q45
<!-- meta: section=7; objective=7.4; answer=D; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/ -->
**Question:** New columns tagged `classification=pii` across a catalog must automatically receive the same mask. Which approach scales best?

A. One table-level column mask manually attached to each current and future column
B. A dynamic view per table selected by naming convention
C. Catalog-level `SELECT` grants on only currently known columns
D. A Unity Catalog ABAC policy over governed tags

**Rationale:** ABAC attaches centrally and matches governed tag attributes across many objects.

## Official source set

- [Exam guide — effective May 4, 2026](https://www.databricks.com/sites/default/files/2026-03/databricks-certified-data-engineer-associate-exam-guide-may-4-2026.pdf)
- [Compute](https://docs.databricks.com/aws/en/compute)
- [Ingestion](https://docs.databricks.com/aws/en/ingestion)
- [Medallion architecture](https://docs.databricks.com/aws/en/lakehouse/medallion)
- [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)
- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
- [Spark UI](https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui)
- [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/)
