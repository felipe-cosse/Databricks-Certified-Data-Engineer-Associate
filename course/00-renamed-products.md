# Renamed Products and Legacy Traps

Product renames are a major source of incorrect AI explanations and plausible exam distractors.

## Current name map

| Older name | Current name | What it does now | Exam note |
|---|---|---|---|
| Databricks Repos | Databricks Git folders | Workspace folders connected to remote Git repositories for interactive development | The API/CLI can still contain `repos` in command or path names. |
| Databricks Asset Bundles | Declarative Automation Bundles | Defines code, resources, and environment targets as a deployable project | The command remains `databricks bundle`. |
| Delta Live Tables (DLT) | Lakeflow pipelines | Managed declarative batch and streaming pipelines | Old `dlt` APIs may still run, but current Python uses `from pyspark import pipelines as dp`. |
| Lakeflow Declarative Pipelines | Lakeflow Spark Declarative Pipelines | Current name emphasizing the Apache Spark declarative framework | The shorter “Lakeflow pipelines” is also used in current docs. |
| Databricks Workflows / Jobs | Lakeflow Jobs | Orchestrates tasks, dependencies, control flow, and triggers | Use the current product name while recognizing older UI screenshots. |
| SQL endpoints | SQL warehouses | Compute optimized for SQL analytics and BI | “Endpoint” may still appear in old material. |
| Shared access mode | Standard access mode | Multi-user compute with isolation | Current docs use Standard. |
| Single user access mode | Dedicated access mode | Compute assigned to one user or group | Current docs use Dedicated. |

## Traps that are not simple renames

### `DENY` versus Unity Catalog

`GRANT` and `REVOKE` are normal Unity Catalog privilege operations. SQL `DENY` is not supported for Unity Catalog objects; it applies to the legacy `hive_metastore`. If a scenario explicitly names Unity Catalog, do not choose `DENY` as the way to remove access. Revoke grants, use least privilege, or apply row filters, masks, ABAC, or workspace bindings as appropriate.

### Lakeflow pipelines versus Lakeflow Jobs

- A pipeline defines and maintains dataflow between streaming tables, materialized views, views, flows, and sinks.
- A job orchestrates tasks across notebooks, queries, dashboards, pipelines, and other workload types.
- Use Jobs for branching, looping, retries, and cross-workload dependencies.

### Auto Loader versus Lakeflow Connect

- Auto Loader is the standard connector for incrementally discovering files in cloud object storage.
- Lakeflow Connect managed connectors add source-specific authentication, CDC behavior, schema handling, retries, and maintenance for supported databases and SaaS applications.
- “Most managed supported option” is a recurring correct-answer pattern.

### Serverless monitoring

Classic compute exposes Spark UI and compute metrics. Serverless notebooks and jobs use query insights and query profiles; Spark UI is not available there. Always read the compute context in a troubleshooting scenario.

## Five-minute session check

Before accepting an AI answer, scan it for:

- Repos
- Asset Bundles
- DLT
- SQL endpoint
- shared or single-user access mode
- `DENY` on Unity Catalog
- advice to use `ZORDER` or partitions automatically where liquid clustering is the current recommendation

Verify any hit.

## Official references

- [What happened to Databricks Repos?](https://docs.databricks.com/gcp/en/repos/what-happened-repos)
- [Declarative Automation Bundles FAQ](https://docs.databricks.com/aws/en/dev-tools/bundles/faqs)
- [What happened to Delta Live Tables?](https://docs.databricks.com/aws/en/ldp/concepts/where-is-dlt)
- [Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/)
- [`DENY` SQL statement](https://docs.databricks.com/gcp/en/sql/language-manual/security-deny)
- [SQL warehouse types](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-types)

