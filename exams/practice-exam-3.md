# Practice Exam 3 — Integrated Scenarios and Final Readiness

**Questions:** 45  
**Time:** 90 minutes  
**Format:** One best answer  
**Blueprint:** 3 / 9 / 10 / 7 / 5 / 4 / 7

### Q01
<!-- meta: section=1; objective=1.1; answer=D -->
**Question:** After an erroneous update, an engineer must compare the current table to version 12 without restoring it. Which capability should be used?

A. Git branch comparison  
B. Jobs run history  
C. Catalog ownership  
D. Delta Lake time travel by version

**Rationale:** Delta history supports read-only queries against a retained prior version.

### Q02
<!-- meta: section=1; objective=1.2; answer=A -->
**Question:** A new Python/SQL notebook team values instant startup and does not require R, RDDs, init scripts, or custom Spark extensions. Which compute is a strong default?

A. Serverless notebook compute  
B. A permanent oversized classic cluster  
C. A classic SQL warehouse for all Python APIs  
D. A Git folder

**Rationale:** The workload fits serverless limitations and benefits from managed startup and scaling.

### Q03
<!-- meta: section=1; objective=1.2; answer=C -->
**Question:** Which statement describes a classic SQL warehouse relative to serverless?

A. It includes intelligent workload management unavailable on serverless.  
B. It is the only warehouse with Photon.  
C. It starts and scales less responsively and lacks Predictive IO and intelligent workload management.  
D. It runs Python RDD jobs better than classic job compute.

**Rationale:** Classic is the entry-level SQL warehouse; serverless has the fullest performance-management feature set.

### Q04
<!-- meta: section=2; objective=2.3; answer=B -->
**Question:** An engineer deletes an Auto Loader checkpoint to “reset the UI” and restarts against the same source. What is the primary risk?

A. Unity Catalog becomes disabled.  
B. The stream forgets processed-file progress and can reprocess input.  
C. The schema becomes a SQL warehouse.  
D. `COPY INTO` stops being idempotent.

**Rationale:** Checkpoint state is the stream's memory of processing progress.

### Q05
<!-- meta: section=2; objective=2.3; answer=D -->
**Question:** Parquet files contain a field that Auto Loader widens unexpectedly. The engineer knows the desired type. Which option provides that expectation during inference?

A. `spark.default.parallelism`  
B. `checkpointLocation`  
C. `cloudFiles.useManagedFileEvents`  
D. `cloudFiles.schemaHints`

**Rationale:** Schema hints guide how the reader interprets known fields when the schema is inferred.

### Q06
<!-- meta: section=2; objective=2.4; answer=A -->
**Question:** In Lakeflow Connect managed ingestion, which component writes the source data into governed destination streaming tables?

A. The ingestion pipeline  
B. The Git folder  
C. The SQL dashboard  
D. The Spark UI

**Rationale:** The connection stores source access, and the ingestion pipeline reads incrementally and writes destinations.

### Q07
<!-- meta: section=2; objective=2.6; answer=C -->
**Question:** A Kafka source requires custom watermarking and stateful transformation logic. Which layer provides the needed control?

A. A managed SaaS connector  
B. A one-time `COPY INTO`  
C. A standard connector with Structured Streaming or a Lakeflow pipeline  
D. A local file upload

**Rationale:** Standard connectors expose Spark streaming APIs and pipeline control for custom logic.

### Q08
<!-- meta: section=2; objective=2.2; answer=B -->
**Question:** A SQL-only team wants periodic incremental ingestion of new CSV files from S3 into a Unity Catalog Delta table. Which command directly fits?

A. `SELECT ... FROM JDBC`  
B. `COPY INTO`  
C. `DENY SELECT`  
D. `OPTIMIZE FULL`

**Rationale:** `COPY INTO` provides incremental, idempotent file loading from cloud object storage.

### Q09
<!-- meta: section=2; objective=2.7; answer=D -->
**Question:** A nested `items` array has been preserved in bronze and must become typed line-item rows in silver. Which transformation is central?

A. `VACUUM`  
B. `GRANT`  
C. `approx_count_distinct`  
D. `explode` or `variant_explode`, according to the stored type

**Rationale:** Array/object generator functions flatten nested elements into rows.

### Q10
<!-- meta: section=2; objective=2.1; answer=A -->
**Question:** Which source is explicitly suitable for a manual local import rather than an automated connector?

A. A small developer CSV used for exploration  
B. A high-volume CDC feed from PostgreSQL  
C. Millions of hourly object-storage files  
D. An enterprise SaaS application requiring retries

**Rationale:** Manual local import fits small exploratory data, not production ingestion requirements.

### Q11
<!-- meta: section=2; objective=2.6; answer=C -->
**Question:** An object-storage source receives one 1 GB file per day. The team needs a simple daily incremental SQL load. Which factor most strongly favors `COPY INTO` over Auto Loader?

A. The data is JSON.  
B. Unity Catalog is enabled.  
C. Low-frequency bounded file arrival and a simple SQL workflow are sufficient.  
D. The target is Delta.

**Rationale:** Both can target Delta; the simple low-frequency bounded workload makes `COPY INTO` adequate.

### Q12
<!-- meta: section=2; objective=2.5; answer=B -->
**Question:** A JDBC notebook directly writes an ingested table successfully. What is still needed for a reliable production workflow?

A. A cross join  
B. Scheduling/orchestration, retries, monitoring, secret handling, and incremental state  
C. A column mask on every source field  
D. A permanently open notebook tab

**Rationale:** Successful extraction code is only one part of operational ingestion; Lakeflow Jobs typically provides orchestration.

### Q13
<!-- meta: section=3; objective=3.1; answer=C -->
**Question:** A required business key is null in 0.1% of bronze records. What is the strongest silver design?

A. Replace every null with the same fake key.  
B. Ignore the issue and publish all rows.  
C. Exclude or quarantine invalid rows with a measured quality rule while retaining bronze.  
D. Delete the bronze table.

**Rationale:** Silver should enforce the key contract without destroying raw evidence or inventing collisions.

### Q14
<!-- meta: section=3; objective=3.2; answer=A -->
**Question:** A data-quality report should contain only orders whose customer ID exists in the customer table. Which join fits?

A. Inner join  
B. Left outer join  
C. Cross join  
D. Full outer join

**Rationale:** Inner join keeps only matching rows from both sides.

### Q15
<!-- meta: section=3; objective=3.2; answer=D -->
**Question:** The automatic broadcast threshold is 10 MB, but a 15 MB dimension is known to fit safely on executors. Which action can request broadcast?

A. Reduce executor memory.  
B. Use `UNION ALL`.  
C. Cross join the dimension.  
D. Apply an explicit broadcast hint after verifying memory safety.

**Rationale:** An explicit hint can override automatic threshold selection, but memory suitability remains the engineer's responsibility.

### Q16
<!-- meta: section=3; objective=3.2; answer=B -->
**Question:** DataFrame A columns are `(id, amount)` and DataFrame B columns are `(amount, id)`. What risk arises from plain `A.union(B)`?

A. It removes all duplicates.  
B. Values align by position and can land under the wrong columns.  
C. It performs a Cartesian product.  
D. It broadcasts B.

**Rationale:** Plain PySpark union is positional; use `unionByName` for name alignment.

### Q17
<!-- meta: section=3; objective=3.3; answer=C -->
**Question:** A silver output should rename `cust_id`, remove `debug_payload`, and keep only active rows. Which operations are required?

A. Mean, count, and summary  
B. Broadcast, cross join, and union  
C. Rename/alias, drop, and filter  
D. Optimize, vacuum, and analyze

**Rationale:** These are direct column and row-shaping operations.

### Q18
<!-- meta: section=3; objective=3.3; answer=A -->
**Question:** A null array must produce no child rows. Which function matches that requirement?

A. `explode`  
B. `explode_outer`  
C. `coalesce`  
D. `row_number`

**Rationale:** Plain `explode` does not preserve a null or empty parent as a child row.

### Q19
<!-- meta: section=3; objective=3.4; answer=D -->
**Question:** Events are unique by `(device_id, event_id)`, but retries create duplicates. No version ordering is needed. Which operation is appropriate?

A. `distinct("device_id")`  
B. `mean(["device_id", "event_id"])`  
C. `crossJoin`  
D. `dropDuplicates(["device_id", "event_id"])`

**Rationale:** Deduplicating on the composite business key removes retry duplicates.

### Q20
<!-- meta: section=3; objective=3.4; answer=B -->
**Question:** Which DataFrame method produces descriptive statistics such as count, mean, standard deviation, min, and max for selected columns?

A. `join()`  
B. `summary()`  
C. `explode()`  
D. `repartition()`

**Rationale:** `summary` returns a descriptive-statistics DataFrame.

### Q21
<!-- meta: section=3; objective=3.5; answer=C -->
**Question:** A join unexpectedly broadcasts a dimension that no longer fits in executor memory. Which setting or strategy is most relevant?

A. Increase `spark.default.parallelism` only.  
B. Reduce driver memory.  
C. Lower/disable automatic broadcast eligibility or remove the hint, then choose a shuffle join and re-measure.  
D. Increase the source file count.

**Rationale:** The broadcast decision is the direct cause; use a suitable nonbroadcast plan rather than adding unrelated memory changes.

### Q22
<!-- meta: section=3; objective=3.6; answer=A -->
**Question:** A continuously arriving event stream should populate a durable incrementally maintained gold object. Which object best fits?

A. Streaming table  
B. Standard view only  
C. Temporary view  
D. Git folder

**Rationale:** Streaming tables are durable Delta targets maintained by streaming flows.

### Q23
<!-- meta: section=4; objective=4.1; answer=D -->
**Question:** An ingestion task may retry, but a downstream notification should run only after all retries fail. Which design is best?

A. Notify before ingestion starts.  
B. Place notification inside every retry attempt.  
C. Run notification on success.  
D. Configure bounded retries on ingestion and a downstream failure run condition for notification.

**Rationale:** Retries belong on the transient task; the alert should respond to final failure.

### Q24
<!-- meta: section=4; objective=4.2; answer=B -->
**Question:** Which task should run a Databricks notebook with `processing_date` as a parameter?

A. Dashboard task  
B. Notebook task with a base/job parameter  
C. Pipeline trigger only  
D. Table-update task

**Rationale:** Notebook tasks execute notebooks and accept parameters.

### Q25
<!-- meta: section=4; objective=4.2; answer=C -->
**Question:** A job graph shows A → B → C → A. What is wrong?

A. The graph has too few tasks.  
B. Tasks cannot have dependencies.  
C. The cycle violates the DAG requirement.  
D. Every graph must start with SQL.

**Rationale:** A Jobs dependency graph cannot contain a cycle.

### Q26
<!-- meta: section=4; objective=4.3; answer=A -->
**Question:** A job must run at midnight on the first day of each month. Which trigger is required?

A. Scheduled  
B. File arrival  
C. Table update  
D. If/else

**Rationale:** The requirement is a calendar schedule.

### Q27
<!-- meta: section=4; objective=4.4; answer=D -->
**Question:** Which is the strongest reason to prefer a data-driven trigger?

A. It guarantees the query is logically correct.  
B. It eliminates all compute cost.  
C. It allows cycles in the task graph.  
D. It starts from actual data readiness and avoids unnecessary polling runs.

**Rationale:** Event-driven execution aligns latency and cost with actual source availability.

### Q28
<!-- meta: section=4; objective=4.3; answer=B -->
**Question:** A raw-file job completes, then writes a silver table. A separate gold job should respond to completion of the silver result rather than raw arrival. Which trigger is best for gold?

A. Raw file arrival  
B. Silver table update  
C. A schedule before silver starts  
D. A For each loop

**Rationale:** The gold dependency is the silver table update, not the earlier raw event.

### Q29
<!-- meta: section=4; objective=4.1; answer=C -->
**Question:** A metadata task returns a list of table names as a task value. Which control can consume that list to run a nested task per table?

A. Dashboard task  
B. Materialized view  
C. For each task  
D. Storage credential

**Rationale:** For each can iterate over a dynamically produced bounded list.

### Q30
<!-- meta: section=5; objective=5.1; answer=B -->
**Question:** A developer switches a Databricks Git folder from `main` to `feature/orders`. What is the purpose?

A. Change Unity Catalog permissions.  
B. Isolate feature work in a Git branch before review.  
C. Resize a warehouse.  
D. Trigger Auto Loader.

**Rationale:** Branches isolate source changes for commit, push, and PR review.

### Q31
<!-- meta: section=5; objective=5.2; answer=D -->
**Question:** A production target requires `mode: production` and a different workspace host. Where should this be declared?

A. In every transformation function  
B. In a notebook output cell  
C. In an untracked local file only  
D. In the bundle's production target settings

**Rationale:** Target configuration defines deployment context and overrides top-level defaults.

### Q32
<!-- meta: section=5; objective=5.3; answer=A -->
**Question:** Why promote the same reviewed revision through test and production targets?

A. It separates environment configuration from code and preserves traceability.  
B. It makes tests unnecessary.  
C. It lets production differ silently from Git.  
D. It stores secrets in source.

**Rationale:** Same-revision promotion makes deployments attributable and prevents unreviewed code drift.

### Q33
<!-- meta: section=5; objective=5.4; answer=C -->
**Question:** A CI job wants to display the resolved bundle identity and resources without starting them. Which command is useful?

A. `bundle run`  
B. `bundle destroy`  
C. `bundle summary`  
D. `jobs run-now`

**Rationale:** `bundle summary` reports bundle identity and resolved resources.

### Q34
<!-- meta: section=5; objective=5.3; answer=B -->
**Question:** Which statement correctly distinguishes Git folders and bundles?

A. Git folders deploy production infrastructure; bundles only display diffs.  
B. Git folders support interactive source development; bundles define repeatable resource deployment.  
C. They are identical names for the same UI.  
D. Bundles replace remote Git providers.

**Rationale:** The features cooperate but own different stages of the development/deployment lifecycle.

### Q35
<!-- meta: section=6; objective=6.1; answer=D -->
**Question:** A job is slower, but input volume also tripled. Which comparison gives the most useful signal?

A. Raw duration only  
B. Dashboard color before and after  
C. Number of Git commits only  
D. Duration and resource metrics normalized by comparable input volume and configuration

**Rationale:** Normalized comparable baselines distinguish poor scaling from expected extra work.

### Q36
<!-- meta: section=6; objective=6.2; answer=A -->
**Question:** A run shows “Succeeded with failures.” What does that indicate?

A. Some tasks failed, but all leaf tasks completed successfully under the configured flow.  
B. Every task succeeded.  
C. No task ran.  
D. The cluster never started.

**Rationale:** Lakeflow Jobs derives the overall result from leaf tasks, allowing nonleaf failures under some control flows.

### Q37
<!-- meta: section=6; objective=6.4; answer=C -->
**Question:** Automatic liquid clustering should choose keys from historical query patterns. What capability must support its automatic selection and maintenance?

A. Git folders  
B. A dashboard task  
C. Predictive optimization  
D. `DENY`

**Rationale:** Automatic liquid clustering uses predictive optimization to select and apply keys.

### Q38
<!-- meta: section=6; objective=6.5; answer=B -->
**Question:** A job works interactively but fails with `ModuleNotFoundError` on job compute. What should be checked first?

A. Row-filter logic  
B. Whether the dependency is declared in the job environment/task rather than existing only in the interactive notebook session  
C. Shuffle skew  
D. External-table drop behavior

**Rationale:** Production job compute needs its own reproducible dependency definition.

### Q39
<!-- meta: section=7; objective=7.1; answer=A -->
**Question:** A new Delta table should receive automatic maintenance and Unity Catalog should own its data lifecycle. Which choice fits?

A. Managed table  
B. External table over an arbitrary path  
C. Foreign table  
D. Standard view

**Rationale:** Managed tables provide the intended lifecycle and optimization behavior.

### Q40
<!-- meta: section=7; objective=7.1; answer=C -->
**Question:** `ALTER TABLE t UNSET MANAGED` is proposed for any managed table to move it to a new external path. What is the correct concern?

A. It is a normal universal conversion command.  
B. It grants `SELECT`.  
C. It is a rollback for a recent supported `SET MANAGED` conversion, not a general migration command.  
D. It only changes clustering keys.

**Rationale:** Current `UNSET MANAGED` semantics are tied to rollback within the supported conversion workflow.

### Q41
<!-- meta: section=7; objective=7.2; answer=D -->
**Question:** A service principal runs a production job that reads one schema and writes another. Which grant design is best?

A. Metastore admin  
B. Catalog ownership  
C. `ALL PRIVILEGES` on every catalog  
D. Required usage plus narrow `SELECT` and `MODIFY` privileges at the necessary scopes

**Rationale:** Workload identities should receive only the data actions and hierarchy access their job requires.

### Q42
<!-- meta: section=7; objective=7.2; answer=B -->
**Question:** `SELECT` is revoked directly from a user, but a group still has catalog-level `SELECT`. What is the effective result?

A. The direct revoke overrides all inherited access.  
B. The user can still receive access through group membership and inheritance.  
C. The table is dropped.  
D. The group grant becomes a row filter.

**Rationale:** Unity Catalog access is additive across direct, group, and inherited grants; a revoke removes only the specified grant.

### Q43
<!-- meta: section=7; objective=7.3; answer=A -->
**Question:** Which function is useful inside a policy UDF that changes results according to account-level group membership?

A. `is_account_group_member()`  
B. `approx_count_distinct()`  
C. `explode()`  
D. `read_files()`

**Rationale:** The group-membership function lets a filter or mask evaluate the querying identity.

### Q44
<!-- meta: section=7; objective=7.4; answer=D -->
**Question:** A catalog owner wants policy authors to control PII masking centrally so table owners cannot quietly remove it. Which mechanism fits?

A. A comment on each table  
B. A manual filter owned by every table creator  
C. A scheduled `DENY` notebook  
D. Catalog- or schema-level ABAC policies using governed tags

**Rationale:** ABAC separates central policy from local ownership and automatically covers matching tagged objects.

### Q45
<!-- meta: section=7; objective=7.3; answer=C -->
**Question:** A table-specific row filter uses a complicated Python UDF with external calls. What is a better policy design?

A. Add more external calls.  
B. Run the policy after returning all rows to the user.  
C. Prefer a simple deterministic SQL UDF with minimal arguments.  
D. Replace security with clustering.

**Rationale:** Simple deterministic SQL policy functions improve performance and reduce optimization/security complications.

## Official source set

- [Exam guide](https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf)
- [Delta Lake](https://docs.databricks.com/aws/en/delta)
- [Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect)
- [Data engineering](https://docs.databricks.com/aws/en/data-engineering/)
- [Lakeflow Jobs triggers](https://docs.databricks.com/aws/en/jobs/triggers)
- [Git folders](https://docs.databricks.com/aws/en/repos/git-folders-concepts)
- [Liquid clustering](https://docs.databricks.com/aws/en/delta/clustering)
- [Filters, masks, and ABAC](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks)

