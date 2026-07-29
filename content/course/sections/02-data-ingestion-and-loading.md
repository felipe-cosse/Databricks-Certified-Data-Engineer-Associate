# Section 2 — Data Ingestion and Loading

**Exam weight:** 21%
**Official objectives:** 7
**Mock allocation:** 9 of 45 questions

## Orientation

1. **Objective 2.1:** Distinguish batch, streaming, and incremental ingestion and know where local files, standard connectors, and managed connectors fit.
2. **Objective 2.2:** Use idempotent `COPY INTO` to incrementally load files from cloud object storage into a Unity Catalog-governed table.
3. **Objective 2.3:** Use Auto Loader for scalable file discovery with checkpoints, schema controls, and directory-listing or file-event modes.
4. **Objective 2.4:** Configure Lakeflow Connect for reliable ingestion from supported databases, SaaS systems, and enterprise file sources.
5. **Objective 2.5:** Use JDBC/ODBC or REST clients for sources requiring custom notebook logic, then operationalize them with Lakeflow Jobs.
6. **Objective 2.6:** Choose an ingestion method from source support, volume, velocity, format, control, maintenance, and governance requirements.
7. **Objective 2.7:** Land nested, semi-structured, and unstructured data without silently losing unexpected fields.

## 2.1 Ingestion pattern map

### Batch, streaming, and incremental are different axes

- **Batch** processes a bounded set of records at intervals.
- **Streaming** processes an unbounded input continuously or in micro-batches.
- **Incremental** means processing only data not already processed. Both scheduled batch and streaming ingestion can be incremental.

A daily `COPY INTO` can be incremental batch. An Auto Loader stream can be incremental near-real-time ingestion. Do not equate incremental with continuous.

### Main ingestion families

| Source and requirement | First choice | Reason |
|---|---|---|
| Supported SaaS app or database, minimal operations, CDC | Lakeflow Connect managed connector | Source-specific authentication, CDC, retries, schema handling, and maintenance |
| Cloud object storage files arriving over time | Auto Loader | Scalable file discovery, checkpointed incremental processing, schema evolution |
| One-time or periodic file backfill | `COPY INTO` | Simple, retryable, idempotent SQL |
| Message bus or source needing custom Spark logic | Lakeflow Connect standard connector / Structured Streaming | Greater control using Spark APIs |
| Unsupported enterprise source with a supported partner | Partner connector | Vendor-maintained source integration |
| Unsupported API or custom database behavior | REST/JDBC/ODBC code in a job | Full control, but your team owns reliability |
| Small local file for exploration | Workspace upload or Unity Catalog volume | Simple manual entry point, not a production ingestion architecture |

Official guidance is to begin with the most managed layer that supports the source and requirements, then move to a more customizable layer only when necessary.

### Separate four design questions

Do not collapse every ingestion requirement into “batch or streaming.” Ask:

1. **Is the input bounded?** A historical backfill ends; an event feed is unbounded.
2. **How is progress remembered?** File history, a streaming checkpoint, a CDC cursor, or a custom watermark must survive retries.
3. **What starts the work?** A schedule, file arrival, table update, continuous trigger, or manual run is an orchestration choice.
4. **Who owns source behavior?** A managed connector can own source-specific retries and schema changes; custom code makes your team responsible.

For example, Auto Loader with `AvailableNow` is incremental and uses Structured
Streaming state, but each triggered run is bounded and stops after processing
the available backlog. “Uses streaming APIs” and “runs continuously” are not
the same statement.

### State decides whether a retry is safe

| Method | Progress state | Unsafe reset |
|---|---|---|
| `COPY INTO` | Loaded-file history associated with the target table | Recreating the table and assuming the old file history remains |
| Auto Loader | Streaming checkpoint plus a separate schema location | Deleting the checkpoint merely to clear a UI or error |
| Managed CDC connector | Connector and pipeline state | Rebuilding the destination without a documented resynchronization plan |
| Custom REST client | Cursor, watermark, and committed-output boundary designed by your team | Keeping the next cursor only in notebook memory |
| Custom JDBC/ODBC extract | Stored high watermark or processed key range | Advancing the watermark before the destination write commits |

An exam retry question is usually a state question in disguise. Identify which
state says “this input is already complete” and when that state is committed.

## 2.2 `COPY INTO`

`COPY INTO` loads files into a Delta table and tracks previously loaded files. Re-running the same command is idempotent by default: already processed files are skipped unless you explicitly force a reload.

```sql
CREATE TABLE IF NOT EXISTS main.bronze.orders_raw (
  order_id BIGINT,
  customer_id BIGINT,
  order_ts TIMESTAMP,
  amount DECIMAL(12,2),
  source_file STRING
);

COPY INTO main.bronze.orders_raw
FROM (
  SELECT
    order_id::BIGINT,
    customer_id::BIGINT,
    order_ts::TIMESTAMP,
    amount::DECIMAL(12,2),
    _metadata.file_path AS source_file
  FROM '/Volumes/main/landing/orders'
)
FILEFORMAT = CSV
FORMAT_OPTIONS ('header' = 'true');
```

Use `COPY INTO` when:

- Files are already in S3, ADLS, GCS, or a governed volume.
- A SQL-based batch load is sufficient.
- You need simple incremental file tracking without a long-running stream.
- The data volume and file arrival pattern do not require Auto Loader's scale and schema workflow.

Do not build a manual “list every file, compare filenames, insert” process when `COPY INTO` already provides retryable file tracking.

Schema mapping and evolution options depend on format and configuration. Validate the target schema deliberately; idempotence does not prove that columns were parsed correctly.

### Reason about a three-run sequence

Assume files A and B contain 100 rows each:

1. The first `COPY INTO` discovers A and B, commits 200 rows, and records both files.
2. The identical second command discovers the same files but skips them, so the table remains at 200 rows.
3. File C arrives with 50 rows. The third command skips A and B and commits only C, producing 250 rows.

This is idempotent file ingestion, not row-level deduplication. If two
different files contain the same business row, both rows can load. Business-key
deduplication belongs in transformation logic.

Avoid `FORCE = TRUE` unless replaying already loaded files is intentional,
because forced reloads can duplicate rows. A retry after an uncertain client
response normally uses the same command without forcing.

### When `COPY INTO` stops being the best fit

- Very high file counts and frequent arrivals favor Auto Loader's scalable discovery.
- Inserts, updates, and deletes from a database favor a CDC-capable connector.
- Stateful event-time processing requires Structured Streaming or a Lakeflow pipeline.
- Querying a remote source without copying points to federation.

The decision is not that `COPY INTO` is old or weak; its bounded SQL model is
optimized for a different operating shape.

## 2.3 Auto Loader

Auto Loader provides the Structured Streaming source `cloudFiles`. It discovers new files and records ingestion state in the checkpoint.

```python
from pyspark.sql import functions as F

source = "/Volumes/main/landing/events"
checkpoint = "/Volumes/main/checkpoints/events"
schema_location = "/Volumes/main/schemas/events"

events = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", schema_location)
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load(source)
    .withColumn("ingested_at", F.current_timestamp())
    .withColumn("source_file", F.col("_metadata.file_path"))
)

(
    events.writeStream
    .option("checkpointLocation", checkpoint)
    .trigger(availableNow=True)
    .toTable("main.bronze.events_raw")
)
```

### Checkpoint and schema location

- The **checkpoint** records stream progress and discovered-file state. Reusing it lets a restarted stream continue.
- The **schema location** stores inferred schema history under `_schemas`.
- Separate independent ingestion streams need separate checkpoints.

Writing to Delta with a stable checkpoint provides exactly-once processing semantics for discovered files. Deleting the checkpoint makes the stream forget its progress and can cause reprocessing.

### Directory listing versus file events

- **Directory listing** discovers files by listing the input path. It is the default and simple to operate.
- **File notification/events** use cloud events and a cached file-event position to avoid repeated large listings. Current docs recommend managed file events for most workloads where supported.

On a first run, file-event mode still performs a full listing to establish state. A scenario with millions of files and expensive repeated listings points toward file events.

### Schema inference

For JSON, CSV, and XML, Auto Loader infers columns as strings by default to reduce type-change failures. Set `cloudFiles.inferColumnTypes` only when that behavior is wanted. Parquet and Avro carry encoded types.

Schema inference samples data; it does not inspect every future file. Treat inference as an initial contract, then choose an evolution policy.

### Schema evolution and rescued data

Common choices:

- Add new columns to the schema
- Rescue unexpected columns or type mismatches into `_rescued_data`
- Fail and require an explicit schema update
- Provide schema hints for expected types

The rescued data column is a JSON blob containing fields that did not match the active schema and the source file path. It prevents silent loss and gives you a repair path. It is not a substitute for fixing the producer or validating silver data.

```python
raw = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", schema_location)
    .option("cloudFiles.schemaHints", "event_id STRING, amount DECIMAL(12,2)")
    .option("rescuedDataColumn", "_rescued_data")
    .load(source)
)
```

### Schema evolution is an operational event

With `addNewColumns`, Auto Loader records a newly discovered schema and stops
the current stream. The restart uses that updated schema to process the pending
file. This stop is deliberate: a running query should not silently change its
output contract halfway through a micro-batch.

Production implications:

- Keep `schemaLocation` durable and separate from the checkpoint.
- Configure an appropriate Jobs retry so an expected new-column stop can restart.
- Alert on repeated schema failures; retries cannot repair an incompatible contract forever.
- Measure rescued-data frequency and expose it to the silver-quality workflow.
- Give independent streams independent checkpoints, even when they read the same source path.

If a scenario says the schema location updated but the new file did not reach
the table, restart the stream; do not delete its state.

### Discovery mode does not replace processing state

Directory listing and managed file events both feed the same Auto Loader
processing model. File events primarily solve discovery scale and listing
cost. They do not replace the checkpoint, infer business keys, deduplicate
rows inside different files, or decide how silver handles schema drift.

## 2.4 Lakeflow Connect

Lakeflow Connect includes:

- **Managed connectors:** configuration-driven ingestion for supported enterprise applications, databases, and file services.
- **Standard connectors:** more customizable access through Structured Streaming, Lakeflow pipelines, or SQL.
- **Community connectors:** open-source extensions for sources without a Databricks-managed connector.

Managed connectors can include:

- Unity Catalog connection objects for credentials and endpoints
- Source-specific CDC
- Ingestion gateways where required
- Automated retries
- Schema evolution
- API-change maintenance
- Serverless ingestion pipelines
- Destination streaming tables governed by Unity Catalog
- Jobs created for configured schedules

### Connection, pipeline, destination

1. A Unity Catalog **connection** stores the endpoint and authentication configuration.
2. An **ingestion pipeline** reads incrementally from the source.
3. **Destination streaming tables** receive the source data.

For a supported operational database needing inserts, updates, and deletes with minimal custom code, a managed CDC connector is normally better than a JDBC loop.

### Ingestion versus federation

Lakeflow Connect copies source data into governed destination tables. Lakehouse Federation queries a remote source without moving it. If the requirement is low-latency operational reads without replication, federation might fit; if downstream pipelines need a durable ingested copy, use ingestion.

### Managed ingestion lifecycle

A managed-connector design still requires engineering decisions:

1. Create a least-privilege Unity Catalog connection.
2. Choose source objects, destination catalog/schema, and supported CDC behavior.
3. Run the initial snapshot or backfill.
4. Continue incremental ingestion from connector-managed state.
5. Monitor freshness, failures, schema changes, and destination quality.
6. Restrict destination access and transform bronze data before business use.

“Managed” moves source-specific maintenance to Databricks; it does not remove
data ownership, security review, quality rules, or downstream modeling.

The same operational database can support different patterns. Federation fits
a current ad hoc lookup that should not create a copy. Managed ingestion fits a
durable history that must remain usable during a source outage and join to
other lakehouse data.

## 2.5 JDBC, ODBC, and REST

Use custom clients when no suitable managed or standard connector satisfies the source behavior.

### JDBC example

```python
jdbc_options = {
    "url": dbutils.secrets.get("ingestion", "jdbc-url"),
    "dbtable": "public.orders",
    "user": dbutils.secrets.get("ingestion", "user"),
    "password": dbutils.secrets.get("ingestion", "password"),
    "driver": "org.postgresql.Driver",
    "fetchsize": "10000",
}

orders = spark.read.format("jdbc").options(**jdbc_options).load()
orders.write.mode("append").saveAsTable("main.bronze.orders_jdbc")
```

For large relational reads, partition the JDBC read by a suitable numeric/date range where supported. A single unpartitioned JDBC read can bottleneck on one connection.

### ODBC example

ODBC is a client-driver interface rather than a Spark-native distributed
reader. It can be appropriate when a source exposes a supported ODBC driver but
no suitable managed or standard connector. The notebook process makes the
connection, so large extracts require deliberate pagination or key-range
partitioning instead of assuming Spark will parallelize the read.

```python
import pyodbc

connection = pyodbc.connect(
    dbutils.secrets.get("ingestion", "odbc-connection-string")
)
cursor = connection.cursor()
cursor.execute(
    """
    SELECT order_id, customer_id, amount, updated_at
    FROM dbo.orders
    WHERE updated_at >= ? AND updated_at < ?
    """,
    window_start,
    window_end,
)
rows = cursor.fetchmany(10_000)
```

Use parameter binding rather than interpolating values into SQL. Install and
test the matching ODBC driver on compatible compute, close connections, bound
memory with batch fetches, persist the extraction watermark, and keep
credentials in a secret scope. For high-volume sources, prefer a supported
managed connector or a Spark JDBC read when it meets the source requirements.

### REST pattern

A robust REST ingestion notebook should:

1. Authenticate with secrets, not hard-coded tokens.
2. Request pages with deterministic cursors.
3. Handle rate limits and transient failures.
4. Persist a watermark or next-page token.
5. Save raw responses or normalized records to a bronze table.
6. Make retries idempotent.
7. Run as a Lakeflow Job with monitoring and alerts.

The platform cannot automatically supply CDC, schema evolution, and API maintenance for arbitrary custom code. That ownership cost is part of the ingestion-method decision.

### Custom ingestion production checklist

Code that returns rows in a notebook is only an extraction prototype. A
production custom client also needs:

- secret-based authentication and rotation;
- deterministic page, range, or watermark boundaries;
- bounded memory and source-friendly concurrency;
- retry classification for transient versus permanent failures;
- idempotent destination writes;
- state advancement only after the corresponding data commit;
- schema validation and raw-response preservation where appropriate;
- timeouts, metrics, alerts, and a replay procedure;
- a Jobs run identity with only the required privileges.

For JDBC, Spark can parallelize range reads when a suitable partition column
and bounds exist. ODBC is commonly client-driven, so do not assume Spark
automatically distributes it. REST pagination is also client logic; its cursor
must be durable.

### Half-open watermark intervals

A reliable incremental query often uses:

```text
updated_at >= previous_watermark
AND updated_at < current_watermark
```

The lower bound is inclusive and the upper bound is exclusive, so adjacent
runs meet without a gap. If multiple records can share a timestamp, add a
stable tie-breaker or overlap-and-deduplicate strategy. Advancing the current
watermark before the target commit risks permanent data loss after a failure.

## 2.6 Selection framework

Ask these questions in order:

1. Is there a supported managed connector?
2. Does it meet latency, CDC, schema, region, and release-state requirements?
3. Is the source cloud object storage, a message bus, a database, SaaS, local files, or an API?
4. Is the load a backfill, scheduled increment, or continuous stream?
5. How many files/records and how often do they arrive?
6. Does the team need custom transformations during ingestion?
7. Where are credentials and destination objects governed?
8. Who owns retries, schema drift, source API changes, and monitoring?

### Typical decisions

- **Billions of new JSON files:** Auto Loader, not repeated directory scans or plain notebook loops.
- **One-time CSV backfill:** `COPY INTO`, not a permanent streaming pipeline.
- **Supported CRM with CDC:** managed connector, not custom REST polling.
- **Kafka with custom stateful Spark logic:** standard connector/Structured Streaming or a Lakeflow pipeline.
- **Unsupported niche SaaS API:** partner connector if trustworthy and suitable; otherwise a Jobs-orchestrated REST implementation.

### Score candidate methods against the requirement

| Requirement | Prefer | Reject when |
|---|---|---|
| Minimal source-specific maintenance | Managed connector | It lacks the required region, objects, latency, or release state |
| Very large, frequent file discovery | Auto Loader | The source is not file-based or requires database CDC |
| Simple periodic SQL file load | `COPY INTO` | Arrival scale or transformation state requires streaming |
| Custom event logic over Kafka | Standard connector with Structured Streaming | A managed connector already satisfies the behavior |
| Query remote data without a local copy | Lakehouse Federation | Downstream work needs independent history or availability |
| Unsupported API behavior | Custom REST client in Jobs | A managed or partner connector satisfies the requirements |

Start with the most managed method that satisfies every hard requirement. Move
downward in abstraction only for a named capability gap. “Custom is more
flexible” is incomplete unless the scenario requires that flexibility.

### Selection transfer exercise

For each case, name the state, trigger, and operational owner:

1. Ten CSV files arrive monthly and SQL is the team's operating language.
2. A supported database must replicate updates and deletes with little custom maintenance.
3. Millions of JSON files arrive daily and directory listings dominate cost.
4. A remote database remains the system of record and only current ad hoc reads are needed.
5. A niche API returns cursor-based pages and HTTP 429 responses.

If two methods could work, explain the requirement that makes one simpler or
more reliable.

## 2.7 Semi-structured and unstructured data

### Nested JSON

The exam-core approach is to preserve known structure with `STRUCT`, `ARRAY`,
and `MAP`, use schema evolution or rescued data for drift, and type stable
fields in silver.

#### Preview enrichment: `VARIANT`

As of July 2026, Databricks documents `VARIANT` as **Public Preview**. Treat it
as useful enrichment whose availability and limitations must be verified for
your cloud and runtime, not as the only way to answer a semi-structured-data
question. A preview-capable environment can ingest the full flexible payload
into a `VARIANT` column:

```sql
CREATE TABLE main.bronze.api_events (
  payload VARIANT,
  ingested_at TIMESTAMP
);

COPY INTO main.bronze.api_events
FROM '/Volumes/main/landing/api'
FILEFORMAT = JSON
FORMAT_OPTIONS ('singleVariantColumn' = 'payload');
```

`VARIANT` is useful when schema changes frequently and preserving the original
structure matters. Extract frequently filtered fields into typed columns for
clearer contracts and faster access.

### Arrays and nested objects

Land raw structure in bronze. Flatten and type it in silver:

```sql
SELECT
  payload:event_id::STRING AS event_id,
  payload:customer.id::BIGINT AS customer_id,
  item.value:sku::STRING AS sku,
  item.value:quantity::INT AS quantity
FROM main.bronze.api_events,
LATERAL variant_explode(payload:items) AS item;
```

For normal Spark arrays, use `explode` or `explode_outer`. The latter preserves a row when the array is null or empty, which matters when row preservation is required.

### Unstructured files

Auto Loader's `binaryFile` format can ingest file content and metadata such as path, modification time, length, and binary content. Managed file-source connectors can ingest enterprise documents from supported services. Store large files in governed volumes or object storage and keep searchable metadata in tables when that better fits the workload.

### Bronze contracts for flexible data

Preserving raw structure does not mean abandoning contracts. Record:

- source path or message identifier;
- ingestion timestamp and source event time;
- source system and schema/version metadata;
- rescued or parsing status;
- checksum or content length when useful for replay;
- access classification for sensitive documents or fields.

In silver, extract fields whose meaning is stable, enforce types, explode only
the arrays required by the consumer grain, and quarantine records that cannot
meet the contract. Keep the bronze evidence so the repair is reproducible.

### Nested-data grain check

One order with five `items` becomes five item rows after `explode`. Any
order-level amount repeated onto those rows can be counted five times by a
careless aggregate. State the output grain before flattening:

```text
one row per order
one row per order item
one row per event attribute
```

Then select keys and measures that belong to that grain. Semi-structured
questions often test row-count consequences as much as parsing syntax.

## Exam traps

- “Incremental” does not automatically mean “streaming.”
- `COPY INTO` is idempotent file ingestion, not database CDC.
- Auto Loader is for files arriving in cloud storage, not the default for a SaaS application with a managed connector.
- A checkpoint tracks progress; a schema location tracks schema history.
- Deleting or sharing checkpoints can cause duplicate processing or corrupt expectations.
- Managed connectors minimize custom maintenance only for supported sources and configurations.
- The most customizable solution is not automatically the best.
- `_rescued_data` preserves unexpected content; it does not validate business quality.
- Ingestion moves data; federation queries in place.

## Hands-on task

Complete labs 2 and 3:

1. Place two JSON files in a governed volume.
2. Load them with `COPY INTO`.
3. Re-run the command and verify no duplicate rows.
4. Add a third file and verify only it loads.
5. Repeat with Auto Loader and `availableNow`.
6. Add a new field and inspect the schema or rescued data.

## Repair prompt

> I missed objective [2.x]. Build a decision table for the source, latency, scale, schema, CDC, governance, and maintenance requirements. Explain why the correct ingestion method wins and why each alternative adds risk or fails a stated requirement. Cite only current official Databricks docs and give me a runnable mini-example.

## Official references

- [Standard connectors in Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion)
- [Managed connectors in Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect)
- [`COPY INTO`](https://docs.databricks.com/gcp/en/ingestion/cloud-object-storage/copy-into)
- [What is Auto Loader?](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/)
- [Auto Loader schema inference and evolution](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema)
- [JDBC connections](https://docs.databricks.com/aws/en/connect/jdbc-connection)
- [Ingest semi-structured data as `VARIANT`](https://docs.databricks.com/aws/en/ingestion/variant)
- [Section 2 Diagnostic](../../assessments/diagnostics/section-02-diagnostic.md)
