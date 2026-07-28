# Section 1 Diagnostic — Databricks Intelligence Platform

Answer all ten without notes. Reveal rationales only after committing your answers.

### D01
<!-- meta: objective=1.1; answer=B -->
**Question:** Which component provides ACID transactions and time travel for tables stored in cloud object storage?

A. Unity Catalog  
B. Delta Lake  
C. Lakeflow Jobs  
D. Databricks Git folders

**Rationale:** Delta Lake's transaction log provides reliable table transactions, history, and time travel. Unity Catalog governs access and metadata.

**Reference:** [Delta Lake](https://docs.databricks.com/aws/en/delta)

### D02
<!-- meta: objective=1.1; answer=C -->
**Question:** A user has `SELECT` on `main.sales.orders` but cannot query it. Which missing privileges are the most likely cause?

A. `MODIFY` on the table and `CREATE TABLE` on the schema  
B. `MANAGE` on the table and catalog ownership  
C. `USE CATALOG` on `main` and `USE SCHEMA` on `main.sales`  
D. `BROWSE` on the metastore and `EXECUTE` on the table

**Rationale:** Table access normally also requires usage privileges on the parent catalog and schema.

**Reference:** [Unity Catalog permissions](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/permissions-concepts)

### D03
<!-- meta: objective=1.2; answer=A -->
**Question:** A team needs low-startup, automatically scaled SQL compute for many concurrent BI users. Which choice best fits?

A. Serverless SQL warehouse  
B. Single-node all-purpose compute  
C. Classic job compute  
D. Dedicated interactive compute

**Rationale:** SQL warehouses are designed for SQL analytics and concurrency; serverless provides rapid managed elasticity.

**Reference:** [SQL warehouses](https://docs.databricks.com/aws/en/compute/sql-warehouse)

### D04
<!-- meta: objective=1.2; answer=D -->
**Question:** A workload requires R, Spark RDD APIs, and compute-scoped init scripts. Which compute direction is appropriate?

A. Serverless notebook compute  
B. Serverless SQL warehouse  
C. Serverless pipeline compute  
D. Classic compute with a compatible access mode

**Rationale:** Serverless notebooks/jobs do not support R, RDD APIs, or compute-scoped init scripts; classic compute provides deeper customization.

**Reference:** [Serverless limitations](https://docs.databricks.com/aws/en/compute/serverless/limitations)

### D05
<!-- meta: objective=1.1; answer=C -->
**Question:** Which statement correctly distinguishes Delta Lake from Unity Catalog?

A. Delta Lake manages identities; Unity Catalog stores Parquet row groups.  
B. Delta Lake schedules jobs; Unity Catalog manages Spark executors.  
C. Delta Lake provides table reliability; Unity Catalog provides unified governance.  
D. Delta Lake is a SQL warehouse; Unity Catalog is a runtime.

**Rationale:** Delta Lake handles transactional table behavior, while Unity Catalog handles governance, permissions, lineage, and discovery.

**Reference:** [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/)

### D06
<!-- meta: objective=1.2; answer=B -->
**Question:** Which compute is usually preferred for a nightly production notebook task that needs an isolated, repeatable runtime?

A. A shared all-purpose resource kept running all week  
B. Job compute or serverless jobs  
C. A dashboard's SQL warehouse regardless of language  
D. The developer's personal compute

**Rationale:** Scheduled production work should use job-oriented compute instead of coupling to interactive resources.

**Reference:** [Compute](https://docs.databricks.com/aws/en/compute)

### D07
<!-- meta: objective=1.2; answer=C -->
**Question:** Which SQL warehouse type supports Photon, Predictive IO, and intelligent workload management?

A. Classic only  
B. Pro only  
C. Serverless  
D. All warehouse types equally

**Rationale:** Serverless includes all three; Pro lacks intelligent workload management, and Classic lacks Predictive IO and intelligent workload management.

**Reference:** [Warehouse types](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-types)

### D08
<!-- meta: objective=1.1; answer=A -->
**Question:** What is the standard three-level Unity Catalog name for a table?

A. `catalog.schema.table`  
B. `workspace.database.file`  
C. `metastore.cluster.table`  
D. `region.catalog.partition`

**Rationale:** Unity Catalog objects use the `catalog.schema.object` namespace.

**Reference:** [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/)

### D09
<!-- meta: objective=1.2; answer=D -->
**Question:** A serverless notebook query is slow. Which interface should the engineer use for execution details?

A. Spark UI only  
B. Cluster event log only  
C. Git folder history  
D. Query insights and query profile

**Rationale:** Spark UI is unavailable for serverless notebooks and jobs; query insights/profile provide execution evidence.

**Reference:** [Serverless notebooks](https://docs.databricks.com/aws/en/compute/serverless/notebooks)

### D10
<!-- meta: objective=1.2; answer=B -->
**Question:** Which is the best cost-selection principle?

A. The largest compute always finishes cheaply enough to be optimal.  
B. Consider idle time, startup, scaling, concurrency, limitations, and operational burden.  
C. Serverless is always cheaper for every workload.  
D. Classic is always cheaper because resources are visible.

**Rationale:** Cost is workload-dependent; the exam expects selection from requirements and operating behavior rather than universal claims.

**Reference:** [Compute overview](https://docs.databricks.com/aws/en/compute)

