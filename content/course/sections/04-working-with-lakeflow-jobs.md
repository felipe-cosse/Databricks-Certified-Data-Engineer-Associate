# Section 4 — Working with Lakeflow Jobs

**Exam weight:** 16%  
**Official objectives:** 4  
**Mock allocation:** 7 of 45 questions

## Orientation

1. **Objective 4.1:** Build reliable control flow with retries, run conditions, if/else branches, and for-each loops.
2. **Objective 4.2:** Configure notebook, SQL query, dashboard, and pipeline tasks as a dependency DAG.
3. **Objective 4.3:** Start jobs with scheduled, file-arrival, or table-update triggers.
4. **Objective 4.4:** Choose a clock-based trigger for a business time requirement and a data-driven trigger for source readiness.

## 4.1 Jobs, tasks, and triggers

A **job** is the saved orchestration resource. A **task** is one unit of work. A **trigger** determines when a run starts.

Tasks and their dependencies form a directed acyclic graph:

- Directed: dependencies have an upstream-to-downstream direction.
- Acyclic: the graph cannot loop back to an earlier task.

Loops over data items are implemented with a For each task, not by creating a cycle in the DAG.

## 4.2 Common task types

| Task | Use |
|---|---|
| Notebook | Run a notebook with parameters |
| SQL query/file | Execute SQL on a SQL warehouse or supported compute |
| Dashboard | Refresh a published AI/BI dashboard |
| Pipeline | Start a Lakeflow pipeline update |

Other task types exist, but these four are explicitly named in the blueprint.

### Example DAG

```text
ingest_files (pipeline)
        |
validate_counts (SQL)
      /   \
pass?     fail?
  |         |
transform  notify_quality (notebook)
  |
refresh_dashboard (dashboard)
```

The dashboard task depends on successful transformation, not merely on the job starting.

### Give each task a contract

Before drawing dependencies, define for every task:

| Contract field | Example |
|---|---|
| Input | `processing_date`, source table, or upstream task value |
| Output | Delta table, refreshed dashboard, or validation result |
| Compute | SQL warehouse, serverless job environment, or classic job compute |
| Success condition | Output committed and quality threshold met |
| Retry safety | Repeating the task does not duplicate committed data |
| Owner | Team responsible for code and failure response |

A dependency should represent a real requirement. If `refresh_dashboard`
depends on `transform`, it should be because the dashboard requires the
transformed output—not merely because both tasks happen to be in the same job.

### Validate the graph before execution

Read a DAG from left to right:

1. Every task that consumes an output has the producing task upstream.
2. No dependency path returns to an earlier task.
3. Failure and cleanup tasks use deliberate run conditions.
4. Parallel branches do not write conflicting versions of the same object.
5. A final task that combines branches waits for all required branches, not just one.

If a scenario shows A → B → C → A, adding a retry or trigger cannot repair it.
The graph violates the acyclic requirement.

## 4.3 Dependencies and run conditions

A task can depend on one or more upstream tasks. A downstream task can be configured to run:

- Only when all upstream tasks succeed
- When at least one upstream task fails
- Regardless of upstream success or failure
- Based on another supported run condition

Use a failure-handling task for cleanup or notification rather than duplicating error logic inside every notebook.

### Retries

Configure retries for transient failures such as temporary service or network issues. Relevant settings include:

- Maximum retries
- Delay between retries
- Whether to retry on timeout
- Task timeout

Retries should not hide deterministic failures. A schema contract violation will probably fail identically until data or code changes. Infinite or aggressive retries can increase cost and delay incident detection.

### If/else

An If/else task evaluates an expression and directs control to a true or false branch.

Good uses:

- Continue transformation only when a validation count is above zero.
- Route a quality failure to quarantine or notification.
- Choose a full or incremental path from a parameter.

The condition task controls flow; it does not transform the data.

### For each

A For each task runs a nested task for each item in an input array. It is useful for a bounded, parameterized set such as regions, tables, or dates.

Control concurrency. Launching hundreds of iterations at once can overload the source, exceed workspace limits, or create avoidable cost.

### Design failure paths explicitly

Consider `ingest → validate → publish` plus an alert:

- `publish` should run only when validation succeeds.
- The alert should use a failure condition and run after validation exhausts its allowed retries.
- Cleanup that must always release an external resource can use an all-done condition.
- A success notification should not share the failure condition merely because both send messages.

Run conditions describe final upstream states. A task attempt that fails and
then succeeds after retry leaves a successful final task state, so the
downstream success path can continue.

### Retry decision table

| Failure | Retry? | Reason |
|---|---|---|
| Temporary HTTP 503 from a source | Yes, bounded with delay | The condition is likely transient |
| Executor lost during an otherwise healthy run | Usually bounded | Infrastructure interruption can recover |
| SQL references a nonexistent column | No automatic repair | The same code will fail again |
| Quality rule detects forbidden null keys | Usually no blind retry | Data or rule needs investigation |
| Task exceeds timeout because input tripled | Diagnose first | Repeating the same plan repeats the timeout |

Retries require idempotent work. If a task appends duplicate rows on every
attempt, increasing retries makes the incident worse.

## 4.4 Triggers

### Scheduled trigger

Starts a run from a time-based schedule.

Use when:

- The business requires “every weekday at 06:00.”
- Upstream availability is reliably tied to a time.
- A reporting SLA is clock-based.

### File-arrival trigger

Starts when new files arrive in a monitored Unity Catalog storage location.

Use when:

- Files arrive irregularly.
- Processing should start soon after arrival.
- Repeated empty polling runs would waste compute.

This trigger starts a job; Auto Loader inside a task can still handle scalable, checkpointed file ingestion.

### Table-update trigger

Starts when one or more source tables are updated.

Use when:

- The downstream job should follow actual upstream table changes.
- The dependency is a governed table, not raw file arrival.
- You want to avoid guessing when an upstream job will finish.

### Continuous trigger

Lakeflow Jobs can also run continuously, restarting after completion or failure according to job behavior. The exam objective emphasizes scheduled, file-arrival, and table-update triggers, so prioritize those distinctions.

### Trigger boundary examples

- A file-arrival trigger observes that qualifying files arrived; Auto Loader inside the task remembers which files were processed.
- A table-update trigger observes a table update; it does not guarantee a particular business-quality rule passed unless the upstream process defines that boundary.
- A scheduled trigger represents time, not readiness. Adding a five-minute delay after an upstream schedule is still a time guess.
- A continuous trigger keeps a job active; it is not automatically the lowest-cost or lowest-latency design for every source.

Choose the event closest to the true dependency. If gold requires a committed
silver table, trigger from the silver update rather than the raw file that
started the upstream work.

### Coalescing and repeated events

Data-driven triggers can observe several updates close together. Design the
task to process durable source state rather than assuming every event maps
one-to-one to exactly one business record. The downstream task should be safe
when updates are coalesced or another update occurs while a run is active.

## 4.5 Time-based versus data-driven

| Requirement | Better trigger |
|---|---|
| Regulatory report at 08:00 daily | Scheduled |
| Vendor drops files at unpredictable times | File arrival |
| Gold refresh only after silver table changes | Table update |
| Downstream starts at 02:00 because upstream “usually” ends at 01:50 | Table update, if supported |
| Fixed hourly snapshot regardless of changes | Scheduled |

Data-driven triggers reduce latency and empty runs, but require a source event the trigger can observe. Scheduled triggers are predictable but can run before data arrives or waste runs when nothing changes.

## 4.6 Parameters and dynamic values

Job parameters can flow to tasks. Dynamic value references can pass job and task context such as run identifiers, trigger time, or upstream task values.

Keep parameters explicit:

- `processing_date`
- `catalog`
- `source_path`
- `full_refresh`

Do not encode environment-specific catalog names inside notebook business logic when bundle targets or job parameters can provide them.

## 4.7 Monitoring basics

The Jobs UI shows:

- DAG and task status
- Run history
- Trigger and parameters
- Start/end time and duration
- Task output, logs, and failure details
- Upstream and downstream lineage where available

Read the first failed or blocked upstream task before changing downstream code.

### Parameter precedence and task values

Use job parameters for inputs shared across tasks and task parameters for a
specific task's interface. A downstream task value is useful for small control
data such as a validation count, selected path, or list of tables. It is not a
replacement for storing a large dataset in a table or volume.

When debugging a surprising parameter:

1. Inspect the resolved job-run parameters.
2. Inspect task-level overrides.
3. Confirm the task type's parameter mechanism: notebook widgets, Python script arguments, or SQL parameters.
4. Check the exact dynamic-value reference and upstream task key.

### Status-first monitoring walkthrough

If a job is “Succeeded with failures,” do not read that as “every task
succeeded.” Some tasks failed, but the configured graph allowed successful leaf
tasks to complete. Open the DAG, find failed tasks, and inspect why downstream
recovery paths produced the final job state.

For a slow run, split total time into queue/setup, execution, and downstream
waiting. Compare it with a similar successful run using the same input volume
and configuration before resizing compute.

## Exam traps

- A pipeline task runs a pipeline; a notebook task does not become a pipeline task because the notebook contains ETL.
- A dashboard task refreshes a published dashboard.
- A DAG cannot contain a cycle; use For each for looping.
- A schedule is not data readiness.
- A file-arrival trigger starts orchestration; it is not the same as Auto Loader's internal file tracking.
- Retrying a permanent code error is not a repair.
- A downstream “all succeeded” condition will not run after an upstream failure.
- Use Jobs for cross-pipeline branching and retries rather than embedding orchestration inside dataflow code.

## Hands-on task

Complete lab 7:

1. Create an ingest notebook task.
2. Add a SQL validation task depending on it.
3. Add an If/else task.
4. Route success to a transform task and failure to a notification notebook.
5. Add a dashboard or placeholder final task.
6. Configure two retries only on the appropriate task.
7. Compare a schedule with a file- or table-update trigger.

## Repair prompt

> I missed objective [4.x]. Draw the scenario as a DAG. Mark each task type, dependency, run condition, retry boundary, and trigger. Explain why the chosen trigger represents the actual business dependency instead of merely polling. Cite the current Lakeflow Jobs docs.

## Official references

- [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)
- [Schedules and triggers](https://docs.databricks.com/aws/en/jobs/triggers)
- [Monitor Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)
- [Run pipelines in a workflow](https://docs.databricks.com/aws/en/ldp/workflows)
- [Dashboard task](https://docs.databricks.com/aws/en/jobs/tasks/dashboard)
- [Section 4 Diagnostic](../../assessments/diagnostics/section-04-diagnostic.md)
