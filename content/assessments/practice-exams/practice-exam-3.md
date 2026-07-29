# Practice Exam 3 — Integrated Scenarios and Final Readiness

**Questions:** 45
**Time:** 90 minutes
**Format:** One best answer
**Blueprint:** 3 / 9 / 10 / 7 / 5 / 4 / 7

### Q01
<!-- meta: section=2; objective=2.3; answer=B; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/ -->
**Question:** An engineer deletes an Auto Loader checkpoint to “reset the UI” and restarts against the same source. What is the primary risk?

A. The stream retains file progress in the target Delta log, so only schema state is lost.
B. The stream forgets processed-file progress and can reprocess input.
C. Auto Loader reconstructs the identical checkpoint from `schemaLocation`.
D. The stream resumes at the last file because file events are the authoritative checkpoint.

**Rationale:** Checkpoint state is the stream's memory of processing progress.

### Q02
<!-- meta: section=3; objective=3.1; answer=C; source=https://docs.databricks.com/aws/en/data-engineering/ -->
**Question:** A required business key is null in 0.1% of bronze records. What is the strongest silver design?

A. Replace every null with one sentinel key even though the dimension defines no unknown member.
B. Publish the rows and add a warning only in a later gold query.
C. Exclude or quarantine invalid rows with a measured quality rule while retaining bronze.
D. Drop the rows silently and report silver as fully complete.

**Rationale:** Silver should enforce the key contract without destroying raw evidence or inventing collisions.

### Q03
<!-- meta: section=2; objective=2.3; answer=D; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/ -->
**Question:** Parquet files contain a field that Auto Loader widens unexpectedly. The engineer knows the desired type. Which option provides that expectation during inference?

A. `cloudFiles.inferColumnTypes`
B. `cloudFiles.schemaLocation`
C. `cloudFiles.schemaEvolutionMode`
D. `cloudFiles.schemaHints`

**Rationale:** Schema hints guide how the reader interprets known fields when the schema is inferred.

### Q04
<!-- meta: section=5; objective=5.1; answer=B; source=https://docs.databricks.com/aws/en/repos/git-folders-concepts -->
**Question:** A developer switches a Databricks Git folder from `main` to `feature/orders`. What is the purpose?

A. Create a workspace-only copy with no remote branch.
B. Isolate feature work in a Git branch before review.
C. Promote the feature directly into the production bundle target.
D. Change the job's run identity to the branch owner.

**Rationale:** Branches isolate source changes for commit, push, and PR review.

### Q05
<!-- meta: section=3; objective=3.2; answer=A; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A data-quality report should contain only orders whose customer ID exists in the customer table. Which join fits?

A. Inner join
B. Left outer join
C. Left semi join followed by selecting customer columns from the right side
D. Left anti join

**Rationale:** Inner join keeps only matching rows from both sides.

### Q06
<!-- meta: section=6; objective=6.1; answer=D; source=https://docs.databricks.com/aws/en/jobs/monitor -->
**Question:** A job is slower, but input volume also tripled. Which comparison gives the most useful signal?

A. Raw duration compared with a run over the original one-third input volume
B. Duration per row without checking whether the transformation or compute changed
C. Executor utilization from the slower run without any baseline
D. Duration and resource metrics normalized by comparable input volume and configuration

**Rationale:** Normalized comparable baselines distinguish poor scaling from expected extra work.

### Q07
<!-- meta: section=2; objective=2.4; answer=A; source=https://docs.databricks.com/aws/en/ingestion/lakeflow-connect -->
**Question:** In Lakeflow Connect managed ingestion, which component writes the source data into governed destination streaming tables?

A. The ingestion pipeline
B. The Unity Catalog connection
C. The destination streaming table
D. The ingestion gateway

**Rationale:** The connection stores source access, and the ingestion pipeline reads incrementally and writes destinations.

### Q08
<!-- meta: section=5; objective=5.2; answer=D; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** A production target requires `mode: production` and a different workspace host. Where should this be declared?

A. In a custom variable referenced from source, while leaving the workspace host global
B. In the top-level bundle mapping so dev also receives production mode
C. In CI-only flags with no production target declaration
D. In the bundle's production target settings

**Rationale:** Target configuration defines deployment context and overrides top-level defaults.

### Q09
<!-- meta: section=4; objective=4.1; answer=D; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** An ingestion task may retry, but a downstream notification should run only after all retries fail. Which design is best?

A. Notify before ingestion starts.
B. Place notification inside ingestion so every failed attempt sends one.
C. Give notification an all-done condition, which also sends after success.
D. Configure bounded retries on ingestion and a downstream failure run condition for notification.

**Rationale:** Retries belong on the transient task; the alert should respond to final failure.

### Q10
<!-- meta: section=7; objective=7.1; answer=A; source=https://docs.databricks.com/aws/en/tables/types -->
**Question:** A new Delta table should receive automatic maintenance and Unity Catalog should own its data lifecycle. Which choice fits?

A. Managed table
B. External table registered over a team-owned path with manual maintenance
C. Foreign table whose source system retains lifecycle ownership
D. A materialized view over files without a governed base table

**Rationale:** Managed tables provide the intended lifecycle and optimization behavior.

### Q11
<!-- meta: section=6; objective=6.2; answer=A; source=https://docs.databricks.com/aws/en/jobs/monitor -->
**Question:** A run shows “Succeeded with failures.” What does that indicate?

A. Some tasks failed, but all leaf tasks completed successfully under the configured flow.
B. Failed tasks were automatically converted to successful task states.
C. A leaf task failed, so downstream recovery tasks could not complete.
D. Only retried attempts failed; every task's final attempt succeeded.

**Rationale:** Lakeflow Jobs derives the overall result from leaf tasks, allowing nonleaf failures under some control flows.

### Q12
<!-- meta: section=3; objective=3.2; answer=D; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** The automatic broadcast threshold is 10 MB, but a 15 MB dimension is known to fit safely on executors. Which action can request broadcast?

A. Raise the automatic threshold globally without checking other joins.
B. Repartition the dimension and fact to a single partition.
C. Cache the dimension on the driver without changing the join plan.
D. Apply an explicit broadcast hint after verifying memory safety.

**Rationale:** An explicit hint can override automatic threshold selection, but memory suitability remains the engineer's responsibility.

### Q13
<!-- meta: section=4; objective=4.2; answer=B; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** Which task should run a Databricks notebook with `processing_date` as a parameter?

A. Python script task reading a notebook widget
B. Notebook task with a base/job parameter
C. Notebook task with a task value written after the notebook starts
D. Run Job task without forwarding the parameter

**Rationale:** Notebook tasks execute notebooks and accept parameters.

### Q14
<!-- meta: section=7; objective=7.1; answer=C; source=https://docs.databricks.com/aws/en/tables/types -->
**Question:** `ALTER TABLE t UNSET MANAGED` is proposed for any managed table to move it to a new external path. What is the correct concern?

A. It is the supported reverse conversion for every managed table regardless of origin.
B. It moves files to the new path but intentionally discards table history.
C. It is a rollback for a recent supported `SET MANAGED` conversion, not a general migration command.
D. It changes ownership to an external principal without changing table type.

**Rationale:** Current `UNSET MANAGED` semantics are tied to rollback within the supported conversion workflow.

### Q15
<!-- meta: section=4; objective=4.2; answer=C; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A job graph shows A → B → C → A. What is wrong?

A. The graph needs an all-done condition on C.
B. Only SQL tasks may participate in a cycle.
C. The cycle violates the DAG requirement.
D. A must be changed to a For each task for the cycle to resolve.

**Rationale:** A Jobs dependency graph cannot contain a cycle.

### Q16
<!-- meta: section=7; objective=7.2; answer=D; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/ -->
**Question:** A service principal runs a production job that reads one schema and writes another. Which grant design is best?

A. Catalog ownership on the read catalog and schema ownership on the write schema
B. `ALL PRIVILEGES` on both schemas, omitting parent-container usage grants
C. Metastore-level `SELECT` and `MODIFY` for simpler inheritance
D. Required usage plus narrow `SELECT` and `MODIFY` privileges at the necessary scopes

**Rationale:** Workload identities should receive only the data actions and hierarchy access their job requires.

### Q17
<!-- meta: section=4; objective=4.3; answer=A; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** A job must run at midnight on the first day of each month. Which trigger is required?

A. Scheduled
B. File arrival
C. Table update
D. If/else

**Rationale:** The requirement is tied to a recurring calendar time, so a scheduled trigger is the direct fit.

### Q18
<!-- meta: section=7; objective=7.2; answer=B; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/ -->
**Question:** `SELECT` is revoked directly from a user, but a group still has catalog-level `SELECT`. What is the effective result?

A. The direct revoke creates an implicit deny that overrides group access.
B. The user can still receive access through group membership and inheritance.
C. The user retains catalog access but loses table access from every source.
D. The result depends only on whether the table is managed or external.

**Rationale:** Unity Catalog access is additive across direct, group, and inherited grants; a revoke removes only the specified grant.

### Q19
<!-- meta: section=5; objective=5.3; answer=A; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** Why promote the same reviewed revision through test and production targets?

A. It separates environment configuration from code and preserves traceability.
B. It allows each target to mutate the reviewed source after deployment.
C. It removes the need to validate the resolved production configuration.
D. It guarantees data results are equal even when target inputs differ.

**Rationale:** Same-revision promotion makes deployments attributable and prevents unreviewed code drift.

### Q20
<!-- meta: section=7; objective=7.3; answer=A; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks -->
**Question:** Which function is useful inside a policy UDF that changes results according to account-level group membership?

A. `is_account_group_member()`
B. `current_user()`, which alone tests direct account-group membership
C. `is_member()`, evaluated only against workspace-local groups in every context
D. `session_user()`, which returns group membership rather than an identity

**Rationale:** The group-membership function lets a filter or mask evaluate the querying identity.

### Q21
<!-- meta: section=6; objective=6.4; answer=C; source=https://docs.databricks.com/aws/en/optimizations/ -->
**Question:** Automatic liquid clustering should choose keys from historical query patterns. What capability must support its automatic selection and maintenance?

A. Manual `ZORDER` commands scheduled independently of query history
B. The SQL warehouse result cache
C. Predictive optimization
D. Static directory partitioning selected at table creation

**Rationale:** Automatic liquid clustering uses predictive optimization to select and apply keys.

### Q22
<!-- meta: section=4; objective=4.4; answer=D; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** Which is the strongest reason to prefer a data-driven trigger?

A. It guarantees exactly one run for every upstream transaction.
B. It eliminates the need for retries and monitoring.
C. It always starts faster than a file-arrival trigger.
D. It starts from actual data readiness and avoids unnecessary polling runs.

**Rationale:** Event-driven execution aligns latency and cost with actual source availability.

### Q23
<!-- meta: section=3; objective=3.2; answer=B; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** DataFrame A columns are `(id, amount)` and DataFrame B columns are `(amount, id)`. What risk arises from plain `A.union(B)`?

A. It removes all duplicates.
B. Values align by position and can land under the wrong columns.
C. It aligns by name but casts `id` to the type of `amount`.
D. It fails solely because the column order differs, before examining types.

**Rationale:** Plain PySpark union is positional; use `unionByName` for name alignment.

### Q24
<!-- meta: section=2; objective=2.6; answer=C; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** A Kafka source requires custom watermarking and stateful transformation logic. Which layer provides the needed control?

A. A managed Kafka connector with fixed source-defined transformations
B. A scheduled `COPY INTO` followed by state recovery from output files
C. A standard connector with Structured Streaming or a Lakeflow pipeline
D. Lakehouse Federation with no streaming state

**Rationale:** Standard connectors expose Spark streaming APIs and pipeline control for custom logic.

### Q25
<!-- meta: section=3; objective=3.3; answer=C; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A silver output should rename `cust_id`, remove `debug_payload`, and keep only active rows. Which operations are required?

A. `withColumnRenamed`, `select`, and `where`, retaining `debug_payload` for lineage
B. `alias`, `drop`, and `dropDuplicates`, which also removes inactive rows
C. Rename/alias, drop, and filter
D. `selectExpr` for rename, `filter` for active rows, but no operation on `debug_payload`

**Rationale:** These are direct column and row-shaping operations.

### Q26
<!-- meta: section=2; objective=2.2; answer=B; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into -->
**Question:** A SQL-only team wants periodic incremental ingestion of new CSV files from S3 into a Unity Catalog Delta table. Which command directly fits?

A. Auto Loader with an `AvailableNow` trigger and Python configuration
B. `COPY INTO`
C. A batch DataFrame reader with a manually maintained filename ledger
D. A managed CDC connector for object storage

**Rationale:** `COPY INTO` provides incremental, idempotent file loading from cloud object storage.

### Q27
<!-- meta: section=5; objective=5.4; answer=C; source=https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands -->
**Question:** A CI job wants to display the resolved bundle identity and resources without starting them. Which command is useful?

A. `bundle run`
B. `bundle validate`, which checks configuration but is not intended as the resolved-resource display
C. `bundle summary`
D. `bundle deploy`, which applies changes rather than only displaying them

**Rationale:** `bundle summary` reports bundle identity and resolved resources.

### Q28
<!-- meta: section=2; objective=2.7; answer=D; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** A nested `items` array has been preserved in bronze and must become typed line-item rows in silver. Which transformation is central?

A. `flatten`, which merges nested arrays but does not emit rows
B. `transform`, which preserves one parent row while changing each element
C. `element_at`, which extracts only one array position
D. `explode` or `variant_explode`, according to the stored type

**Rationale:** Array/object generator functions flatten nested elements into rows.

### Q29
<!-- meta: section=3; objective=3.3; answer=A; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A null array must produce no child rows. Which function matches that requirement?

A. `explode`
B. `explode_outer`
C. `coalesce`
D. `row_number`

**Rationale:** Plain `explode` does not preserve a null or empty parent as a child row.

### Q30
<!-- meta: section=1; objective=1.1; answer=D; source=https://docs.databricks.com/aws/en/lakehouse-architecture/reference -->
**Question:** After an erroneous update, an engineer must compare the current table to version 12 without restoring it. Which capability should be used?

A. Git branch comparison
B. `DESCRIBE HISTORY`, which lists commits but does not return version-12 rows
C. A shallow clone created after the erroneous update
D. Delta Lake time travel by version

**Rationale:** Delta history supports read-only queries against a retained prior version.

### Q31
<!-- meta: section=3; objective=3.4; answer=D; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** Events are unique by `(device_id, event_id)`, but retries create duplicates. No version ordering is needed. Which operation is appropriate?

A. `distinct()`, even though non-key audit columns can differ across retries
B. `dropDuplicates(["device_id"])`
C. `row_number` partitioned only by `event_id`
D. `dropDuplicates(["device_id", "event_id"])`

**Rationale:** Deduplicating on the composite business key removes retry duplicates.

### Q32
<!-- meta: section=4; objective=4.3; answer=B; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** A raw-file job completes, then writes a silver table. A separate gold job should respond to completion of the silver result rather than raw arrival. Which trigger is best for gold?

A. Raw file arrival plus a fixed delay estimated from prior silver runs
B. Silver table update
C. A schedule at the median silver completion time
D. A Run Job task placed in the raw-file job before the silver write

**Rationale:** The gold dependency is the silver table update, not the earlier raw event.

### Q33
<!-- meta: section=2; objective=2.1; answer=A; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** Which source is explicitly suitable for a manual local import rather than an automated connector?

A. A small developer CSV used for exploration
B. A high-volume CDC feed from PostgreSQL
C. Millions of hourly object-storage files
D. An enterprise SaaS application requiring retries

**Rationale:** Manual local import fits small exploratory data, not production ingestion requirements.

### Q34
<!-- meta: section=3; objective=3.7; answer=B; source=https://docs.databricks.com/aws/en/ldp/expectations -->
**Question:** A Delta silver table must reject future rows whose `amount` is negative, including writes made outside the current notebook. Which control provides persistent table-level enforcement?

A. A notebook filter applied only before this one write
B. A Delta `CHECK (amount >= 0)` constraint
C. A Lakeflow expectation configured in a different pipeline that does not own the table writes
D. A dashboard alert evaluated after invalid rows are committed

**Rationale:** A Delta check constraint is stored with the table and rejects violating writes regardless of which compliant writer attempts them.

### Q35
<!-- meta: section=4; objective=4.1; answer=C; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A metadata task returns a list of table names as a task value. Which control can consume that list to run a nested task per table?

A. If/else task with one branch for every possible table name
B. Run Job task that accepts only the first table value
C. For each task
D. A table-update trigger created dynamically per returned value

**Rationale:** For each can iterate over a dynamically produced bounded list.

### Q36
<!-- meta: section=3; objective=3.5; answer=C; source=https://docs.databricks.com/aws/en/optimizations/aqe -->
**Question:** A join unexpectedly broadcasts a dimension that no longer fits in executor memory. Which setting or strategy is most relevant?

A. Increase executor memory and retain the forced broadcast regardless of size.
B. Raise the broadcast threshold so more tables follow the same plan.
C. Lower/disable automatic broadcast eligibility or remove the hint, then choose a shuffle join and re-measure.
D. Repartition the fact to one partition before the broadcast join.

**Rationale:** The broadcast decision is the direct cause; use a suitable nonbroadcast plan rather than adding unrelated memory changes.

### Q37
<!-- meta: section=6; objective=6.5; answer=B; source=https://docs.databricks.com/aws/en/compute/troubleshooting/ -->
**Question:** A job works interactively but fails with `ModuleNotFoundError` on job compute. What should be checked first?

A. Whether the module is present on the driver but missing from executors because of skew
B. Whether the dependency is declared in the job environment/task rather than existing only in the interactive notebook session
C. Whether the job uses a different shuffle-partition count from the notebook
D. Whether the target table is external rather than managed

**Rationale:** Production job compute needs its own reproducible dependency definition.

### Q38
<!-- meta: section=2; objective=2.6; answer=C; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** An object-storage source receives one 1 GB file per day. The team needs a simple daily incremental SQL load. Which factor most strongly favors `COPY INTO` over Auto Loader?

A. The data is JSON.
B. Unity Catalog is enabled.
C. Low-frequency bounded file arrival and a simple SQL workflow are sufficient.
D. The target is Delta.

**Rationale:** Both can target Delta; the simple low-frequency bounded workload makes `COPY INTO` adequate.

### Q39
<!-- meta: section=1; objective=1.2; answer=A; source=https://docs.databricks.com/aws/en/compute/ -->
**Question:** A new Python/SQL notebook team values instant startup and does not require R, RDDs, init scripts, or custom Spark extensions. Which compute is a strong default?

A. Serverless notebook compute
B. Classic all-purpose compute kept running for guaranteed zero startup
C. A serverless SQL warehouse for notebook-only PySpark DataFrame APIs
D. Classic job compute started separately for each interactive cell

**Rationale:** The workload fits serverless limitations and benefits from managed startup and scaling.

### Q40
<!-- meta: section=7; objective=7.4; answer=D; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/ -->
**Question:** A catalog owner wants policy authors to control PII masking centrally so table owners cannot quietly remove it. Which mechanism fits?

A. Table-level policies owned by each table owner, with no centralized authority
B. Dynamic views that table owners can replace while retaining base-table access
C. Catalog-level grants that remove all PII columns for every user
D. Catalog- or schema-level ABAC policies using governed tags

**Rationale:** ABAC separates central policy from local ownership and automatically covers matching tagged objects.

### Q41
<!-- meta: section=2; objective=2.5; answer=B; source=https://docs.databricks.com/aws/en/connect/ -->
**Question:** A notebook uses an ODBC driver to extract a large table incrementally. Which production design best handles the fact that ODBC is client-driven?

A. Call `fetchall()` on the unbounded table and rely on Spark to distribute the driver memory.
B. Bind half-open watermark parameters, fetch bounded batches, persist progress after durable writes, use secrets, and orchestrate retries with Jobs.
C. Interpolate the watermark and password into SQL so each run is self-contained.
D. Create multiple concurrent queries over the same unbounded range and keep progress only in notebook state.

**Rationale:** ODBC does not automatically become a distributed Spark read. The production design must bound memory, parameterize SQL, secure credentials, coordinate committed output with incremental state, and orchestrate retries.

### Q42
<!-- meta: section=5; objective=5.3; answer=B; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** Which statement correctly distinguishes Git folders and bundles?

A. Git folders and bundles both deploy the same resource state, but only bundles use branches.
B. Git folders support interactive source development; bundles define repeatable resource deployment.
C. Git folders are required only for production; bundles are limited to local development.
D. Bundles replace branch review by uploading workspace state directly.

**Rationale:** The features cooperate but own different stages of the development/deployment lifecycle.

### Q43
<!-- meta: section=3; objective=3.6; answer=A; source=https://docs.databricks.com/aws/en/views/ -->
**Question:** A continuously arriving event stream should populate a durable incrementally maintained gold object. Which object best fits?

A. Streaming table
B. Standard view only
C. Temporary view
D. Git folder

**Rationale:** Streaming tables are durable Delta targets maintained by streaming flows.

### Q44
<!-- meta: section=7; objective=7.3; answer=C; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks -->
**Question:** A table-specific row filter uses a complicated Python UDF with external calls. What is a better policy design?

A. Cache the external result inside the Python UDF and keep its network dependency.
B. Replace the row filter with a view that invokes the same external Python UDF.
C. Prefer a simple deterministic SQL UDF with minimal arguments.
D. Materialize unfiltered results first, then mask them in the consuming notebook.

**Rationale:** Simple deterministic SQL policy functions improve performance and reduce optimization/security complications.

### Q45
<!-- meta: section=1; objective=1.2; answer=C; source=https://docs.databricks.com/aws/en/compute/ -->
**Question:** Which statement describes a classic SQL warehouse relative to serverless?

A. It starts more quickly than serverless but supports fewer networking options.
B. It is the only warehouse type that supports Photon execution.
C. It starts and scales less responsively and lacks Predictive IO and intelligent workload management.
D. It provides the same management features as serverless but bills through job compute.

**Rationale:** Classic is the entry-level SQL warehouse; serverless has the fullest performance-management feature set.

## Official source set

- [Exam guide — effective May 4, 2026](https://www.databricks.com/sites/default/files/2026-03/databricks-certified-data-engineer-associate-exam-guide-may-4-2026.pdf)
- [Delta Lake](https://docs.databricks.com/aws/en/delta)
- [Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect)
- [Data engineering](https://docs.databricks.com/aws/en/data-engineering/)
- [Lakeflow Jobs triggers](https://docs.databricks.com/aws/en/jobs/triggers)
- [Git folders](https://docs.databricks.com/aws/en/repos/git-folders-concepts)
- [Liquid clustering](https://docs.databricks.com/aws/en/delta/clustering)
- [Filters, masks, and ABAC](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks)
