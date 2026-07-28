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

## 2.7 Semi-structured and unstructured data

### Nested JSON

You can preserve structure as `STRUCT`, `ARRAY`, and `MAP`, or ingest flexible content into a `VARIANT` column.

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

`VARIANT` is useful when schema changes frequently and preserving the original structure matters. Extract frequently filtered fields into typed columns for clearer contracts and faster access.

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
- [Section 2 Diagnostic](diagnostics/section-02-diagnostic.md)

