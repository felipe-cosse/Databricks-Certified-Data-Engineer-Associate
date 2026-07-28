# Practice Exam 2 — Implementation and Reliability

**Questions:** 45  
**Time:** 90 minutes  
**Format:** One best answer  
**Blueprint:** 3 / 9 / 10 / 7 / 5 / 4 / 7

### Q01
<!-- meta: section=1; objective=1.1; answer=A -->
**Question:** Data engineers, BI analysts, and data scientists need one durable dataset with consistent permissions and lineage. Which platform design best supports this?

A. Store governed Delta tables in cloud storage and access them through Unity Catalog from workload-specific compute.  
B. Copy separate CSV datasets into each team's cluster.  
C. Use notebook revision history as the data store.  
D. Put permissions only in dashboard code.

**Rationale:** Decoupled storage plus Delta reliability and Unity Catalog governance lets multiple workloads share the same trusted data.

### Q02
<!-- meta: section=1; objective=1.2; answer=D -->
**Question:** A SQL warehouse must connect through custom networking to a private on-premises database. Serverless networking does not meet the requirement. Which warehouse type should be evaluated?

A. Starter serverless only  
B. Single-node personal compute  
C. Classic notebook compute only  
D. Pro SQL warehouse

**Rationale:** Pro warehouses run compute in the customer's cloud account and can fit custom-networking requirements while retaining Predictive IO.

### Q03
<!-- meta: section=1; objective=1.2; answer=B -->
**Question:** A production ETL job requires Scala and a pinned LTS runtime. Which compute is a suitable choice?

A. A SQL warehouse attached to a dashboard  
B. Classic job compute using the tested LTS runtime  
C. Serverless notebook compute, which supports all Scala APIs  
D. A Git folder

**Rationale:** Classic job compute supports runtime selection and Scala; job compute isolates the scheduled workload.

### Q04
<!-- meta: section=2; objective=2.1; answer=C -->
**Question:** An engineer drags a 20-row CSV from a laptop into the workspace for exploration. Which description is most accurate?

A. A production CDC architecture  
B. A managed database connector  
C. A local-file import suitable for exploration, not a scalable production pattern  
D. A streaming table trigger

**Rationale:** Local upload is valid for small exploratory data but lacks production ingestion reliability and automation.

### Q05
<!-- meta: section=2; objective=2.3; answer=A -->
**Question:** An Auto Loader process writes to Delta and restarts with the same checkpoint. What behavior does the checkpoint enable?

A. Resume discovered-file progress and avoid processing the same files again in normal operation  
B. Re-infer all source data on every restart  
C. Delete the source files  
D. Convert the source to JDBC

**Rationale:** The checkpoint persists file-discovery and stream progress, supporting exactly-once file processing with Delta.

### Q06
<!-- meta: section=2; objective=2.3; answer=D -->
**Question:** Auto Loader infers a new JSON source without `inferColumnTypes`. What is the default approach for its fields?

A. Infer every number as `DOUBLE`.  
B. Reject JSON inference.  
C. Store every record only as binary.  
D. Infer fields as strings to reduce type-evolution conflicts.

**Rationale:** JSON, CSV, and XML fields are inferred as strings by default unless column-type inference is enabled.

### Q07
<!-- meta: section=2; objective=2.4; answer=B -->
**Question:** Which Lakeflow Connect object stores a managed source endpoint and authentication configuration under Unity Catalog?

A. Streaming table  
B. Connection  
C. Git folder  
D. Shuffle partition

**Rationale:** A Unity Catalog connection stores endpoint and authentication configuration used by the ingestion pipeline.

### Q08
<!-- meta: section=2; objective=2.6; answer=C -->
**Question:** A source lacks a managed connector but a supported partner offers a maintained connector meeting security and latency requirements. What is the best next step?

A. Always reject partner connectors.  
B. Build custom REST code regardless.  
C. Evaluate and use the partner connector if it satisfies governance and operational requirements.  
D. Use `COPY INTO` directly from the application database.

**Rationale:** Partner connectors are a valid option when no managed connector exists and they meet the technical and governance requirements.

### Q09
<!-- meta: section=2; objective=2.7; answer=A -->
**Question:** Millions of PDFs in enterprise file storage must be ingested with file content and metadata. Which source capability is relevant?

A. A managed file-source connector or Auto Loader `binaryFile`, depending on source support  
B. `mean()`  
C. A left join  
D. A SQL `DENY`

**Rationale:** Unstructured files can be ingested by supported managed file connectors or as binary files with metadata.

### Q10
<!-- meta: section=2; objective=2.2; answer=D -->
**Question:** A third file is added after two files were loaded with `COPY INTO`. What happens on the next identical command?

A. All three are duplicated.  
B. The table is truncated.  
C. No files are considered.  
D. Only the unseen file is loaded by default.

**Rationale:** `COPY INTO` tracks processed files and incrementally loads newly discovered files.

### Q11
<!-- meta: section=2; objective=2.1; answer=B -->
**Question:** A pipeline runs every 15 minutes with `Trigger.AvailableNow()` and processes only new files. Which description fits?

A. Continuous processing only  
B. Triggered incremental micro-batch processing  
C. Full table federation  
D. A non-incremental backfill every time

**Rationale:** Each run is bounded but processes the incremental backlog.

### Q12
<!-- meta: section=2; objective=2.5; answer=C -->
**Question:** A REST ingestion job receives HTTP 429 responses. Which implementation is most appropriate?

A. Retry immediately without limit.  
B. Ignore missing pages.  
C. Honor retry/backoff behavior, persist page state, and keep writes idempotent.  
D. Increase Spark shuffle partitions.

**Rationale:** Rate-limited API ingestion needs bounded backoff and durable cursor/state handling.

### Q13
<!-- meta: section=3; objective=3.1; answer=B -->
**Question:** A missing `country` means unknown, while the real code `ZZ` has a business meaning. How should silver handle null country values?

A. Always replace them with `ZZ`.  
B. Preserve null or use an explicit `UNKNOWN` category that cannot be confused with a real code.  
C. Replace them with zero.  
D. Delete the entire customer table.

**Rationale:** Imputation must preserve meaning; a real code must not be overloaded as “unknown.”

### Q14
<!-- meta: section=3; objective=3.2; answer=D -->
**Question:** Orders match price records only when both `sku` and `effective_date` match. Which join condition is required?

A. Join on `sku` only.  
B. Cross join then keep all rows.  
C. Union the DataFrames.  
D. Join using both keys.

**Rationale:** The composite business key requires both predicates.

### Q15
<!-- meta: section=3; objective=3.2; answer=A -->
**Question:** A calendar of 365 dates must be paired deliberately with 8 forecast scenarios. Which operation produces the required 2,920 combinations?

A. Cross join  
B. Left anti join  
C. `UNION`  
D. Broadcast inner join on a missing key

**Rationale:** A bounded intentional Cartesian product is a valid cross-join use case.

### Q16
<!-- meta: section=3; objective=3.2; answer=C -->
**Question:** Two SQL result sets must be appended while preserving duplicates. Which operator is correct?

A. `UNION`  
B. `INTERSECT`  
C. `UNION ALL`  
D. `EXCEPT`

**Rationale:** `UNION ALL` appends all rows without duplicate elimination.

### Q17
<!-- meta: section=3; objective=3.3; answer=B -->
**Question:** A source column `email` must become `email_domain` containing the text after `@`. Which transformation is most direct?

A. `countDistinct(email)`  
B. Split the string and select the domain element, then rename/alias it.  
C. Cross join with all domains.  
D. `VACUUM` the table.

**Rationale:** Column split and alias operations reshape the value without changing unrelated rows.

### Q18
<!-- meta: section=3; objective=3.3; answer=D -->
**Question:** Parent rows with null or empty item arrays must remain after flattening. Which operation is preferable?

A. `explode`  
B. `distinct`  
C. `union`  
D. `explode_outer`

**Rationale:** `explode_outer` preserves a parent output row for null/empty input where plain `explode` does not.

### Q19
<!-- meta: section=3; objective=3.4; answer=A -->
**Question:** A source can send the exact same row more than once, and no ordering rule is needed. Which operation removes whole-row duplicates?

A. `distinct()`  
B. `mean()`  
C. `crossJoin()`  
D. `collect()`

**Rationale:** `distinct` eliminates duplicate complete rows.

### Q20
<!-- meta: section=3; objective=3.4; answer=C -->
**Question:** A telemetry table has billions of users, and an approximate unique-user count is acceptable. Which function is appropriate?

A. `count("*")`  
B. `mean("user_id")`  
C. `approx_count_distinct("user_id")`  
D. `summary("user_id")` only

**Rationale:** Approximate distinct counting trades small estimation error for scalable cardinality measurement.

### Q21
<!-- meta: section=3; objective=3.5; answer=B -->
**Question:** A shuffle stage has eight partitions, each several gigabytes, and all spill heavily. Which controlled experiment is sensible?

A. Reduce to four partitions.  
B. Increase shuffle partitions to reduce data per task, then compare the same workload.  
C. Increase driver memory and stop measuring.  
D. Broadcast the multi-terabyte side.

**Rationale:** More balanced shuffle partitions can reduce per-task memory pressure; the result must be measured.

### Q22
<!-- meta: section=3; objective=3.7; answer=D -->
**Question:** A bronze pipeline must retain invalid source rows but report their quality rate. Which expectation behavior fits?

A. Drop row  
B. Fail update  
C. Delete the source file  
D. Warn

**Rationale:** Warn writes invalid records and emits metrics, fitting a raw retention requirement.

### Q23
<!-- meta: section=4; objective=4.2; answer=C -->
**Question:** A job must execute a saved SQL query between ingestion and a dashboard refresh. Which task types express the two steps?

A. Two For each tasks  
B. Two table triggers  
C. A SQL task followed by a dashboard task  
D. A Git task followed by a cluster task

**Rationale:** The named task types directly execute a SQL query and refresh a published dashboard.

### Q24
<!-- meta: section=4; objective=4.1; answer=A -->
**Question:** A cleanup notebook must run whether its upstream task succeeds or fails. Which dependency behavior is needed?

A. An all-done style run condition  
B. Success-only  
C. A file-arrival trigger  
D. A branch that is never selected

**Rationale:** Cleanup requires a condition that runs after completion regardless of outcome.

### Q25
<!-- meta: section=4; objective=4.1; answer=D -->
**Question:** A For each task launches 500 API calls at once and overloads the source. What should the engineer change?

A. Add a dependency cycle.  
B. Increase retries to infinity.  
C. Change to a materialized view.  
D. Limit For each concurrency.

**Rationale:** Bounded concurrency protects external systems and workspace capacity.

### Q26
<!-- meta: section=4; objective=4.3; answer=B -->
**Question:** New files land in a Unity Catalog external location. Which Jobs trigger can start the workflow from that event?

A. Table update  
B. File arrival  
C. Schedule only  
D. If/else only

**Rationale:** File-arrival triggers monitor supported Unity Catalog storage locations.

### Q27
<!-- meta: section=4; objective=4.4; answer=A -->
**Question:** An upstream table usually updates by 03:00 but sometimes finishes at 04:30. The downstream job must start only after the update. Which approach is strongest?

A. Table-update trigger  
B. A 03:05 schedule  
C. A 03:10 schedule with more retries  
D. Manual runs forever

**Rationale:** A data-driven trigger models readiness and avoids both premature and empty runs.

### Q28
<!-- meta: section=4; objective=4.2; answer=D -->
**Question:** A downstream task depends on two upstream tasks and should run only if both succeed. What should be configured?

A. No dependencies  
B. A cross join  
C. Two separate jobs with no coordination  
D. Both dependencies with an all-succeeded run condition

**Rationale:** The DAG must include both prerequisites and a success condition.

### Q29
<!-- meta: section=4; objective=4.1; answer=C -->
**Question:** A task times out after 30 minutes, but retrying the same deterministic query always repeats the timeout. What is the best next action?

A. Add unlimited retries.  
B. Hide the failure.  
C. Diagnose and optimize or resize the task, then retest with a justified timeout.  
D. Convert the table to CSV.

**Rationale:** Repeated deterministic timeout requires cause repair, not endless retries.

### Q30
<!-- meta: section=5; objective=5.1; answer=A -->
**Question:** Two developers need isolated branch work in the workspace. Which setup is recommended?

A. Each developer uses their own Git folder and branch.  
B. Both edit the same shared Git folder simultaneously.  
C. Both edit production notebooks.  
D. One emails notebook exports to the other.

**Rationale:** Per-user Git folders avoid conflicting workspace state while branches support collaboration.

### Q31
<!-- meta: section=5; objective=5.2; answer=C -->
**Question:** Which expression references a custom bundle variable named `catalog`?

A. `${catalog.name}`  
B. `${target.catalog}`  
C. `${var.catalog}`  
D. `$SECRET_catalog`

**Rationale:** Custom bundle variables are referenced through the `var` namespace.

### Q32
<!-- meta: section=5; objective=5.3; answer=B -->
**Question:** Which resources can a Declarative Automation Bundle package together?

A. Only SQL text  
B. Source files plus supported jobs, pipelines, dashboards, artifacts, and configuration  
C. Only Git credentials  
D. Only cluster event logs

**Rationale:** A bundle is an end-to-end project definition, not merely a code archive.

### Q33
<!-- meta: section=5; objective=5.4; answer=D -->
**Question:** `databricks bundle validate -t prod` succeeds. What has this proved?

A. All production data is correct.  
B. The job has run successfully.  
C. The resources are deployed.  
D. The resolved production bundle conforms to supported configuration schemas.

**Rationale:** Validation checks configuration; logical tests, deployment, and execution are separate steps.

### Q34
<!-- meta: section=5; objective=5.3; answer=A -->
**Question:** Which identity design follows least privilege for automated production deployment?

A. A workload identity with only required deployment permissions and a separately defined job run identity  
B. A developer's permanent personal token committed to Git  
C. Every analyst as workspace admin  
D. Anonymous deployment

**Rationale:** Automated workload identity and separation of deploy/run permissions reduce privilege and personal dependency.

### Q35
<!-- meta: section=6; objective=6.2; answer=C -->
**Question:** Job failure rate rose only for the validation task after a source change. Which evidence should be compared next?

A. All unrelated dashboards  
B. Git folders from another project  
C. Validation-task history, parameters, input schema, and failure logs before and after the source change  
D. Catalog colors

**Rationale:** Task-specific history and change correlation directly test the suspected regression.

### Q36
<!-- meta: section=6; objective=6.3; answer=A -->
**Question:** Shuffle read/write dwarfs the final output because a query sorts and deduplicates several times. What should the engineer inspect first?

A. Whether filters/projections can move earlier and redundant wide operations can be removed  
B. Whether the table needs a column mask  
C. Whether the Git branch is named correctly  
D. Whether driver output should increase

**Rationale:** Removing unnecessary wide transformations and reducing data before shuffles directly targets the evidence.

### Q37
<!-- meta: section=6; objective=6.4; answer=D -->
**Question:** Predictive optimization is enabled for eligible managed tables. Which scheduled job is most likely redundant?

A. A business transformation job  
B. A source-ingestion job  
C. A dashboard refresh  
D. A manual `OPTIMIZE`/`VACUUM` maintenance job for the same tables

**Rationale:** Predictive optimization automatically performs maintenance, so duplicate schedules add cost and conflict.

### Q38
<!-- meta: section=6; objective=6.5; answer=B -->
**Question:** A compute resource fails before Spark starts because the cloud role cannot access the root storage bucket. Which category is this?

A. A DataFrame join bug  
B. A startup permission/configuration failure  
C. A gold aggregation problem  
D. A column-mask conflict

**Rationale:** The cluster failed during startup due to cloud access, before workload code executed.

### Q39
<!-- meta: section=7; objective=7.1; answer=D -->
**Question:** Which table type is the default and recommended choice for a new Unity Catalog table when no external lifecycle requirement exists?

A. Foreign  
B. Temporary  
C. External CSV  
D. Managed

**Rationale:** Managed tables let Unity Catalog manage storage lifecycle and optimization.

### Q40
<!-- meta: section=7; objective=7.1; answer=B -->
**Question:** A qualifying external Delta table is converted with `SET MANAGED`. What is the intended effect?

A. Delete all history.  
B. Move management to Unity Catalog while retaining table configuration and history.  
C. Turn the table into a view.  
D. Disable governance.

**Rationale:** `SET MANAGED` is designed to preserve the table identity/configuration while converting lifecycle management.

### Q41
<!-- meta: section=7; objective=7.2; answer=A -->
**Question:** Human analysts need read access to every current and future table in one schema. What is a scalable least-privilege approach?

A. Grant required usage and schema-level `SELECT` to an analyst group.  
B. Make every analyst metastore admin.  
C. Grant ownership of the catalog to every analyst.  
D. Commit cloud credentials to notebooks.

**Rationale:** Group-based inherited grants at the intended schema scope avoid per-table work and excess privilege.

### Q42
<!-- meta: section=7; objective=7.2; answer=C -->
**Question:** A principal has `MANAGE` on a table but no `SELECT`. What can be concluded?

A. `MANAGE` automatically includes every data privilege.  
B. The principal can always read the table.  
C. The principal can manage permissions but must receive or grant itself the needed data privilege.  
D. The table becomes external.

**Rationale:** `MANAGE` supports permission management but does not automatically grant data access.

### Q43
<!-- meta: section=7; objective=7.3; answer=D -->
**Question:** A secure result must join two base tables, filter rows, and expose derived columns without granting users direct base-table access. Which control is suitable?

A. Liquid clustering  
B. A file-arrival trigger  
C. A direct column mask only  
D. A dynamic view

**Rationale:** Dynamic views can combine, reshape, filter, and mask multiple sources into a curated interface.

### Q44
<!-- meta: section=7; objective=7.4; answer=B -->
**Question:** Which tags can ABAC policies use for automatic policy matching?

A. Any comment string with no governance  
B. Governed tags  
C. Git tags only  
D. Cloud object-storage tags only

**Rationale:** Unity Catalog ABAC relies on governed tags whose creation and assignment are access controlled.

### Q45
<!-- meta: section=7; objective=7.3; answer=A -->
**Question:** A column mask is applied to `ssn`. What happens to the stored table value?

A. It remains unchanged; the function changes the value returned at query time.  
B. It is permanently overwritten.  
C. The column is dropped.  
D. The entire row is hidden.

**Rationale:** Column masking is a query-time visibility control, not a destructive rewrite.

## Official source set

- [Exam guide](https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf)
- [Reference architecture](https://docs.databricks.com/aws/en/lakehouse-architecture/reference)
- [Auto Loader](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/)
- [PySpark functions](https://docs.databricks.com/aws/en/pyspark/reference/functions/)
- [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)
- [Bundle configuration](https://docs.databricks.com/aws/en/dev-tools/bundles/reference)
- [Predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)
- [Unity Catalog access control](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/)

