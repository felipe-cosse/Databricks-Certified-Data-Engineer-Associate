export const sections = [
  {
    id: 1,
    slug: "platform",
    title: "Databricks Intelligence Platform",
    shortTitle: "Platform",
    weight: 6,
    objectives: [
      ["1.1", "Core platform components, architecture, Delta Lake, and Unity Catalog"],
      ["1.2", "Compute services, limits, cost models, and workload selection"],
    ],
  },
  {
    id: 2,
    slug: "ingestion",
    title: "Data Ingestion and Loading",
    shortTitle: "Ingestion",
    weight: 21,
    objectives: [
      ["2.1", "Batch, streaming, incremental, local-file, and connector patterns"],
      ["2.2", "Incremental loading with COPY INTO"],
      ["2.3", "Auto Loader discovery, schemas, and file notification"],
      ["2.4", "Lakeflow Connect for enterprise sources"],
      ["2.5", "JDBC, ODBC, and REST ingestion orchestrated with Jobs"],
      ["2.6", "Select the correct ingestion method"],
      ["2.7", "Semi-structured and unstructured data"],
    ],
  },
  {
    id: 3,
    slug: "transformation",
    title: "Data Transformation and Modeling",
    shortTitle: "Transform",
    weight: 22,
    objectives: [
      ["3.1", "Bronze-to-silver cleaning with PySpark and SQL"],
      ["3.2", "Joins, broadcast, cross joins, unions, and union all"],
      ["3.3", "Add, drop, split, rename, filter, and explode"],
      ["3.4", "Deduplication and aggregation"],
      ["3.5", "Tune Spark parameters and re-measure"],
      ["3.6", "Choose gold tables, views, materialized views, or streaming tables"],
      ["3.7", "Apply data-quality checks"],
    ],
  },
  {
    id: 4,
    slug: "jobs",
    title: "Working with Lakeflow Jobs",
    shortTitle: "Jobs",
    weight: 16,
    objectives: [
      ["4.1", "Retries, branching, and looping control flow"],
      ["4.2", "Tasks and DAG dependencies"],
      ["4.3", "Scheduled, file-arrival, and table-update triggers"],
      ["4.4", "Time-based versus data-driven triggers"],
    ],
  },
  {
    id: 5,
    slug: "cicd",
    title: "Implementing CI/CD",
    shortTitle: "CI/CD",
    weight: 10,
    objectives: [
      ["5.1", "Git folders branch, commit, push, and pull-request workflow"],
      ["5.2", "Bundle variables, overrides, and environment configuration"],
      ["5.3", "Deploy assets through development, test, and production"],
      ["5.4", "Validate and deploy with Databricks CLI bundle commands"],
    ],
  },
  {
    id: 6,
    slug: "optimization",
    title: "Troubleshooting, Monitoring, and Optimization",
    shortTitle: "Optimize",
    weight: 10,
    objectives: [
      ["6.1", "Compare job performance with run-history baselines"],
      ["6.2", "Interpret statuses and task graphs"],
      ["6.3", "Identify skew, shuffle, and disk spill"],
      ["6.4", "Use liquid clustering and predictive optimization"],
      ["6.5", "Resolve startup, library, and out-of-memory failures"],
    ],
  },
  {
    id: 7,
    slug: "governance",
    title: "Governance and Security",
    shortTitle: "Govern",
    weight: 15,
    objectives: [
      ["7.1", "Managed and external Unity Catalog table lifecycles"],
      ["7.2", "Privileges, principals, hierarchy, GRANT, and REVOKE"],
      ["7.3", "Column masks and row filters"],
      ["7.4", "Unity Catalog attribute-based access control"],
    ],
  },
];

export const objectiveCount = sections.reduce(
  (total, section) => total + section.objectives.length,
  0,
);

export const aiPrepSteps = [
  ["Set up", "Collect the guide, workspace, schedule, and study journal."],
  ["Prime your AI", "Give it the official blueprint, terminology rules, and evidence standard."],
  ["Track renames", "Reject stale product names and legacy behavior traps."],
  ["Run the learning loop", "Orient, diagnose, deep dive, practice, and repair."],
  ["Complete hands-on minimums", "Produce evidence in a Databricks workspace."],
  ["Use 25/50/25 pacing", "Diagnose, build, then complete timed practice and repair."],
];

export const labs = [
  "Build a medallion path",
  "Prove COPY INTO idempotence",
  "Incremental files with Auto Loader",
  "Clean, join, explode, and deduplicate",
  "Compare gold object types",
  "Enforce data quality",
  "Build a Lakeflow Jobs DAG",
  "Validate a Declarative Automation Bundle",
  "Diagnose and improve a skewed job",
  "Govern access with Unity Catalog",
];

export const renamedProducts = [
  ["Databricks Repos", "Databricks Git folders"],
  ["Databricks Asset Bundles", "Declarative Automation Bundles"],
  ["Delta Live Tables (DLT)", "Lakeflow pipelines"],
  ["Lakeflow Declarative Pipelines", "Lakeflow Spark Declarative Pipelines"],
  ["Databricks Workflows / Jobs", "Lakeflow Jobs"],
  ["SQL endpoints", "SQL warehouses"],
  ["Shared access mode", "Standard access mode"],
  ["Single user access mode", "Dedicated access mode"],
];

