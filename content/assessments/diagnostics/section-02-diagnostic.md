# Section 2 Diagnostic — Data Ingestion and Loading

### D01
<!-- meta: objective=2.1; answer=C -->
**Question:** A task runs every hour and loads only files not previously processed. How should it be classified?

A. Full-refresh streaming  
B. Continuous non-incremental ingestion  
C. Incremental batch ingestion  
D. Federation

**Rationale:** Incremental describes processing only new data; the hourly bounded run makes it batch.

**Reference:** [Ingestion connectors](https://docs.databricks.com/aws/en/ingestion)

### D02
<!-- meta: objective=2.2; answer=A -->
**Question:** An engineer reruns the same `COPY INTO` command after a transient failure. What is the default file behavior?

A. Previously loaded files are skipped.  
B. All files are appended again.  
C. The target table is overwritten.  
D. The source files are deleted.

**Rationale:** `COPY INTO` provides idempotent file processing by default.

**Reference:** [`COPY INTO`](https://docs.databricks.com/gcp/en/ingestion/cloud-object-storage/copy-into)

### D03
<!-- meta: objective=2.3; answer=B -->
**Question:** Which Auto Loader path records processing progress so a restarted stream can continue?

A. `cloudFiles.schemaLocation`  
B. `checkpointLocation`  
C. The target table location only  
D. The Git folder

**Rationale:** The checkpoint stores stream and discovered-file progress; schema location stores schema history.

**Reference:** [Auto Loader](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/)

### D04
<!-- meta: objective=2.3; answer=D -->
**Question:** A source directory contains millions of files and repeated listings are costly. Which discovery option is most appropriate where supported?

A. Delete the checkpoint after every run.  
B. Use `collect()` to compare all paths.  
C. Reduce the target table partitions.  
D. Use Auto Loader with managed file events.

**Rationale:** File-event mode avoids repeated full directory listings after establishing its event position.

**Reference:** [Auto Loader file events](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/file-events-explained)

### D05
<!-- meta: objective=2.4; answer=C -->
**Question:** A supported relational database must be replicated with inserts, updates, and deletes while minimizing custom maintenance. Which choice is best?

A. A periodic CSV upload  
B. A custom JDBC full read every minute  
C. A Lakeflow Connect managed CDC connector  
D. A cross join with the source

**Rationale:** A managed database connector supplies source-specific CDC and operational handling.

**Reference:** [Managed connectors](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect)

### D06
<!-- meta: objective=2.5; answer=A -->
**Question:** No managed or standard connector supports a paginated API. What is the most appropriate design?

A. REST ingestion with cursor state, retries, idempotence, secrets, and Lakeflow Jobs orchestration  
B. Auto Loader pointed at the HTTPS URL  
C. `COPY INTO` from the API endpoint  
D. A SQL warehouse file-arrival trigger

**Rationale:** Unsupported APIs require custom client logic; operationalize it with saved state, secret handling, and Jobs.

**Reference:** [Connect to sources](https://docs.databricks.com/aws/en/connect/)

### D07
<!-- meta: objective=2.6; answer=B -->
**Question:** Two CSV files must be loaded once from a governed volume. Which option is simplest?

A. A continuously running Auto Loader stream  
B. `COPY INTO`  
C. A managed Salesforce connector  
D. Lakehouse Federation

**Rationale:** `COPY INTO` is a simple SQL choice for one-time or periodic file loads.

**Reference:** [`COPY INTO`](https://docs.databricks.com/gcp/en/ingestion/cloud-object-storage/copy-into)

### D08
<!-- meta: objective=2.7; answer=D -->
**Question:** Auto Loader receives a JSON field with an unexpected type. Which feature preserves the unexpected content for later repair?

A. `spark.default.parallelism`  
B. `VACUUM`  
C. A dashboard refresh  
D. `_rescued_data`

**Rationale:** The rescued data column stores unexpected fields and type/case mismatches as JSON instead of silently dropping them.

**Reference:** [Auto Loader schema](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema)

### D09
<!-- meta: objective=2.7; answer=C -->
**Question:** A JSON event schema changes frequently, but the team must retain the full raw record. Which bronze design is suitable?

A. Discard every field not in today's schema.  
B. Convert the file to an image.  
C. Store the payload in a `VARIANT` column and extract frequently queried fields later.  
D. Aggregate before landing the record.

**Rationale:** `VARIANT` preserves flexible semi-structured content; important query fields can be typed in silver.

**Reference:** [`VARIANT` ingestion](https://docs.databricks.com/aws/en/ingestion/variant)

### D10
<!-- meta: objective=2.6; answer=A -->
**Question:** What is the best default selection strategy among connector layers?

A. Start with the most managed supported layer and use lower layers when requirements demand customization.  
B. Always write raw REST code.  
C. Always choose the option with the most configuration.  
D. Prefer manual file comparison for transparency.

**Rationale:** Databricks recommends starting with the most managed connector layer that meets the requirement.

**Reference:** [Standard connectors](https://docs.databricks.com/aws/en/ingestion)

