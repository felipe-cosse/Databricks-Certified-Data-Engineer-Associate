# Official Objective Coverage Map

This map mirrors every objective in the May 2026 exam guide. The identifiers in this course are study identifiers, not official Databricks identifiers.

## Section 1 — Databricks Intelligence Platform (6%)

| ID | Objective | Course coverage |
|---|---|---|
| 1.1 | Core platform components, architecture, Delta Lake, and Unity Catalog | Section 1: platform model and request path |
| 1.2 | Compute services, characteristics, limitations, cost models, and workload selection | Section 1: compute decision matrix |

## Section 2 — Data Ingestion and Loading (21%)

| ID | Objective | Course coverage |
|---|---|---|
| 2.1 | Batch, streaming, and incremental patterns; local files; standard and managed connectors | Section 2: ingestion pattern map |
| 2.2 | `COPY INTO` incremental loading from ADLS, S3, or GCS into Unity Catalog tables | Section 2: `COPY INTO` |
| 2.3 | Auto Loader, schema enforcement/evolution, directory listing, and file notification | Section 2: Auto Loader |
| 2.4 | Lakeflow Connect for diverse enterprise sources | Section 2: managed and standard connectors |
| 2.5 | JDBC/ODBC or REST clients in notebooks, typically orchestrated with Jobs | Section 2: JDBC, ODBC, and REST examples; Lab 3 source-method transfer |
| 2.6 | Choose among Auto Loader, Lakeflow Connect, partner connectors, and other methods | Section 2: decision framework |
| 2.7 | Semi-structured and unstructured data, including JSON and nested data | Section 2: JSON, rescued data, binary files, and preview-labeled `VARIANT` enrichment |

## Section 3 — Data Transformation and Modeling (22%)

| ID | Objective | Course coverage |
|---|---|---|
| 3.1 | Bronze-to-silver cleaning with PySpark/SQL | Section 3: clean, cast, and write |
| 3.2 | Inner, left, broadcast, multiple-key, cross, union, and union all operations | Section 3: relational operations |
| 3.3 | Add, drop, split, rename, filter, and explode | Section 3: shape operations |
| 3.4 | Deduplication and aggregation: count, approximate distinct count, mean, summary | Section 3: dedupe and summarize |
| 3.5 | Core Spark tuning parameters and re-measurement | Section 3: evidence-based tuning |
| 3.6 | Gold tables, views, materialized views, and streaming tables | Section 3: gold object selection |
| 3.7 | Data-quality checks for reliable silver and gold datasets | Section 3: constraints and expectations |

## Section 4 — Working with Lakeflow Jobs (16%)

| ID | Objective | Course coverage |
|---|---|---|
| 4.1 | Retries, branching, and looping control flow | Section 4: control-flow patterns |
| 4.2 | Notebook, SQL query, dashboard, and pipeline tasks with DAG dependencies | Section 4: tasks and DAGs |
| 4.3 | Scheduled, file-arrival, and table-update triggers | Section 4: triggers |
| 4.4 | Time-based versus data-driven triggers | Section 4: trigger decision matrix |

## Section 5 — Implementing CI/CD (10%)

| ID | Objective | Course coverage |
|---|---|---|
| 5.1 | Branch, commit, push, and pull-request workflow with Git folders | Section 5: interactive development |
| 5.2 | Environment-specific configuration with bundle variables and overrides | Section 5: variables and targets |
| 5.3 | Deploy jobs, pipelines, and assets through dev, test, and prod | Section 5: bundle lifecycle |
| 5.4 | Databricks CLI commands for bundle validation and deployment | Section 5: CLI workflow |

## Section 6 — Troubleshooting, Monitoring, and Optimization (10%)

| ID | Objective | Course coverage |
|---|---|---|
| 6.1 | Compare job performance with run-history baselines | Section 6: trend analysis |
| 6.2 | Interpret statuses and task graphs to find blockers and failure trends | Section 6: pipeline-health triage |
| 6.3 | Identify skew, shuffle, and disk spill in Spark UI | Section 6: stage-level diagnosis |
| 6.4 | Liquid clustering and predictive optimization | Section 6: table optimization |
| 6.5 | Cluster startup, library, and out-of-memory failures | Section 6: failure playbooks |

## Section 7 — Governance and Security (15%)

| ID | Objective | Course coverage |
|---|---|---|
| 7.1 | Managed and external Unity Catalog tables; lifecycle and conversions | Section 7: table ownership model |
| 7.2 | `GRANT`, `REVOKE`, and `DENY`; principals and hierarchy | Section 7: privileges and the `DENY` trap |
| 7.3 | Column masking and row filtering based on groups | Section 7: fine-grained access |
| 7.4 | Unity Catalog ABAC for centralized row filters and masks | Section 7: governed tags and policies |

## Completeness check

- Sections: **7 of 7**
- Objectives: **33 of 33**
- Section diagnostics: **7 × 10 questions**
- Hands-on tasks: **10**
- Full mock exams: **3 × 45 questions**
- AI Prep Guide steps: **6 of 6**

“33 of 33” means every objective has explicit lesson and assessment coverage;
it is not a claim that every objective can be reproduced without external
services. Hands-on mappings cover all 33 objectives. Lab 3 uses a simulated
design artifact for managed connectors and ODBC/REST sources when external
credentials are unavailable.
