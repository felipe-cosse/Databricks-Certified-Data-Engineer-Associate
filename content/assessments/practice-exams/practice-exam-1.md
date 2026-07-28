# Practice Exam 1 — Foundation and Selection

**Questions:** 45  
**Time:** 90 minutes  
**Format:** One best answer  
**Blueprint:** 3 / 9 / 10 / 7 / 5 / 4 / 7

Complete all questions before reading the rationales embedded below each item. The interactive site hides answers until submission.

### Q01
<!-- meta: section=1; objective=1.2; answer=C -->
**Question:** A team of analysts runs concurrent ad hoc SQL against governed Delta tables throughout the day. They want rapid startup and minimal infrastructure management. Which compute should they select?

A. A single-node personal cluster  
B. Classic job compute for every query  
C. A serverless SQL warehouse  
D. A dedicated R notebook cluster

**Rationale:** SQL warehouses are designed for SQL analytics and concurrency; serverless provides fast, managed elasticity.

### Q02
<!-- meta: section=1; objective=1.1; answer=B -->
**Question:** A regulated pipeline needs reliable rollback after a bad write, table history for audit, and consistent governed access across workspaces. Which combination directly provides those capabilities?

A. CSV files plus Git folders  
B. Delta Lake plus Unity Catalog  
C. Lakeflow Jobs plus a dashboard  
D. Auto Loader plus an all-purpose cluster

**Rationale:** Delta Lake supplies transactions/history, while Unity Catalog supplies unified governance and lineage.

### Q03
<!-- meta: section=1; objective=1.2; answer=D -->
**Question:** A Python job requires a compute-scoped init script and a custom Spark data-source extension. Which choice best fits?

A. Serverless SQL warehouse  
B. Serverless notebook compute  
C. Serverless jobs with default settings  
D. Classic job compute with compatible configuration

**Rationale:** Serverless compute restricts compute-scoped init scripts and custom Spark extensions; classic compute exposes these controls.

### Q04
<!-- meta: section=2; objective=2.4; answer=A -->
**Question:** A supported CRM must be ingested with source-aware incremental reads, automatic retries, schema evolution, and minimal code. Which method is most appropriate?

A. Lakeflow Connect managed connector  
B. A custom REST loop  
C. `COPY INTO` from the CRM URL  
D. A JDBC cross join

**Rationale:** The managed connector adds source-specific authentication, incremental behavior, retries, and maintenance.

### Q05
<!-- meta: section=2; objective=2.2; answer=C -->
**Question:** A `COPY INTO` load succeeded, but the notebook lost its connection before recording success. What should the engineer do?

A. Delete the target table before retrying.  
B. Rename every source file.  
C. Re-run the same command because loaded files are tracked by default.  
D. Append all source files with a DataFrame write.

**Rationale:** `COPY INTO` is retryable and idempotent for previously processed files by default.

### Q06
<!-- meta: section=2; objective=2.3; answer=B -->
**Question:** Auto Loader scans a path containing tens of millions of files. Cloud listing calls have become expensive. Which change best targets the issue?

A. Remove the checkpoint on each run.  
B. Enable managed file events where supported.  
C. Reduce the target table columns.  
D. Replace Delta with CSV.

**Rationale:** Managed file events let Auto Loader discover subsequent files from event state instead of repeatedly listing the entire path.

### Q07
<!-- meta: section=2; objective=2.3; answer=D -->
**Question:** An Auto Loader stream must remember its input schema across restarts and track future schema changes. Which option should be configured?

A. `spark.default.parallelism`  
B. `cloudFiles.useManagedFileEvents` only  
C. `checkpointLocation` only  
D. `cloudFiles.schemaLocation`

**Rationale:** Schema location stores inferred schema history; checkpoint location stores streaming progress.

### Q08
<!-- meta: section=2; objective=2.5; answer=A -->
**Question:** A niche SaaS API has no supported connector. It uses cursor pagination and rate limits. Which design is strongest?

A. A Jobs-orchestrated REST notebook with secret-based auth, persisted cursor state, retry/backoff, and idempotent bronze writes  
B. Auto Loader pointed directly at the API  
C. `COPY INTO` with `FILEFORMAT = REST`  
D. A materialized view over the API URL

**Rationale:** Custom API ingestion owns paging, state, retries, security, and idempotence; Lakeflow Jobs operationalizes it.

### Q09
<!-- meta: section=2; objective=2.6; answer=C -->
**Question:** Five years of Parquet files already exist in a governed volume and must be loaded once. No new arrivals are expected. Which solution is simplest?

A. A continuous managed CDC connector  
B. A perpetual Auto Loader stream  
C. `COPY INTO`  
D. Lakehouse Federation

**Rationale:** A one-time governed file backfill is a direct `COPY INTO` use case.

### Q10
<!-- meta: section=2; objective=2.7; answer=B -->
**Question:** A bronze pipeline receives rapidly evolving JSON and must retain the complete raw record. Which design best preserves source fidelity?

A. Drop every unknown field.  
B. Store the payload in `VARIANT` and extract stable fields in silver.  
C. Aggregate before landing.  
D. Convert all events to dashboard images.

**Rationale:** `VARIANT` preserves flexible semi-structured content while silver can expose typed query fields.

### Q11
<!-- meta: section=2; objective=2.5; answer=D -->
**Question:** A JDBC read of a very large relational table uses one connection and is a bottleneck. The table has a uniformly distributed numeric key. What should the engineer consider?

A. A cross join with the source  
B. Collecting the table on the driver  
C. Decreasing source fetch efficiency  
D. A partitioned JDBC read with bounds and multiple partitions

**Rationale:** Parallel JDBC partitions can distribute a large read when the partition column and source support it.

### Q12
<!-- meta: section=2; objective=2.1; answer=C -->
**Question:** Analysts need to query current rows in an external database without copying them into Databricks. Which pattern differs from ingestion by leaving data in place?

A. Auto Loader  
B. `COPY INTO`  
C. Lakehouse Federation  
D. Managed CDC ingestion

**Rationale:** Federation queries remote data without moving it; ingestion creates a Databricks-side copy.

### Q13
<!-- meta: section=3; objective=3.1; answer=A -->
**Question:** A silver pipeline receives invalid amount strings. The team must preserve bad records for repair while producing typed valid records. Which approach is best?

A. Use `try_cast`, route null cast results to quarantine, and publish valid rows to silver.  
B. Replace every bad amount with zero.  
C. Drop the bronze source.  
D. Use `collect()` and fix values manually.

**Rationale:** `try_cast` supports explicit validation and quarantine without inventing values or losing raw data.

### Q14
<!-- meta: section=3; objective=3.2; answer=B -->
**Question:** A fact table must retain every transaction while adding a segment from a customer dimension when available. Which join is required?

A. Inner  
B. Left outer  
C. Cross  
D. Left anti

**Rationale:** A left outer join preserves all fact rows and adds matching dimension attributes.

### Q15
<!-- meta: section=3; objective=3.2; answer=D -->
**Question:** A 6 MB country dimension is joined to a multi-terabyte event table. Which physical strategy can avoid shuffling the large table?

A. `UNION`  
B. Cross join  
C. Repartition both to one partition  
D. Broadcast the country dimension

**Rationale:** Broadcasting a safely small dimension can remove the large-side shuffle.

### Q16
<!-- meta: section=3; objective=3.2; answer=C -->
**Question:** Two PySpark DataFrames contain the same named columns in different orders. Which operation appends rows using names rather than positions?

A. `join`  
B. `union`  
C. `unionByName`  
D. `intersect`

**Rationale:** `unionByName` aligns columns by name; plain `union` is positional.

### Q17
<!-- meta: section=3; objective=3.3; answer=A -->
**Question:** One order row contains an array of five line items. Which operation creates five line-item rows?

A. `explode`  
B. `coalesce`  
C. `mean`  
D. `dropDuplicates`

**Rationale:** `explode` emits one row per array element.

### Q18
<!-- meta: section=3; objective=3.4; answer=D -->
**Question:** Multiple updates exist per account. The latest `updated_at` row must survive. Which solution is correct?

A. `distinct()`  
B. `dropDuplicates(["account_id"])` with no ordering  
C. `approx_count_distinct`  
D. `row_number` over account ordered by `updated_at DESC`, then keep rank 1

**Rationale:** The window explicitly chooses the latest row; generic deduplication does not.

### Q19
<!-- meta: section=3; objective=3.4; answer=B -->
**Question:** A dashboard needs the number of rows including rows whose `customer_id` is null. Which expression fits?

A. `count(customer_id)`  
B. `count(*)`  
C. `mean(customer_id)`  
D. `approx_count_distinct(customer_id)`

**Rationale:** `count(*)` counts rows, while `count(customer_id)` excludes null customer IDs.

### Q20
<!-- meta: section=3; objective=3.5; answer=C -->
**Question:** A shuffle stage has many tiny tasks and scheduler overhead dominates. Which parameter is directly relevant, followed by remeasurement?

A. Increase `spark.sql.shuffle.partitions`.  
B. Increase driver memory only.  
C. Reduce `spark.sql.shuffle.partitions` to a measured level.  
D. Increase `spark.sql.autoBroadcastJoinThreshold` without a join.

**Rationale:** Too many shuffle partitions create tiny tasks; a justified reduction can reduce overhead.

### Q21
<!-- meta: section=3; objective=3.6; answer=A -->
**Question:** A frequently read weekly revenue aggregate is expensive to recompute and can refresh on a schedule. Which object is most appropriate?

A. Materialized view  
B. Standard view  
C. Temporary view  
D. Bronze file

**Rationale:** A materialized view stores refreshed query results for faster repeated reads.

### Q22
<!-- meta: section=3; objective=3.7; answer=D -->
**Question:** Invalid noncritical records should not reach silver, but the pipeline should continue and record how many were removed. Which expectation action fits?

A. Warn  
B. Fail update  
C. Drop the entire table  
D. Drop row

**Rationale:** Drop-row expectations exclude invalid records and emit quality metrics without stopping the update.

### Q23
<!-- meta: section=4; objective=4.2; answer=B -->
**Question:** A job must run an existing Lakeflow pipeline update after a notebook prepares configuration. Which downstream task type should it use?

A. Dashboard task  
B. Pipeline task  
C. If/else task only  
D. Git task

**Rationale:** A pipeline task runs an existing Lakeflow pipeline as part of the Jobs DAG.

### Q24
<!-- meta: section=4; objective=4.1; answer=C -->
**Question:** A validation task emits `valid=false`. The job must run an alert instead of transformation. Which control best represents this?

A. A dependency cycle  
B. A file-arrival trigger  
C. An If/else task with true and false branches  
D. A SQL warehouse resize

**Rationale:** If/else routes execution according to the validation result.

### Q25
<!-- meta: section=4; objective=4.1; answer=A -->
**Question:** The same notebook must process a bounded list of 20 source tables. Which feature should the job use?

A. For each with controlled concurrency  
B. A circular DAG  
C. Twenty workspaces  
D. A row filter

**Rationale:** For each runs a nested task per item without violating DAG acyclicity.

### Q26
<!-- meta: section=4; objective=4.3; answer=D -->
**Question:** A vendor drops a file at unpredictable times. The SLA starts when the file arrives. Which trigger is best?

A. Daily schedule  
B. Manual trigger  
C. Table update on the target  
D. File arrival

**Rationale:** File arrival models the real source event and avoids empty scheduled runs.

### Q27
<!-- meta: section=4; objective=4.4; answer=B -->
**Question:** A finance report must refresh at 07:00 every weekday regardless of upstream changes. Which trigger should be used?

A. File arrival  
B. Scheduled  
C. Table update  
D. For each

**Rationale:** The requirement is explicitly clock-based.

### Q28
<!-- meta: section=4; objective=4.3; answer=C -->
**Question:** A gold job should start only when `main.silver.orders` is updated. Which trigger avoids guessing when upstream completes?

A. A schedule five minutes later  
B. A notebook retry  
C. Table update  
D. File arrival on an unrelated path

**Rationale:** A table-update trigger follows actual source-table changes.

### Q29
<!-- meta: section=4; objective=4.1; answer=A -->
**Question:** A task fails from a temporary service timeout about once a month. Which policy is reasonable?

A. A small retry count with delay and a final alert  
B. Infinite retries with no delay  
C. No timeout and no monitoring  
D. A full catalog rebuild

**Rationale:** Bounded retries handle transient failures while preserving failure visibility.

### Q30
<!-- meta: section=5; objective=5.1; answer=D -->
**Question:** A developer finishes a feature in a Databricks Git folder. What is the next collaboration path?

A. Edit production directly.  
B. Copy the notebook to another user's folder.  
C. Store the change only in notebook history.  
D. Commit and push the branch, then open a pull request in the Git provider.

**Rationale:** Git folders support branch work; the remote provider handles PR review and merge.

### Q31
<!-- meta: section=5; objective=5.2; answer=B -->
**Question:** Dev and prod use different catalog names. Where should the difference be expressed?

A. In duplicated business-logic files  
B. Bundle variables and target overrides  
C. In a committed secret  
D. In a manual post-deploy edit

**Rationale:** Targets parameterize environment configuration while preserving one codebase.

### Q32
<!-- meta: section=5; objective=5.3; answer=C -->
**Question:** Which current feature packages source files and resource definitions for repeatable deployment?

A. Databricks Repos  
B. Notebook revision history  
C. Declarative Automation Bundles  
D. Spark UI

**Rationale:** Bundles define code and Databricks resources as a deployable project.

### Q33
<!-- meta: section=5; objective=5.4; answer=A -->
**Question:** Which sequence correctly checks configuration, applies resources, and starts a job?

A. `bundle validate` → `bundle deploy` → `bundle run`  
B. `bundle run` → `bundle validate` → `git reset`  
C. `bundle deploy` → `bundle init` → `bundle validate`  
D. `repos list` → `vacuum` → `copy into`

**Rationale:** Validate checks, deploy applies, and run executes a deployed resource.

### Q34
<!-- meta: section=5; objective=5.3; answer=D -->
**Question:** A bundle-deployed production job needs a configuration change. What should the team do?

A. Change only the UI and leave source unchanged.  
B. Disconnect the job and forget the bundle.  
C. Modify an unreviewed copy in production.  
D. Update bundle source, review it, and redeploy the production target.

**Rationale:** The bundle definition should remain authoritative to prevent drift.

### Q35
<!-- meta: section=6; objective=6.1; answer=B -->
**Question:** A run's total duration increased, but execution time is unchanged and setup time tripled. Where should investigation focus?

A. Join semantics  
B. Compute startup, libraries, queue, and setup changes  
C. Gold aggregation grain  
D. Column masks

**Rationale:** The phase comparison localizes the regression to setup rather than query execution.

### Q36
<!-- meta: section=6; objective=6.3; answer=C -->
**Question:** Most tasks finish in 20 seconds, one runs for 9 minutes, and its shuffle read is 15 times the median. What is the best diagnosis?

A. Too many Git branches  
B. Driver collection  
C. Data skew  
D. Missing schema usage

**Rationale:** The straggler and max-to-median shuffle imbalance show an oversized partition.

### Q37
<!-- meta: section=6; objective=6.4; answer=A -->
**Question:** A new managed table is filtered frequently by high-cardinality customer IDs and query patterns may change. Which layout strategy is recommended?

A. Liquid clustering  
B. A fixed low-cardinality directory partition on customer ID  
C. `ZORDER` plus liquid clustering simultaneously  
D. A dashboard task

**Rationale:** Liquid clustering supports high-cardinality filtering and evolving keys and replaces partitioning/Z-order on its table.

### Q38
<!-- meta: section=6; objective=6.5; answer=D -->
**Question:** Executors fail with OOM during a skewed aggregation while the driver remains healthy. Which response best targets the problem?

A. Increase driver memory.  
B. Collect the data first.  
C. Add a scheduled trigger.  
D. Address skew and reduce data per executor task before considering executor memory.

**Rationale:** The failure is executor-side and tied to oversized partitions; driver memory is unrelated.

### Q39
<!-- meta: section=7; objective=7.1; answer=C -->
**Question:** A table must reference existing Parquet files whose lifecycle remains owned by another platform. Which table type fits?

A. Managed table  
B. Temporary table  
C. External table  
D. Materialized view

**Rationale:** External tables register user-managed cloud files while Unity Catalog manages metadata.

### Q40
<!-- meta: section=7; objective=7.1; answer=A -->
**Question:** A Unity Catalog external table is dropped accidentally. What remains?

A. The underlying cloud files  
B. The table metadata only  
C. Neither data nor metadata  
D. A managed-table copy

**Rationale:** Dropping an external table removes metadata but does not delete user-managed data.

### Q41
<!-- meta: section=7; objective=7.2; answer=D -->
**Question:** A group has `SELECT` on a table but no access to its parent containers. Which grants are required?

A. `MODIFY` and `MANAGE`  
B. `CREATE TABLE` and ownership  
C. `READ VOLUME` and `WRITE VOLUME`  
D. `USE CATALOG` and `USE SCHEMA`

**Rationale:** The group must traverse the Unity Catalog hierarchy before using the table privilege.

### Q42
<!-- meta: section=7; objective=7.2; answer=B -->
**Question:** Which statement about `DENY SELECT` is correct for a Unity Catalog table?

A. It is the preferred override for inherited grants.  
B. It is unsupported; `DENY` applies to legacy `hive_metastore`.  
C. It converts the table to managed.  
D. It applies only to dashboards.

**Rationale:** Unity Catalog uses grants/revokes and fine-grained controls; SQL `DENY` is legacy Hive-metastore behavior.

### Q43
<!-- meta: section=7; objective=7.3; answer=A -->
**Question:** Users outside a privileged group should see only rows for their assigned region. Which feature directly implements this on one table?

A. Row filter  
B. Column mask  
C. Storage credential  
D. Predictive optimization

**Rationale:** A row filter returns a Boolean per row according to identity or group logic.

### Q44
<!-- meta: section=7; objective=7.3; answer=C -->
**Question:** Analysts may query a customer table but should see only the last four digits of account numbers. Which feature fits?

A. File-arrival trigger  
B. Liquid clustering  
C. Column mask  
D. Table update

**Rationale:** A column mask transforms the visible value at query time without rewriting stored data.

### Q45
<!-- meta: section=7; objective=7.4; answer=D -->
**Question:** New columns tagged `classification=pii` across a catalog must automatically receive the same mask. Which approach scales best?

A. One manually maintained view per table  
B. A legacy `DENY` statement  
C. A scheduled notebook that renames columns  
D. A Unity Catalog ABAC policy over governed tags

**Rationale:** ABAC attaches centrally and matches governed tag attributes across many objects.

## Official source set

- [Exam guide](https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf)
- [Compute](https://docs.databricks.com/aws/en/compute)
- [Ingestion](https://docs.databricks.com/aws/en/ingestion)
- [Medallion architecture](https://docs.databricks.com/aws/en/lakehouse/medallion)
- [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)
- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
- [Spark UI](https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui)
- [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/)

