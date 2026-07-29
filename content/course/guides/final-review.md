# Final Review and Exam Strategy

## One-page decision sheet

### Ingestion

| Signal | Choose |
|---|---|
| Supported database/SaaS, CDC, minimal maintenance | Lakeflow Connect managed connector |
| Files arriving incrementally in object storage | Auto Loader |
| Simple backfill or scheduled file increment | `COPY INTO` |
| Message bus or custom Spark control | Standard connector / Structured Streaming / Lakeflow pipeline |
| Unsupported custom API | REST client in a Jobs-orchestrated notebook |

### Transformation

| Requirement | Choose |
|---|---|
| Preserve every left row | Left outer join |
| Keep only matches | Inner join |
| Avoid shuffle with a safely small dimension | Broadcast join |
| Append all rows in SQL | `UNION ALL` |
| Remove duplicate result rows in SQL | `UNION` |
| Align PySpark columns by name | `unionByName` |
| Keep latest record per key | Window + `row_number` |
| Flatten arrays | `explode` / `explode_outer` |

### Gold object

| Requirement | Choose |
|---|---|
| Durable independently written object | Table |
| Always-current logical query, no cached result | View |
| Precomputed refreshed query result | Materialized view |
| Incrementally maintained unbounded input | Streaming table |

### Jobs triggers

| Dependency | Trigger |
|---|---|
| Business clock | Scheduled |
| New files | File arrival |
| Upstream governed table change | Table update |

### CI/CD

| Need | Feature |
|---|---|
| Interactive Git development | Git folders |
| Code review | Pull request in Git provider |
| Project/resources as code | Declarative Automation Bundles |
| Environment differences | Variables, targets, overrides |
| Check configuration | `databricks bundle validate` |
| Create/update workspace resources | `databricks bundle deploy` |
| Start a deployed resource | `databricks bundle run` |

### Performance

| Evidence | Likely issue |
|---|---|
| One task much slower; max shuffle far above median | Skew |
| Large exchange stages | Shuffle |
| Spill metrics | Per-task memory pressure / oversized partitions |
| Driver fails after collection | Driver OOM |
| Downstream skipped | Upstream failure or run condition |
| Repeated high-cardinality filters | Liquid clustering candidate |

### Governance

| Requirement | Control |
|---|---|
| Baseline object access | Grants and ownership |
| Hide rows on one table | Row filter |
| Obscure a sensitive column on one table | Column mask |
| Apply common rules across tagged objects | ABAC |
| Preserve files after table drop | External table |
| Databricks-managed lifecycle and optimization | Managed table |

## Forty high-value traps

1. Incremental is not synonymous with streaming.
2. `COPY INTO` tracks files; it is not database CDC.
3. A checkpoint stores stream progress; a schema location stores schema history.
4. Auto Loader handles object-storage files, not every enterprise source.
5. Managed connectors minimize operations only for supported sources.
6. Federation queries remotely; ingestion moves data.
7. `_rescued_data` preserves unexpected fields but does not validate them.
8. Bronze preserves source fidelity.
9. Silver is cleaned detail, not necessarily aggregated.
10. Gold is business-ready and can use several object types.
11. Inner join drops nonmatches.
12. Left join preserves the left side.
13. Broadcasting changes execution, not logical results.
14. An unsafe broadcast can cause executor memory failure.
15. A cross join creates a Cartesian product.
16. PySpark `union` aligns by position and keeps duplicates.
17. SQL `UNION` deduplicates; `UNION ALL` does not.
18. `dropDuplicates(keys)` does not promise the latest record.
19. `explode` increases rows and can drop null/empty arrays.
20. `count(column)` excludes nulls.
21. Tune from a baseline, one hypothesis at a time.
22. More partitions can create overhead; fewer can create oversized tasks.
23. A view does not cache query results.
24. A materialized view is refreshed and precomputed.
25. Primary and foreign keys are informational, not uniqueness enforcement.
26. Warn, drop, and fail expectations have different data-loss and availability effects.
27. A Jobs graph is acyclic; For each implements looping.
28. A schedule does not prove data readiness.
29. Retrying deterministic bad code is not recovery.
30. Git folders are for interactive development; bundles are for deployment.
31. `validate` is not `deploy`; `deploy` is not `run`.
32. Do not create separate drifting codebases for dev/test/prod.
33. A downstream skip is often an upstream symptom.
34. More executors do not split one skewed partition.
35. Serverless compute uses query insights/profile instead of Spark UI.
36. Liquid clustering replaces partitions and `ZORDER` for its table.
37. Predictive optimization targets eligible Unity Catalog managed tables.
38. Dropping an external table leaves data files.
39. `SELECT` may require `USE CATALOG` and `USE SCHEMA`.
40. SQL `DENY` is not supported for Unity Catalog.

## Readiness gates

You are ready to schedule the final review when:

- All 33 objectives are confidence 3 or higher.
- Every diagnostic is at least 8/10.
- All ten labs are complete or have a defensible simulated artifact.
- You can choose ingestion, gold object, Jobs trigger, compute, and governance control without notes.
- You can diagnose skew from task-distribution evidence.
- You can explain all renamed products.

You are ready to sit the exam when:

- You completed three 45-question closed-book mocks.
- You finished each within 90 minutes.
- Every miss and lucky guess has a repair entry.
- No section is consistently below 70%.
- You can explain why each tempting distractor is wrong, not merely recognize a memorized answer.
- At least one unfamiliar transfer scenario per weak objective is correct after a delay.
- The high-weight sections—Ingestion, Transform & Model, Jobs, Governance—are stable.
- You rechecked the official exam guide two weeks before the exam.

The mocks are deliberately challenging practice, not psychometrically
calibrated predictions. A score is evidence only when the question order and
wording are unfamiliar and you can justify the decision boundary. Full
objective coverage, delayed transfer, and hands-on confidence are stronger
signals.

## Exam-day method

### Read for the decision boundary

Underline mentally:

- Source type
- Batch/stream/incremental
- Managed versus customizable
- Rows that must be preserved
- Object refresh behavior
- Trigger dependency
- Evidence from metrics
- Governance scope
- Current product name

### Eliminate by mismatch

For each distractor, ask:

- Does it use the right source type?
- Does it satisfy latency and incremental behavior?
- Does it preserve the required rows?
- Does it operate at the named Unity Catalog scope?
- Does it answer the observed metric rather than a different problem?
- Is it a current product/workflow?

### Flag responsibly

Flag when two answers remain plausible. Record the deciding phrase in the question, answer provisionally, and move on. On review, change an answer only when you identify a concrete requirement you previously missed.

## Final source check

Review:

- [Official exam guide — effective May 4, 2026](https://www.databricks.com/sites/default/files/2026-03/databricks-certified-data-engineer-associate-exam-guide-may-4-2026.pdf)
- [Certification page](https://www.databricks.com/learn/certification/data-engineer-associate)
- [Current renamed product table](renamed-products.md)
- [Objective coverage map](objective-coverage.md)
- Your repair log and hands-on evidence
