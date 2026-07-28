# Section 1 — Databricks Intelligence Platform

**Exam weight:** 6%  
**Official objectives:** 2  
**Mock allocation:** 3 of 45 questions

## Orientation

1. **Objective 1.1:** Explain how the Databricks platform combines cloud object storage, Delta Lake reliability, Spark/Photon processing, workspace tools, and Unity Catalog governance.
2. **Objective 1.2:** Select compute based on workload language, interactivity, concurrency, customization, startup, operational effort, limitations, and cost behavior.

## 1.1 Build the platform mental model

Think of the platform as cooperating layers, not one giant cluster:

1. **Cloud storage** holds durable data and table files.
2. **Delta Lake** adds a transaction log and table semantics over files.
3. **Compute engines** such as Apache Spark and Photon read and transform data.
4. **Workspace services** provide notebooks, SQL editing, jobs, pipelines, dashboards, and development tools.
5. **Unity Catalog** provides a shared governance layer for data and AI assets.
6. **Lakeflow** covers ingestion, pipelines, and orchestration.

### Control plane and compute plane

The Databricks-managed control plane hosts workspace services and orchestration. Workload execution occurs in a compute plane. With classic compute, resources are provisioned in the customer's cloud account. With serverless, Databricks manages the compute plane and its scaling.

Exam questions rarely need network-diagram trivia. They usually ask what architecture gives you:

- Durable, decoupled storage
- Elastic or workload-specific compute
- One governed namespace
- Reliable table transactions
- Shared data for SQL, engineering, analytics, and AI

### Delta Lake

Delta Lake is the optimized table storage layer used by Databricks. Its transaction log provides:

- ACID transactions
- Schema enforcement and controlled evolution
- Table history and time travel
- Reliable concurrent reads and writes
- Efficient data skipping and optimization features
- Batch and streaming access to the same table

The transaction log is the key distinction. A directory of Parquet files alone does not give the same transaction, history, or concurrent-write guarantees.

```sql
CREATE TABLE main.sales.orders (
  order_id BIGINT,
  customer_id BIGINT,
  order_ts TIMESTAMP,
  amount DECIMAL(12,2)
) USING DELTA;

DESCRIBE HISTORY main.sales.orders;

SELECT *
FROM main.sales.orders VERSION AS OF 4;
```

Time travel is useful for auditing, reproducibility, comparison, and recovery analysis. It is not a replacement for access control or an unlimited backup promise; availability depends on retained files and table maintenance.

### Unity Catalog

Unity Catalog is the unified governance layer. It governs access, ownership, discovery, lineage, and auditing across workspaces.

The standard namespace is:

```text
catalog.schema.object
```

For a table:

```text
main.sales.orders
```

- A **metastore** is the top governance container assigned to workspaces.
- A **catalog** is a major isolation and organization boundary.
- A **schema** groups related assets inside a catalog.
- Tables, views, volumes, functions, models, and other securables live under the hierarchy.

To select a table, a principal usually needs `USE CATALOG`, `USE SCHEMA`, and `SELECT`. Granting only `SELECT` on the table does not bypass missing usage privileges on its parents.

Unity Catalog is not a file format. Delta Lake is not an access-control system. This distinction is a favorite distractor:

- **Delta Lake:** table reliability and storage behavior
- **Unity Catalog:** governance, namespace, permissions, lineage, discovery, auditing

### Workspace tools

The workspace exposes multiple experiences over the same governed data:

- Notebooks for interactive SQL and Python development
- SQL editor and SQL warehouses for analytics
- Lakeflow Jobs for orchestration
- Lakeflow pipelines for declarative batch and streaming dataflows
- Catalog Explorer for governed assets
- Git folders for interactive version-controlled development

The architecture is valuable because teams do not need separate copies of data for every engine. Compute is decoupled from durable storage and governed consistently.

## 1.2 Choose the right compute

### Decision matrix

| Compute | Best fit | Key characteristics | Watch for |
|---|---|---|---|
| Serverless notebooks/jobs | Fast-starting SQL/Python development and jobs with low infrastructure effort | Databricks-managed, automatic provisioning/scaling, Unity Catalog centered | No R or Spark RDD APIs; limited DBFS, init-script, library, and Spark-config support; use query profile instead of Spark UI |
| Classic all-purpose compute | Interactive development needing configurable runtimes, libraries, networking, or languages | User-managed lifecycle; can be shared with Standard access mode or assigned with Dedicated | Idle resources cost money; use autotermination and policies |
| Classic job compute | Repeatable production task needing custom classic configuration | Created for the run and terminated afterward; isolated from interactive sessions | Startup overhead; avoid using expensive all-purpose compute just for scheduled production |
| SQL warehouse | SQL queries, BI tools, dashboards, and concurrent analysts | Photon-optimized SQL compute; serverless, pro, or classic options | Not the general choice for arbitrary Python/Spark workloads |
| Serverless pipeline compute | New Lakeflow pipelines | Databricks-managed and recommended for new pipelines | Always uses Unity Catalog; compute details are less user-configurable |

### Serverless versus classic

Choose **serverless** when quick startup, automatic scaling, and low operational effort matter and the workload fits the supported APIs and data-access model.

Choose **classic** when you require configuration that serverless does not expose, such as particular init scripts, custom Spark extensions, unsupported languages/APIs, instance selection, or certain networking patterns.

Do not memorize “serverless is always cheaper.” Cost depends on workload shape and current pricing. The exam-ready idea is:

- Serverless reduces management and overprovisioning risk through rapid, managed elasticity.
- Classic exposes more infrastructure controls and can be appropriate for stable or specialized workloads.
- Cost questions should consider idle time, startup, autoscaling, concurrency, and operational burden—not only a DBU label.

### SQL warehouse types

- **Serverless:** fullest managed experience, quick start, Photon, Predictive IO, and intelligent workload management.
- **Pro:** compute in the customer cloud account with Photon and Predictive IO; useful when custom networking is required.
- **Classic:** entry-level SQL warehouse with Photon but without Predictive IO or intelligent workload management; slower startup and scaling.

For most new SQL workloads, official guidance favors serverless when available.

### All-purpose versus job compute

- Use **all-purpose** for human iteration, exploration, and collaborative notebook development.
- Use **job compute** or serverless jobs for scheduled, repeatable production tasks.

Running a nightly ETL job on an all-purpose resource simply because it is already running creates coupling, variable dependencies, and avoidable idle cost.

### Standard versus Dedicated access mode

- **Standard** supports multi-user compute with isolation and is the usual collaborative choice.
- **Dedicated** assigns compute to a single user or group and supports workloads that require capabilities unavailable in Standard.

Use current terms. Older material can call these shared and single-user access modes.

## Exam decision process

When a compute question appears:

1. Identify language and API: SQL only, Python/SQL, Scala, R, RDD, custom Spark plugin?
2. Identify interaction: analyst concurrency, notebook development, scheduled task, or pipeline?
3. Identify customization: custom libraries, init scripts, networking, runtime, instance type?
4. Identify operational priority: fastest startup and least management, or deepest control?
5. Identify monitoring needs: query profile or Spark UI?
6. Choose the narrowest compute service designed for that workload.

## Common traps

- Choosing SQL warehouse for a Python ETL job because the source and target are tables
- Choosing all-purpose compute for a scheduled production task
- Claiming serverless supports every Spark API and configuration
- Treating Unity Catalog as table storage
- Treating Delta Lake as the permission hierarchy
- Assuming the biggest resource is automatically the most cost-effective
- Using legacy access-mode or SQL-endpoint terms as if they were current

## Hands-on task

In a workspace:

1. Open Catalog Explorer and identify a catalog, schema, and table.
2. Create a Delta table and insert three rows.
3. Update one row.
4. inspect `DESCRIBE HISTORY`.
5. Query the prior version.
6. Inspect available compute choices and write one workload that fits each.

Record the artifact and your compute decisions in the journal.

## Repair prompt

> I missed an objective 1 question. Compare the compute or platform components in the scenario. Name the exact requirement each option satisfies, identify the decisive requirement, and cite current official Databricks documentation. Then give me a new scenario with the same decision boundary.

## Official references

- [Databricks reference architectures](https://docs.databricks.com/aws/en/lakehouse-architecture/reference)
- [What is Delta Lake?](https://docs.databricks.com/aws/en/delta)
- [What is Unity Catalog?](https://docs.databricks.com/aws/en/data-governance/unity-catalog/)
- [Compute overview](https://docs.databricks.com/aws/en/compute)
- [Serverless compute limitations](https://docs.databricks.com/aws/en/compute/serverless/limitations)
- [SQL warehouse types](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-types)
- [Section 1 Diagnostic](diagnostics/section-01-diagnostic.md)

