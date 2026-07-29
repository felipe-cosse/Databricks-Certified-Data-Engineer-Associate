export const glossaryEntries = [
  {
    term: "ABAC",
    aliases: ["attribute-based access control"],
    definition: "Attribute-based access control: policies grant or filter access by governed attributes such as tags.",
  },
  {
    term: "ACID",
    definition: "Atomicity, consistency, isolation, and durability: guarantees that keep table transactions reliable.",
  },
  {
    term: "ADLS",
    definition: "Azure Data Lake Storage: Microsoft's cloud object-storage service for analytics data.",
  },
  {
    term: "AI/BI",
    definition: "Databricks analytics products that combine artificial-intelligence assistance with business-intelligence experiences.",
  },
  {
    term: "AI",
    definition: "Artificial intelligence: software capabilities that perform tasks associated with learning, reasoning, or generation.",
  },
  {
    term: "ANALYZE",
    definition: "A SQL maintenance command that collects table statistics used by the query optimizer.",
  },
  {
    term: "API",
    aliases: ["APIs"],
    definition: "Application programming interface: a defined way for software systems to exchange requests and responses.",
  },
  {
    term: "AQE",
    definition: "Adaptive Query Execution: Spark changes parts of a query plan at runtime using observed statistics.",
  },
  {
    term: "Auto Loader",
    definition: "Databricks file-ingestion capability that incrementally discovers and processes new cloud files.",
  },
  {
    term: "AWS",
    definition: "Amazon Web Services: a cloud platform on which Databricks can run.",
  },
  {
    term: "backfill",
    aliases: ["backfills"],
    definition: "A load that processes older historical data that was not previously ingested.",
  },
  {
    term: "batch ingestion",
    definition: "Data loading that processes a bounded set of records or files in one run.",
  },
  {
    term: "BI",
    definition: "Business intelligence: reporting and analysis used to support organizational decisions.",
  },
  {
    term: "broadcast join",
    aliases: ["broadcast joins", "broadcast"],
    definition: "A join that copies a small input to executors so the large input does not need a full shuffle.",
  },
  {
    term: "bronze",
    definition: "The raw or minimally processed layer in a medallion architecture.",
  },
  {
    term: "bundle",
    aliases: ["bundles", "Declarative Automation Bundle", "Declarative Automation Bundles"],
    definition: "A source-controlled package that defines Databricks resources, files, targets, and deployment settings.",
  },
  {
    term: "catalog",
    aliases: ["catalogs"],
    definition: "The top data-object container beneath a Unity Catalog metastore.",
  },
  {
    term: "CDC",
    definition: "Change data capture: processing source inserts, updates, and deletes incrementally.",
  },
  {
    term: "checkpoint",
    aliases: ["checkpoints"],
    definition: "Durable state that lets a streaming workload resume progress after stopping or failing.",
  },
  {
    term: "CI/CD",
    definition: "Continuous integration and continuous delivery or deployment: automated testing and promotion of reviewed changes.",
  },
  {
    term: "COPY INTO",
    definition: "A SQL command that incrementally loads new files into a table and tracks files already loaded.",
  },
  {
    term: "CRM",
    definition: "Customer relationship management: a system that stores customer, sales, and service interactions.",
  },
  {
    term: "CSV",
    definition: "Comma-separated values: a plain-text tabular file format.",
  },
  {
    term: "classic compute",
    definition: "Databricks compute with customer-configurable runtime, networking, libraries, and cluster settings.",
  },
  {
    term: "CLI",
    definition: "Command-line interface: a terminal tool used to operate Databricks and bundle workflows.",
  },
  {
    term: "cloud object storage",
    definition: "Durable services such as S3, ADLS, or GCS that store data as addressable objects.",
  },
  {
    term: "cluster",
    aliases: ["clusters"],
    definition: "A group of computing resources used to run Spark or other data workloads.",
  },
  {
    term: "column mask",
    aliases: ["column masks", "masking"],
    definition: "A query-time function that changes the value users see without rewriting the stored value.",
  },
  {
    term: "commit",
    aliases: ["commits"],
    definition: "A recorded Git change with an identifier, author, and message.",
  },
  {
    term: "compute plane",
    definition: "The environment where data-processing code runs and accesses customer data.",
  },
  {
    term: "constraint",
    aliases: ["constraints"],
    definition: "A persistent rule that prevents table writes from violating a declared data condition.",
  },
  {
    term: "control plane",
    definition: "Databricks-managed services for workspace interfaces, APIs, orchestration, and configuration.",
  },
  {
    term: "DAG",
    aliases: ["DAGs"],
    definition: "Directed acyclic graph: tasks connected by one-way dependencies without cycles.",
  },
  {
    term: "data lineage",
    aliases: ["lineage"],
    definition: "Recorded relationships showing where data came from and which processes or objects used it.",
  },
  {
    term: "DataFrame",
    aliases: ["DataFrames"],
    definition: "A distributed table-like Spark data structure with named columns and a query plan.",
  },
  {
    term: "Databricks Runtime",
    definition: "A tested Databricks distribution of Spark and supporting libraries for classic compute.",
  },
  {
    term: "DBFS",
    definition: "Databricks File System: legacy workspace file access; governed volumes are preferred for many new data uses.",
  },
  {
    term: "DDL",
    definition: "Data definition language: SQL statements that create or change objects such as tables and schemas.",
  },
  {
    term: "Dedicated access mode",
    definition: "Compute assigned to one user or group, used when workload features require stronger isolation.",
  },
  {
    term: "Delta Lake",
    definition: "An open table format that adds reliable transactions, schema controls, and history to cloud data.",
  },
  {
    term: "Delta table",
    aliases: ["Delta tables"],
    definition: "A table stored with Delta Lake data files and a transaction log.",
  },
  {
    term: "deployment",
    aliases: ["deployments", "deploy"],
    definition: "Applying reviewed resource definitions and code to a target environment.",
  },
  {
    term: "DENY",
    definition: "A SQL permission statement supported for legacy Hive-metastore objects, not Unity Catalog objects.",
  },
  {
    term: "DLT",
    definition: "Delta Live Tables: the former name commonly seen for Lakeflow Declarative Pipelines.",
  },
  {
    term: "driver",
    aliases: ["driver node"],
    definition: "The Spark process that builds plans, schedules work, and coordinates executors.",
  },
  {
    term: "dynamic view",
    aliases: ["dynamic views"],
    definition: "A view whose SQL can return different rows or columns according to the querying identity.",
  },
  {
    term: "ETL",
    definition: "Extract, transform, load: moving source data, changing it, and writing it to a destination.",
  },
  {
    term: "executor",
    aliases: ["executors"],
    definition: "A Spark worker process that executes tasks and stores partition data.",
  },
  {
    term: "expectation",
    aliases: ["expectations"],
    definition: "A Lakeflow pipeline data-quality rule that can warn, drop invalid rows, or fail an update.",
  },
  {
    term: "external location",
    aliases: ["external locations"],
    definition: "A Unity Catalog object that authorizes access to a cloud-storage path.",
  },
  {
    term: "external table",
    aliases: ["external tables"],
    definition: "A table whose data-file lifecycle remains outside Unity Catalog's ownership.",
  },
  {
    term: "federation",
    aliases: ["Lakehouse Federation"],
    definition: "Querying a remote system in place instead of first copying its data into Databricks.",
  },
  {
    term: "file-arrival trigger",
    aliases: ["file arrival trigger"],
    definition: "A Jobs trigger that starts a run when qualifying files arrive at a monitored location.",
  },
  {
    term: "file events",
    definition: "Cloud notifications used to discover new files without repeatedly listing an entire directory.",
  },
  {
    term: "GCS",
    definition: "Google Cloud Storage: Google's cloud object-storage service.",
  },
  {
    term: "GCP",
    definition: "Google Cloud Platform: a cloud platform on which Databricks can run.",
  },
  {
    term: "GB",
    definition: "Gigabyte: a unit of digital data size, approximately one billion bytes.",
  },
  {
    term: "Git",
    definition: "A distributed version-control system for tracking and reviewing source changes.",
  },
  {
    term: "Git folder",
    aliases: ["Git folders"],
    definition: "A Databricks workspace checkout connected to a remote Git repository.",
  },
  {
    term: "gold",
    definition: "The business-ready serving layer containing curated metrics, aggregates, or data products.",
  },
  {
    term: "governed tag",
    aliases: ["governed tags"],
    definition: "A centrally controlled Unity Catalog tag whose keys and values can drive policies.",
  },
  {
    term: "grant",
    aliases: ["grants"],
    definition: "A privilege assignment that allows a principal to perform an action on an object.",
  },
  {
    term: "IAM",
    definition: "Identity and access management: cloud controls for identities, roles, and resource permissions.",
  },
  {
    term: "idempotent",
    aliases: ["idempotence"],
    definition: "Safe to repeat without creating an additional unintended result.",
  },
  {
    term: "ID",
    aliases: ["identifier"],
    definition: "Identifier: a value used to distinguish one record, object, user, or resource from another.",
  },
  {
    term: "incremental ingestion",
    definition: "Loading only data not already processed instead of rereading the full source.",
  },
  {
    term: "ingestion",
    definition: "Moving source data into a platform for storage and downstream processing.",
  },
  {
    term: "JDBC",
    definition: "Java Database Connectivity: a standard interface used by Spark to read and write relational databases.",
  },
  {
    term: "JSON",
    definition: "JavaScript Object Notation: a text format for nested objects, arrays, and primitive values.",
  },
  {
    term: "HTTP",
    definition: "Hypertext Transfer Protocol: the request-and-response protocol commonly used by web APIs.",
  },
  {
    term: "Lakeflow Connect",
    definition: "Databricks ingestion products for managed, standard, and partner-connected data sources.",
  },
  {
    term: "Lakeflow Jobs",
    definition: "Databricks workflow orchestration for tasks, dependencies, triggers, retries, and monitoring.",
  },
  {
    term: "Lakeflow pipeline",
    aliases: ["Lakeflow pipelines", "Lakeflow Declarative Pipelines"],
    definition: "A declarative Databricks system for building reliable batch and streaming data pipelines.",
  },
  {
    term: "least privilege",
    definition: "Granting only the access required for a specific responsibility and no more.",
  },
  {
    term: "liquid clustering",
    definition: "A Delta data-layout strategy that incrementally organizes files around adaptable clustering keys.",
  },
  {
    term: "MANAGE",
    definition: "A Unity Catalog privilege for managing an object's permissions without automatically granting data access.",
  },
  {
    term: "managed connector",
    aliases: ["managed connectors"],
    definition: "A connector where Databricks handles source-specific ingestion behavior and operational maintenance.",
  },
  {
    term: "MB",
    definition: "Megabyte: a unit of digital data size, approximately one million bytes.",
  },
  {
    term: "managed table",
    aliases: ["managed tables"],
    definition: "A table whose metadata and underlying data-file lifecycle are managed by Unity Catalog.",
  },
  {
    term: "materialized view",
    aliases: ["materialized views"],
    definition: "A database object that stores and refreshes the result of its defining query.",
  },
  {
    term: "medallion architecture",
    definition: "A layered data design that moves from raw bronze to validated silver to business-ready gold.",
  },
  {
    term: "metastore",
    aliases: ["metastores"],
    definition: "The top-level Unity Catalog governance boundary containing catalogs and centralized metadata.",
  },
  {
    term: "notebook",
    aliases: ["notebooks"],
    definition: "An interactive document containing executable code, results, and explanatory text.",
  },
  {
    term: "ODBC",
    definition: "Open Database Connectivity: a driver-based interface for client applications to query databases.",
  },
  {
    term: "I/O",
    aliases: ["IO"],
    definition: "Input/output: data read from or written to storage, memory, or a network.",
  },
  {
    term: "OOM",
    definition: "Out of memory: a process failed because it could not allocate enough memory.",
  },
  {
    term: "parameter",
    aliases: ["parameters"],
    definition: "A named input supplied to a job, task, notebook, script, or query at runtime.",
  },
  {
    term: "pagination",
    definition: "Retrieving a large API result in bounded pages connected by offsets or cursors.",
  },
  {
    term: "partition",
    aliases: ["partitions", "partitioning"],
    definition: "One division of distributed data that a Spark task can process.",
  },
  {
    term: "Photon",
    definition: "Databricks' vectorized execution engine for accelerating SQL and DataFrame workloads.",
  },
  {
    term: "PII",
    definition: "Personally identifiable information: data that can identify or be linked to an individual.",
  },
  {
    term: "predictive optimization",
    definition: "Automated maintenance for eligible managed tables, including optimization, cleanup, and statistics collection.",
  },
  {
    term: "OPTIMIZE",
    definition: "A Delta maintenance command that rewrites files to improve layout and data skipping.",
  },
  {
    term: "principal",
    aliases: ["principals"],
    definition: "A user, group, or service principal that can receive privileges.",
  },
  {
    term: "privilege",
    aliases: ["privileges"],
    definition: "Permission to perform a specific action on a governed object.",
  },
  {
    term: "pull request",
    aliases: ["pull requests", "PR", "PRs"],
    definition: "A request to review and merge one Git branch into another.",
  },
  {
    term: "PySpark",
    definition: "The Python API for Apache Spark.",
  },
  {
    term: "query profile",
    aliases: ["query profiles"],
    definition: "A visual breakdown of operators, time, rows, and data movement for a query.",
  },
  {
    term: "rate limit",
    aliases: ["rate limits"],
    definition: "A source-imposed limit on how many API requests may be made in a time window.",
  },
  {
    term: "LTS",
    definition: "Long-term support: a runtime release maintained for a longer stability and support window.",
  },
  {
    term: "RDD",
    aliases: ["RDDs"],
    definition: "Resilient Distributed Dataset: Spark's lower-level distributed collection API.",
  },
  {
    term: "rescued data",
    aliases: ["_rescued_data"],
    definition: "Unexpected fields or type mismatches preserved as JSON for later inspection and repair.",
  },
  {
    term: "REST",
    definition: "Representational State Transfer: a common HTTP-based style for application APIs.",
  },
  {
    term: "retry",
    aliases: ["retries"],
    definition: "A controlled additional attempt after a task fails, usually for transient conditions.",
  },
  {
    term: "revoke",
    aliases: ["revokes"],
    definition: "Removing a previously granted privilege from a principal.",
  },
  {
    term: "row filter",
    aliases: ["row filters"],
    definition: "A Boolean query-time policy that determines which rows a user may see.",
  },
  {
    term: "S3",
    definition: "Amazon Simple Storage Service: AWS cloud object storage.",
  },
  {
    term: "SaaS",
    definition: "Software as a service: an application delivered and operated over the internet.",
  },
  {
    term: "schema",
    aliases: ["schemas"],
    definition: "A named container for data objects; it can also mean a dataset's column structure.",
  },
  {
    term: "schema evolution",
    definition: "Controlled handling of source columns or types that change over time.",
  },
  {
    term: "SDK",
    definition: "Software development kit: libraries and tools for building against a platform API.",
  },
  {
    term: "semi-structured data",
    definition: "Data with nested or flexible organization, such as JSON, rather than a fixed table shape.",
  },
  {
    term: "serverless",
    definition: "Managed compute where Databricks handles infrastructure, startup, scaling, and many runtime details.",
  },
  {
    term: "service principal",
    aliases: ["service principals"],
    definition: "A non-human identity used by applications, automation, and production workloads.",
  },
  {
    term: "shuffle",
    aliases: ["shuffles"],
    definition: "Redistributing data between Spark executors, usually for joins, grouping, or sorting.",
  },
  {
    term: "silver",
    definition: "The validated, cleaned, typed, and deduplicated layer in a medallion architecture.",
  },
  {
    term: "skew",
    definition: "Uneven data distribution that makes a small number of tasks much larger or slower than others.",
  },
  {
    term: "SLA",
    definition: "Service-level agreement: a measurable commitment such as completion time or availability.",
  },
  {
    term: "Spark UI",
    definition: "The classic Spark interface for inspecting jobs, stages, tasks, storage, and executor behavior.",
  },
  {
    term: "spill",
    aliases: ["spilling"],
    definition: "Intermediate Spark data written to disk because it does not fit in execution memory.",
  },
  {
    term: "SQL",
    definition: "Structured Query Language: the standard language for defining, querying, and changing relational data.",
  },
  {
    term: "UNION ALL",
    definition: "A SQL set operation that appends result rows while preserving duplicates.",
  },
  {
    term: "UNION",
    definition: "A SQL set operation that combines compatible results and removes duplicate rows.",
  },
  {
    term: "SQL warehouse",
    aliases: ["SQL warehouses"],
    definition: "Databricks compute designed for SQL analytics, dashboards, and concurrent BI workloads.",
  },
  {
    term: "Standard access mode",
    definition: "Multi-user compute isolation that supports governed access for many common workloads.",
  },
  {
    term: "streaming",
    definition: "Processing an unbounded flow of arriving data through continuing or repeatedly triggered work.",
  },
  {
    term: "streaming table",
    aliases: ["streaming tables"],
    definition: "A durable table maintained incrementally from streaming inputs by a Lakeflow pipeline.",
  },
  {
    term: "Structured Streaming",
    definition: "Spark's DataFrame-based engine for incremental processing of unbounded data.",
  },
  {
    term: "substitution",
    aliases: ["substitutions"],
    definition: "A bundle expression resolved from variables, targets, resources, or workspace context.",
  },
  {
    term: "table-update trigger",
    aliases: ["table update trigger"],
    definition: "A Jobs trigger that starts work after selected upstream tables update.",
  },
  {
    term: "target",
    aliases: ["targets"],
    definition: "A named bundle environment such as development, test, or production.",
  },
  {
    term: "task value",
    aliases: ["task values"],
    definition: "A small value published by one Jobs task for a downstream task to consume.",
  },
  {
    term: "task",
    aliases: ["tasks"],
    definition: "One executable unit inside a Lakeflow Job.",
  },
  {
    term: "trigger",
    aliases: ["triggers"],
    definition: "The event or schedule that starts a job run.",
  },
  {
    term: "UDF",
    aliases: ["UDFs"],
    definition: "User-defined function: custom reusable logic invoked from SQL or a data-processing API.",
  },
  {
    term: "Unity Catalog",
    definition: "Databricks governance for data and AI objects, permissions, discovery, lineage, and auditing.",
  },
  {
    term: "UI",
    definition: "User interface: the visual controls and screens through which a person uses software.",
  },
  {
    term: "URL",
    definition: "Uniform resource locator: the address of a web or network resource.",
  },
  {
    term: "unstructured data",
    definition: "Content without a fixed row-and-column model, such as PDFs, images, audio, or documents.",
  },
  {
    term: "VARIANT",
    definition: "A data type for storing and querying flexible semi-structured values while preserving nested structure.",
  },
  {
    term: "view",
    aliases: ["views"],
    definition: "A named stored query that normally computes its result when queried.",
  },
  {
    term: "volume",
    aliases: ["volumes"],
    definition: "A Unity Catalog object for governed access to non-tabular files in cloud storage.",
  },
  {
    term: "watermark",
    aliases: ["watermarks"],
    definition: "Saved progress boundary used to request only source records newer than a completed interval.",
  },
  {
    term: "VACUUM",
    definition: "A Delta maintenance command that removes obsolete data files beyond the retained history window.",
  },
  {
    term: "workflow",
    aliases: ["workflows"],
    definition: "An orchestrated sequence or graph of tasks that accomplishes a data process.",
  },
  {
    term: "workload identity",
    aliases: ["workload identities"],
    definition: "A non-human identity intended for automated services instead of a person's credentials.",
  },
  {
    term: "workspace",
    aliases: ["workspaces"],
    definition: "A Databricks environment containing users, notebooks, jobs, compute, and other workspace objects.",
  },
  {
    term: "YAML",
    definition: "A human-readable configuration format used by Databricks bundle files.",
  },
  {
    term: "XML",
    definition: "Extensible Markup Language: a tagged text format for structured or semi-structured data.",
  },
  {
    term: "ZORDER",
    aliases: ["Z-ordering"],
    definition: "A Delta file-layout technique that colocates related column values for data skipping.",
  },
];
