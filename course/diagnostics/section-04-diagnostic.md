# Section 4 Diagnostic — Working with Lakeflow Jobs

### D01
<!-- meta: objective=4.2; answer=A -->
**Question:** Which Lakeflow Jobs task type directly refreshes a published AI/BI dashboard?

A. Dashboard task  
B. Notebook task  
C. For each task  
D. Pipeline task

**Rationale:** A dashboard task refreshes results for a published dashboard.

**Reference:** [Dashboard task](https://docs.databricks.com/aws/en/jobs/tasks/dashboard)

### D02
<!-- meta: objective=4.2; answer=C -->
**Question:** Why must a Jobs task graph be acyclic?

A. Every task must use the same compute.  
B. Jobs can contain only one task.  
C. Dependencies cannot circle back to an upstream task.  
D. Acyclic graphs cannot branch.

**Rationale:** A DAG has directed dependencies without cycles; loops use control-flow tasks rather than dependency cycles.

**Reference:** [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)

### D03
<!-- meta: objective=4.1; answer=B -->
**Question:** A transient HTTP call occasionally fails. Which configuration is appropriate?

A. Infinite immediate retries  
B. A bounded retry count with a delay  
C. A cross join  
D. A table-update trigger

**Rationale:** Bounded delayed retries can recover transient errors without masking persistent failures.

**Reference:** [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)

### D04
<!-- meta: objective=4.1; answer=D -->
**Question:** The same validation failure occurs on every retry because a required column is absent. What should the engineer do?

A. Increase the retry count indefinitely.  
B. Add more workers.  
C. Change the schedule.  
D. Repair the data or code contract rather than relying on retries.

**Rationale:** Deterministic schema failures persist until the cause changes; retries add delay and cost.

**Reference:** [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)

### D05
<!-- meta: objective=4.1; answer=C -->
**Question:** A job must run the same notebook once for each of 12 regions. Which control-flow feature fits?

A. Create a dependency cycle.  
B. Use a dashboard task.  
C. Use a For each task with controlled concurrency.  
D. Create 12 unrelated workspaces.

**Rationale:** For each runs a nested task per input element and supports controlled concurrency.

**Reference:** [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)

### D06
<!-- meta: objective=4.3; answer=A -->
**Question:** Files arrive at irregular times and processing should start soon after arrival. Which trigger is best?

A. File arrival  
B. Fixed daily schedule  
C. Table update on an unrelated table  
D. Manual only

**Rationale:** A file-arrival trigger represents the actual event and avoids empty polling runs.

**Reference:** [Jobs triggers](https://docs.databricks.com/aws/en/jobs/triggers)

### D07
<!-- meta: objective=4.3; answer=D -->
**Question:** A gold job should run only after its silver source table changes. Which trigger best models that dependency?

A. File arrival on the raw bucket  
B. A schedule earlier than the upstream job  
C. A notebook retry  
D. Table update

**Rationale:** A table-update trigger follows actual governed table changes.

**Reference:** [Jobs triggers](https://docs.databricks.com/aws/en/jobs/triggers)

### D08
<!-- meta: objective=4.4; answer=B -->
**Question:** A report must be delivered every weekday at 08:00 even if source data is unchanged. Which trigger is most appropriate?

A. File arrival  
B. Scheduled  
C. Table update  
D. For each

**Rationale:** The business requirement is tied to the clock, so a scheduled trigger is appropriate.

**Reference:** [Jobs triggers](https://docs.databricks.com/aws/en/jobs/triggers)

### D09
<!-- meta: objective=4.2; answer=C -->
**Question:** A downstream task is skipped after its required upstream task fails. Where should triage begin?

A. The skipped task's business logic  
B. The final dashboard only  
C. The first failed upstream task  
D. The Git provider

**Rationale:** The skip is a dependency symptom; diagnose the earliest failed upstream task.

**Reference:** [Monitor Jobs](https://docs.databricks.com/aws/en/jobs/monitor)

### D10
<!-- meta: objective=4.1; answer=A -->
**Question:** A validation result should route good data to transformation and bad data to an alert task. Which feature expresses this most directly?

A. If/else task  
B. SQL warehouse scaling  
C. Liquid clustering  
D. Git branch

**Rationale:** An If/else control task directs execution to true and false branches.

**Reference:** [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)

