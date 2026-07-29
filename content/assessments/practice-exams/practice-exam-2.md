# Practice Exam 2 — Implementation and Reliability

**Questions:** 45
**Time:** 90 minutes
**Format:** One best answer
**Blueprint:** 3 / 9 / 10 / 7 / 5 / 4 / 7

### Q01
<!-- meta: section=2; objective=2.1; answer=C; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** An engineer drags a 20-row CSV from a laptop into the workspace for exploration. Which description is most accurate?

A. A manually initiated batch import that is acceptable only if the file is governed afterward
B. A small-volume ingestion path that can be promoted unchanged to high-volume production
C. A local-file import suitable for exploration, not a scalable production pattern
D. A connector-managed incremental batch because the workspace records upload history

**Rationale:** Local upload is valid for small exploratory data but lacks the automation, source state, retry behavior, and scale expected from a production ingestion design.

### Q02
<!-- meta: section=7; objective=7.1; answer=D; source=https://docs.databricks.com/aws/en/tables/types -->
**Question:** Which table type is the default and recommended choice for a new Unity Catalog table when no external lifecycle requirement exists?

A. An external Delta table at a team-owned path
B. A foreign table over the same cloud storage
C. A managed view over an external location
D. Managed

**Rationale:** Managed tables let Unity Catalog manage storage lifecycle and optimization.

### Q03
<!-- meta: section=3; objective=3.1; answer=B; source=https://docs.databricks.com/aws/en/data-engineering/ -->
**Question:** A missing `country` means unknown, while the real code `ZZ` has a business meaning. How should silver handle null country values?

A. Always replace them with `ZZ`.
B. Preserve null or use an explicit `UNKNOWN` category that cannot be confused with a real code.
C. Drop all rows whose country is null before measuring the effect.
D. Infer the most common real country code and use it without a business rule.

**Rationale:** Imputation must preserve meaning; a real code must not be overloaded as “unknown.”

### Q04
<!-- meta: section=4; objective=4.2; answer=C; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A job must execute a saved SQL query between ingestion and a dashboard refresh. Which task types express the two steps?

A. Two notebook tasks that call the SQL and dashboard APIs manually
B. A pipeline task followed by a table-update trigger
C. A SQL task followed by a dashboard task
D. A SQL task followed by another SQL task that queries dashboard metadata

**Rationale:** The named task types directly execute a SQL query and refresh a published dashboard.

### Q05
<!-- meta: section=5; objective=5.1; answer=A; source=https://docs.databricks.com/aws/en/repos/git-folders-concepts -->
**Question:** Two developers need isolated branch work in the workspace. Which setup is recommended?

A. Each developer uses their own Git folder and branch.
B. Both use separate branches in the same shared Git folder checkout.
C. Both use the `main` branch in separate folders and reconcile changes manually.
D. One developer uses a branch while the other edits an untracked workspace copy.

**Rationale:** Per-user Git folders avoid conflicting workspace state while branches support collaboration.

### Q06
<!-- meta: section=2; objective=2.3; answer=A; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/ -->
**Question:** An Auto Loader process writes to Delta and restarts with the same checkpoint. What behavior does the checkpoint enable?

A. Resume discovered-file progress and avoid processing the same files again in normal operation
B. Preserve schema history but rediscover every previously committed file
C. Resume only the output-table transaction history, not source progress
D. Treat every restart as a new independent stream with a new identity

**Rationale:** The checkpoint persists file-discovery and stream progress, supporting exactly-once file processing with Delta.

### Q07
<!-- meta: section=3; objective=3.2; answer=D; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** Orders match price records only when both `sku` and `effective_date` match. Which join condition is required?

A. Join on `sku` and filter `effective_date` only after aggregation.
B. Join on `sku`, then choose an arbitrary matching price row.
C. Join only on `effective_date` and deduplicate by `sku`.
D. Join using both keys.

**Rationale:** The composite business key requires both predicates.

### Q08
<!-- meta: section=5; objective=5.2; answer=C; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** Which expression references a custom bundle variable named `catalog`?

A. `${catalog.name}`
B. `${target.catalog}`
C. `${var.catalog}`
D. `$SECRET_catalog`

**Rationale:** Custom bundle variables are referenced through the `var` namespace.

### Q09
<!-- meta: section=3; objective=3.2; answer=A; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A calendar of 365 dates must be paired deliberately with 8 forecast scenarios. Which operation produces the required 2,920 combinations?

A. Cross join
B. Full outer join on the date column
C. `UNION ALL` after aligning both schemas
D. Left join from dates to scenarios without a join predicate

**Rationale:** A bounded intentional Cartesian product is a valid cross-join use case.

### Q10
<!-- meta: section=5; objective=5.3; answer=B; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** Which resources can a Declarative Automation Bundle package together?

A. Only SQL text
B. Source files plus supported jobs, pipelines, dashboards, artifacts, and configuration
C. Workspace resources but not the source files they execute
D. Source files and secrets committed as target variables

**Rationale:** A bundle is an end-to-end project definition, not merely a code archive.

### Q11
<!-- meta: section=3; objective=3.2; answer=C; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** Two SQL result sets must be appended while preserving duplicates. Which operator is correct?

A. `UNION`
B. `INTERSECT`
C. `UNION ALL`
D. `EXCEPT`

**Rationale:** `UNION ALL` appends all rows without duplicate elimination.

### Q12
<!-- meta: section=7; objective=7.1; answer=B; source=https://docs.databricks.com/aws/en/tables/types -->
**Question:** A qualifying external Delta table is converted with `SET MANAGED`. What is the intended effect?

A. Copy data into a new unrelated managed table and drop the original.
B. Move management to Unity Catalog while retaining table configuration and history.
C. Change only the metadata label while leaving file lifecycle external.
D. Replace the Delta log and rebuild the table from Parquet files.

**Rationale:** `SET MANAGED` is designed to preserve the table identity/configuration while converting lifecycle management.

### Q13
<!-- meta: section=3; objective=3.3; answer=B; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A source column `email` must become `email_domain` containing the text after `@`. Which transformation is most direct?

A. `countDistinct(email)`
B. Split the string and select the domain element, then rename/alias it.
C. Use `substring(email, 1, instr(email, "@"))` without handling the delimiter position.
D. Use `regexp_replace` to remove every character after `@`, then rename the original.

**Rationale:** Column split and alias operations reshape the value without changing unrelated rows.

### Q14
<!-- meta: section=6; objective=6.2; answer=C; source=https://docs.databricks.com/aws/en/jobs/monitor -->
**Question:** Job failure rate rose only for the validation task after a source change. Which evidence should be compared next?

A. Overall job duration without separating the failed task or input change
B. Validation-task history from unrelated jobs that use different schemas
C. Validation-task history, parameters, input schema, and failure logs before and after the source change
D. Only the most recent stack trace, without a known-good comparison

**Rationale:** Task-specific history and change correlation directly test the suspected regression.

### Q15
<!-- meta: section=4; objective=4.1; answer=A; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A cleanup notebook must run whether its upstream task succeeds or fails. Which dependency behavior is needed?

A. An all-done style run condition
B. An at-least-one-failed run condition
C. A success-only condition plus retries on cleanup
D. Two duplicate cleanup tasks on the success and failure branches

**Rationale:** Cleanup requires a condition that runs after completion regardless of outcome.

### Q16
<!-- meta: section=1; objective=1.1; answer=A; source=https://docs.databricks.com/aws/en/lakehouse-architecture/reference -->
**Question:** Data engineers, BI analysts, and data scientists need one durable dataset with consistent permissions and lineage. Which platform design best supports this?

A. Store governed Delta tables in cloud storage and access them through Unity Catalog from workload-specific compute.
B. Store separate Delta copies in each workspace and synchronize grants with notebooks.
C. Share external Parquet paths directly and manage access only with cloud IAM.
D. Centralize data in one all-purpose cluster and give each team cluster-level permissions.

**Rationale:** Decoupled storage plus Delta reliability and Unity Catalog governance lets multiple workloads share the same trusted data.

### Q17
<!-- meta: section=6; objective=6.3; answer=A; source=https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui -->
**Question:** Shuffle read/write dwarfs the final output because a query sorts and deduplicates several times. What should the engineer inspect first?

A. Whether filters/projections can move earlier and redundant wide operations can be removed
B. Whether executor memory can be increased before locating the wide transformations
C. Whether the final output should be repartitioned to more files after every sort
D. Whether the driver result limit can be raised to absorb shuffle output

**Rationale:** Removing unnecessary wide transformations and reducing data before shuffles directly targets the evidence.

### Q18
<!-- meta: section=3; objective=3.3; answer=D; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** Parent rows with null or empty item arrays must remain after flattening. Which operation is preferable?

A. `explode`
B. `distinct`
C. `union`
D. `explode_outer`

**Rationale:** `explode_outer` preserves a parent output row for null/empty input where plain `explode` does not.

### Q19
<!-- meta: section=4; objective=4.1; answer=D; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A For each task launches 500 API calls at once and overloads the source. What should the engineer change?

A. Increase the task-level retry count so failed API calls remain concurrent.
B. Split the list across multiple For each tasks with the same total concurrency.
C. Add a longer job timeout without changing parallelism.
D. Limit For each concurrency.

**Rationale:** Bounded concurrency protects external systems and workspace capacity.

### Q20
<!-- meta: section=5; objective=5.4; answer=D; source=https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands -->
**Question:** `databricks bundle validate -t prod` succeeds. What has this proved?

A. The production workspace has all referenced data objects and permissions.
B. The deployed job completes successfully with production inputs.
C. The resolved resources already exist with no drift in the workspace.
D. The resolved production bundle conforms to supported configuration schemas.

**Rationale:** Validation checks configuration; logical tests, deployment, and execution are separate steps.

### Q21
<!-- meta: section=7; objective=7.2; answer=A; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/ -->
**Question:** Human analysts need read access to every current and future table in one schema. What is a scalable least-privilege approach?

A. Grant required usage and schema-level `SELECT` to an analyst group.
B. Grant `SELECT` separately to each analyst on every current table.
C. Grant catalog ownership to the analyst group so future access is inherited.
D. Grant `ALL PRIVILEGES` on the schema to avoid updating privileges later.

**Rationale:** Group-based inherited grants at the intended schema scope avoid per-table work and excess privilege.

### Q22
<!-- meta: section=3; objective=3.4; answer=A; source=https://docs.databricks.com/aws/en/pyspark/reference/functions/ -->
**Question:** A source can send the exact same row more than once, and no ordering rule is needed. Which operation removes whole-row duplicates?

A. `distinct()`
B. `dropDuplicates(["business_key"])`
C. `row_number` by a subset of columns
D. `groupBy` all columns and retain a duplicate-count column

**Rationale:** `distinct` eliminates duplicate complete rows.

### Q23
<!-- meta: section=2; objective=2.3; answer=D; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/ -->
**Question:** Auto Loader infers a new JSON source without `inferColumnTypes`. What is the default approach for its fields?

A. Infer primitive JSON types and widen them automatically on every file.
B. Infer fields as strings only when rescued data is disabled.
C. Require explicit schema hints for every field before the first run.
D. Infer fields as strings to reduce type-evolution conflicts.

**Rationale:** JSON, CSV, and XML fields are inferred as strings by default unless column-type inference is enabled.

### Q24
<!-- meta: section=4; objective=4.3; answer=B; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** New files land in a Unity Catalog external location. Which Jobs trigger can start the workflow from that event?

A. Table update
B. File arrival
C. Schedule only
D. If/else only

**Rationale:** File-arrival triggers monitor supported Unity Catalog storage locations.

### Q25
<!-- meta: section=7; objective=7.2; answer=C; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/ -->
**Question:** A principal has `MANAGE` on a table but no `SELECT`. What can be concluded?

A. `MANAGE` automatically includes every data privilege.
B. The principal can read data only when inspecting grants as the object manager.
C. The principal can manage permissions but must receive or grant itself the needed data privilege.
D. The principal inherits `SELECT` only if the table is managed.

**Rationale:** `MANAGE` supports permission management but does not automatically grant data access.

### Q26
<!-- meta: section=3; objective=3.6; answer=C; source=https://docs.databricks.com/aws/en/views/ -->
**Question:** A daily executive aggregate is expensive to compute, is queried repeatedly, and may refresh on a managed schedule. Consumers should read stored results rather than rerun the defining query. Which gold object fits?

A. A standard view, because it stores the query result after its first execution
B. A streaming table, even though no incremental stream or continuously arriving input exists
C. A materialized view
D. A temporary view recreated in each consumer session

**Rationale:** A materialized view stores and refreshes the result of its defining query, fitting a repeatedly queried aggregate that does not need streaming semantics.

### Q27
<!-- meta: section=4; objective=4.4; answer=A; source=https://docs.databricks.com/aws/en/jobs/triggers -->
**Question:** An upstream table usually updates by 03:00 but sometimes finishes at 04:30. The downstream job must start only after the update. Which approach is strongest?

A. Table-update trigger
B. A 03:05 schedule
C. A 03:10 schedule with more retries
D. Manual runs forever

**Rationale:** A data-driven trigger models readiness and avoids both premature and empty runs.

### Q28
<!-- meta: section=6; objective=6.4; answer=D; source=https://docs.databricks.com/aws/en/optimizations/ -->
**Question:** Predictive optimization is enabled for eligible managed tables. Which scheduled job is most likely redundant?

A. An `ANALYZE TABLE` step required by a separate audited workflow
B. A business compaction step that also changes row semantics
C. A maintenance job for external tables outside predictive-optimization eligibility
D. A manual `OPTIMIZE`/`VACUUM` maintenance job for the same tables

**Rationale:** Predictive optimization automatically performs maintenance, so duplicate schedules add cost and conflict.

### Q29
<!-- meta: section=3; objective=3.5; answer=B; source=https://docs.databricks.com/aws/en/optimizations/aqe -->
**Question:** A shuffle stage has eight partitions, each several gigabytes, and all spill heavily. Which controlled experiment is sensible?

A. Reduce to four partitions.
B. Increase shuffle partitions to reduce data per task, then compare the same workload.
C. Increase driver memory and stop measuring.
D. Broadcast the multi-terabyte side.

**Rationale:** More balanced shuffle partitions can reduce per-task memory pressure; the result must be measured.

### Q30
<!-- meta: section=6; objective=6.5; answer=B; source=https://docs.databricks.com/aws/en/compute/troubleshooting/ -->
**Question:** A compute resource fails before Spark starts because the cloud role cannot access the root storage bucket. Which category is this?

A. A Spark executor OOM during the first shuffle stage
B. A startup permission/configuration failure
C. A library conflict raised after the Python task begins
D. A SQL syntax failure after compute becomes ready

**Rationale:** The cluster failed during startup due to cloud access, before workload code executed.

### Q31
<!-- meta: section=2; objective=2.4; answer=B; source=https://docs.databricks.com/aws/en/ingestion/lakeflow-connect -->
**Question:** Which Lakeflow Connect object stores a managed source endpoint and authentication configuration under Unity Catalog?

A. Destination streaming table
B. Connection
C. Ingestion pipeline
D. Ingestion gateway

**Rationale:** A Unity Catalog connection stores endpoint and authentication configuration used by the ingestion pipeline.

### Q32
<!-- meta: section=7; objective=7.3; answer=D; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks -->
**Question:** A secure result must join two base tables, filter rows, and expose derived columns without granting users direct base-table access. Which control is suitable?

A. Separate row filters and column masks on one base table, while granting users base-table access
B. A materialized view that all users own and can modify
C. A direct column mask that can also join and remove rows
D. A dynamic view

**Rationale:** Dynamic views can combine, reshape, filter, and mask multiple sources into a curated interface.

### Q33
<!-- meta: section=2; objective=2.6; answer=C; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** A source lacks a managed connector but a supported partner offers a maintained connector meeting security and latency requirements. What is the best next step?

A. Reject it because only managed connectors may write Unity Catalog tables.
B. Build custom REST code first because customization always outweighs maintenance.
C. Evaluate and use the partner connector if it satisfies governance and operational requirements.
D. Use a standard connector solely because it has fewer managed behaviors.

**Rationale:** Partner connectors are a valid option when no managed connector exists and they meet the technical and governance requirements.

### Q34
<!-- meta: section=3; objective=3.7; answer=D; source=https://docs.databricks.com/aws/en/ldp/expectations -->
**Question:** A bronze pipeline must retain invalid source rows but report their quality rate. Which expectation behavior fits?

A. Drop row
B. Fail update
C. Quarantine through a separate validation flow and stop this update
D. Warn

**Rationale:** Warn writes invalid records and emits metrics, fitting a raw retention requirement.

### Q35
<!-- meta: section=5; objective=5.3; answer=A; source=https://docs.databricks.com/aws/en/dev-tools/bundles/ -->
**Question:** Which identity design follows least privilege for automated production deployment?

A. A workload identity with only required deployment permissions and a separately defined job run identity
B. One workspace-admin identity shared by deployment and every job task
C. A developer identity with a short-lived token but unrestricted catalog ownership
D. A deployment identity that can create any workspace resource but cannot be audited

**Rationale:** Automated workload identity and separation of deploy/run permissions reduce privilege and personal dependency.

### Q36
<!-- meta: section=1; objective=1.2; answer=D; source=https://docs.databricks.com/aws/en/compute/ -->
**Question:** A SQL warehouse must connect through custom networking to a private on-premises database. Serverless networking does not meet the requirement. Which warehouse type should be evaluated?

A. Serverless SQL warehouse with the unchanged networking model
B. Classic SQL warehouse, accepting the loss of Pro-only performance features
C. Classic job compute running each BI query as a task
D. Pro SQL warehouse

**Rationale:** Pro warehouses run compute in the customer's cloud account and can fit custom-networking requirements while retaining Predictive IO.

### Q37
<!-- meta: section=4; objective=4.2; answer=D; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A downstream task depends on two upstream tasks and should run only if both succeed. What should be configured?

A. Both dependencies with an all-done run condition
B. Either dependency with an at-least-one-succeeded run condition
C. One dependency and a table-update trigger for the other
D. Both dependencies with an all-succeeded run condition

**Rationale:** The DAG must include both prerequisites and a success condition.

### Q38
<!-- meta: section=2; objective=2.7; answer=A; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** Millions of PDFs in enterprise file storage must be ingested with file content and metadata. Which source capability is relevant?

A. A managed file-source connector or Auto Loader `binaryFile`, depending on source support
B. `COPY INTO` with CSV parsing so the PDF text becomes columns automatically
C. A JDBC reader configured with one partition per document
D. Lakehouse Federation pointed directly at arbitrary object-storage files

**Rationale:** Unstructured files can be ingested by a supported managed file connector or as binary content plus file metadata. The other methods do not parse or discover this source as described.

### Q39
<!-- meta: section=7; objective=7.4; answer=B; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/ -->
**Question:** Which tags can ABAC policies use for automatic policy matching?

A. Workspace tags entered as free-form comments
B. Governed tags
C. Any object tag, including ungoverned tags with unrestricted values
D. Cloud-provider resource tags synchronized outside Unity Catalog

**Rationale:** Unity Catalog ABAC relies on governed tags whose creation and assignment are access controlled.

### Q40
<!-- meta: section=2; objective=2.2; answer=D; source=https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into -->
**Question:** A third file is added after two files were loaded with `COPY INTO`. What happens on the next identical command?

A. All three are duplicated.
B. The table is truncated.
C. No files are considered.
D. Only the unseen file is loaded by default.

**Rationale:** `COPY INTO` tracks processed files and incrementally loads newly discovered files.

### Q41
<!-- meta: section=7; objective=7.3; answer=A; source=https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks -->
**Question:** A column mask is applied to `ssn`. What happens to the stored table value?

A. It remains unchanged; the function changes the value returned at query time.
B. It is permanently overwritten.
C. The column is dropped.
D. The entire row is hidden.

**Rationale:** Column masking is a query-time visibility control, not a destructive rewrite.

### Q42
<!-- meta: section=2; objective=2.1; answer=B; source=https://docs.databricks.com/aws/en/ingestion/ -->
**Question:** A pipeline runs every 15 minutes with `Trigger.AvailableNow()` and processes only new files. Which description fits?

A. Continuous processing only
B. Triggered incremental micro-batch processing
C. Full table federation
D. A non-incremental backfill every time

**Rationale:** Each run is bounded but processes the incremental backlog.

### Q43
<!-- meta: section=1; objective=1.2; answer=B; source=https://docs.databricks.com/aws/en/compute/ -->
**Question:** A production ETL job requires Scala and a pinned LTS runtime. Which compute is a suitable choice?

A. Serverless job compute with the default runtime and language support
B. Classic job compute using the tested LTS runtime
C. All-purpose classic compute shared with interactive development
D. A Pro SQL warehouse with a pinned Spark runtime

**Rationale:** Classic job compute supports runtime selection and Scala; job compute isolates the scheduled workload.

### Q44
<!-- meta: section=4; objective=4.1; answer=C; source=https://docs.databricks.com/aws/en/jobs/ -->
**Question:** A task times out after 30 minutes, but retrying the same deterministic query always repeats the timeout. What is the best next action?

A. Increase retries while keeping the same deterministic plan and 30-minute limit.
B. Remove the timeout and allow the task to consume resources indefinitely.
C. Diagnose and optimize or resize the task, then retest with a justified timeout.
D. Add a failure branch that reruns the same task on the same compute.

**Rationale:** Repeated deterministic timeout requires cause repair, not endless retries.

### Q45
<!-- meta: section=2; objective=2.5; answer=C; source=https://docs.databricks.com/aws/en/connect/ -->
**Question:** A REST ingestion job receives HTTP 429 responses. Which implementation is most appropriate?

A. Retry every response with a fixed one-second delay and keep the cursor only in memory.
B. Skip the throttled page, persist the following cursor, and continue.
C. Honor retry/backoff behavior, persist page state, and keep writes idempotent.
D. Increase the number of concurrent requests until one avoids the rate limit.

**Rationale:** Rate-limited API ingestion needs bounded backoff and durable cursor/state handling.

## Official source set

- [Exam guide — effective May 4, 2026](https://www.databricks.com/sites/default/files/2026-03/databricks-certified-data-engineer-associate-exam-guide-may-4-2026.pdf)
- [Reference architecture](https://docs.databricks.com/aws/en/lakehouse-architecture/reference)
- [Auto Loader](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/)
- [PySpark functions](https://docs.databricks.com/aws/en/pyspark/reference/functions/)
- [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)
- [Bundle configuration](https://docs.databricks.com/aws/en/dev-tools/bundles/reference)
- [Predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)
- [Unity Catalog access control](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/)
