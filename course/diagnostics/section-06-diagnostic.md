# Section 6 Diagnostic — Troubleshooting, Monitoring, and Optimization

### D01
<!-- meta: objective=6.1; answer=B -->
**Question:** A job run took twice as long as yesterday. What should the engineer do first?

A. Double every cluster size.  
B. Compare phases, task durations, input volume, code, runtime, and compute against similar successful runs.  
C. Delete the run history.  
D. Reduce every timeout.

**Rationale:** A comparable baseline distinguishes real regression from volume, setup, queue, or configuration changes.

**Reference:** [Monitor Jobs](https://docs.databricks.com/aws/en/jobs/monitor)

### D02
<!-- meta: objective=6.2; answer=C -->
**Question:** Four downstream tasks are skipped after one upstream task fails. Which item is most likely the root cause?

A. The final skipped task  
B. The section exam weight  
C. The first failed upstream task  
D. The dashboard color

**Rationale:** Skips commonly follow dependency or run-condition behavior; inspect the earliest failure.

**Reference:** [Monitor Jobs](https://docs.databricks.com/aws/en/jobs/monitor)

### D03
<!-- meta: objective=6.3; answer=A -->
**Question:** In one stage, median shuffle read is 300 MB, maximum shuffle read is 8 GB, and one task runs 15 times longer than the others. What is the likely issue?

A. Data skew  
B. Too many Git branches  
C. A missing SQL warehouse  
D. Table ownership

**Rationale:** A large max-to-median task difference and straggler are classic skew evidence.

**Reference:** [Spark UI](https://docs.databricks.com/aws/en/compute/troubleshooting/debugging-spark-ui)

### D04
<!-- meta: objective=6.3; answer=D -->
**Question:** A stage shows disk spill across many oversized shuffle tasks. Which first change is most relevant?

A. Reduce the number of shuffle partitions.  
B. Increase driver result size.  
C. Add a Git folder.  
D. Reduce data per task by fixing skew/data shape or increasing justified parallelism.

**Rationale:** Spill indicates per-task memory pressure; smaller balanced partitions and reduced row width directly target it.

**Reference:** [Compute metrics](https://docs.databricks.com/aws/en/compute/cluster-metrics)

### D05
<!-- meta: objective=6.3; answer=B -->
**Question:** The driver fails immediately after `df.collect()` on a very large DataFrame. What is the best fix?

A. Broadcast the DataFrame.  
B. Avoid collecting the unbounded result to the driver.  
C. Reduce executor memory.  
D. Add a table trigger.

**Rationale:** `collect()` materializes all rows in driver memory and can cause driver OOM.

**Reference:** [Troubleshoot compute](https://docs.databricks.com/aws/en/compute/troubleshooting/)

### D06
<!-- meta: objective=6.4; answer=C -->
**Question:** Which statement about liquid clustering is correct?

A. It must be combined with partitioning and `ZORDER`.  
B. Keys can never change.  
C. It replaces partitioning and `ZORDER` for the table and supports evolving keys.  
D. It is a Jobs retry feature.

**Rationale:** Liquid clustering is a flexible data-layout strategy incompatible with partitioning and `ZORDER` on the same table.

**Reference:** [Liquid clustering](https://docs.databricks.com/aws/en/delta/clustering)

### D07
<!-- meta: objective=6.4; answer=A -->
**Question:** What does predictive optimization run for eligible Unity Catalog managed tables?

A. `OPTIMIZE`, `VACUUM`, and `ANALYZE`  
B. Git commit, push, and merge  
C. Grant, deny, and revoke  
D. Copy, collect, and cross join

**Rationale:** Predictive optimization automates file layout, obsolete-file cleanup, and statistics collection.

**Reference:** [Predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)

### D08
<!-- meta: objective=6.5; answer=D -->
**Question:** A cluster never starts because its init script fails. Where should the engineer begin?

A. The transformation's groupBy logic  
B. The gold table aggregate  
C. The mock-exam timer  
D. The compute event log and init-script/bootstrap output

**Rationale:** No transformation ran; inspect the startup evidence and failing bootstrap component.

**Reference:** [Troubleshoot compute](https://docs.databricks.com/aws/en/compute/troubleshooting/)

### D09
<!-- meta: objective=6.5; answer=B -->
**Question:** A notebook imports package version 2, while a task-scoped library requires version 1. Which response is best?

A. Install both versions in more scopes.  
B. Pin compatible dependencies and remove duplicate conflicting installations.  
C. Increase shuffle partitions.  
D. Convert the target to an external table.

**Rationale:** Aligning and isolating dependency versions addresses the conflict rather than multiplying it.

**Reference:** [Troubleshoot compute](https://docs.databricks.com/aws/en/compute/troubleshooting/)

### D10
<!-- meta: objective=6.3; answer=C -->
**Question:** Where should an engineer inspect execution details for a slow serverless notebook query?

A. Classic Spark UI  
B. Cluster node hardware tab  
C. Query insights and query profile  
D. Git history

**Rationale:** Serverless notebooks/jobs do not expose Spark UI; query insights and profiles provide execution evidence.

**Reference:** [Serverless notebooks](https://docs.databricks.com/aws/en/compute/serverless/notebooks)

