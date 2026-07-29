# Section 7 — Governance and Security

**Exam weight:** 15%  
**Official objectives:** 4  
**Mock allocation:** 7 of 45 questions

## Orientation

1. **Objective 7.1:** Choose managed or external Unity Catalog tables from data ownership and lifecycle requirements, then create, change, drop, or convert them safely.
2. **Objective 7.2:** Grant and revoke privileges for users, groups, and service principals at the right hierarchy level, while recognizing that SQL `DENY` is legacy Hive-metastore behavior.
3. **Objective 7.3:** Use row filters and column masks to restrict data returned at query time based on identity or group membership.
4. **Objective 7.4:** Use Unity Catalog ABAC and governed tags to apply centralized filtering and masking across many objects.

## 7.1 Managed and external tables

| Property | Managed table | External table |
|---|---|---|
| Metadata managed by Unity Catalog | Yes | Yes |
| Data lifecycle managed by Unity Catalog | Yes | No |
| Storage location chosen by | Managed storage hierarchy | User-defined governed external location |
| Default/recommended for new tables | Yes | No, use for a specific external-ownership requirement |
| Drop behavior | Deletes metadata and underlying data | Deletes metadata; leaves data files |
| Predictive optimization | Supported for eligible managed tables | Not managed automatically as a UC managed table |

Unity Catalog managed tables are the default and recommended choice for most new tables.

Use external tables when:

- Existing files must remain in a user-managed location.
- Non-Databricks tools require direct file access that cannot use supported governed access patterns.
- A supported non-Delta external format must be registered.
- The data lifecycle is intentionally owned outside Databricks.

Direct cloud-storage access to external-table files bypasses Unity Catalog enforcement. Governance of direct access must also exist at the cloud layer.

### Create tables

Managed:

```sql
CREATE TABLE main.finance.transactions (
  transaction_id BIGINT,
  account_id BIGINT,
  amount DECIMAL(18,2),
  transaction_ts TIMESTAMP
) USING DELTA;
```

External:

```sql
CREATE TABLE main.finance.transactions_external (
  transaction_id BIGINT,
  account_id BIGINT,
  amount DECIMAL(18,2),
  transaction_ts TIMESTAMP
) USING DELTA
LOCATION 's3://company-governed-data/finance/transactions';
```

The external path should be covered by a Unity Catalog external location with a storage credential. Do not embed long-lived cloud credentials in table DDL.

### Modify and inspect

```sql
ALTER TABLE main.finance.transactions ADD COLUMNS (currency STRING);
ALTER TABLE main.finance.transactions SET TBLPROPERTIES ('quality' = 'silver');
DESCRIBE DETAIL main.finance.transactions;
DESCRIBE EXTENDED main.finance.transactions;
```

### Drop behavior

```sql
DROP TABLE main.finance.transactions;
```

For a managed table, the data lifecycle belongs to Unity Catalog and the underlying data is deleted. For an external table, only catalog metadata is removed and the files remain.

This distinction is one of the most common exam questions.

### Convert external Delta to managed

On a supported current runtime or serverless compute, a qualifying Unity Catalog external Delta table can be converted in place:

```sql
ALTER TABLE main.finance.transactions_external SET MANAGED;
```

`SET MANAGED` retains table configuration and history while moving management to Unity Catalog. It has format, runtime, reader/writer, and feature prerequisites; verify them in the current docs.

Within the documented rollback window, a table converted this way can be returned to its external state:

```sql
ALTER TABLE main.finance.transactions_external UNSET MANAGED;
```

`UNSET MANAGED` is rollback for a recent `SET MANAGED` conversion, not a general command for turning any old managed table into an arbitrary external table. For other migrations, create the desired table and copy/clone data according to supported guidance.

### Decide from lifecycle ownership

Ask who should own the data files after table creation and after table drop:

- If Unity Catalog should choose storage, maintain the files, and remove them with the table, choose managed.
- If another platform or team must retain the path and files independently of Databricks metadata, choose external.

“The data is in cloud storage” does not distinguish the types; both use cloud
storage. The difference is lifecycle ownership and location management.

### Safe lifecycle checklist

Before dropping, converting, or replacing a table:

1. Confirm managed versus external with `DESCRIBE DETAIL`.
2. Identify the storage location and its owner.
3. Check downstream dependencies and lineage.
4. Verify retention, backup, and rollback requirements.
5. Test conversion prerequisites on supported compute.
6. Record who can still access underlying files directly.

An external table drop removes catalog metadata but can leave cloud users able
to read the path. Unity Catalog governance cannot protect access that bypasses
Unity Catalog.

## 7.2 Principals and hierarchy

Principals include:

- Users
- Groups
- Service principals

Prefer grants to groups for human access. Use service principals for automated workloads.

### Hierarchy

```text
metastore
└── catalog
    └── schema
        ├── table
        ├── view
        ├── volume
        └── function
```

Privileges granted on a catalog or schema can inherit to current and future child objects. Grant at the highest level that matches the intended scope—but no higher.

### Read access example

```sql
GRANT USE CATALOG ON CATALOG main TO `finance_analysts`;
GRANT USE SCHEMA ON SCHEMA main.finance TO `finance_analysts`;
GRANT SELECT ON TABLE main.finance.transactions TO `finance_analysts`;
```

### Write access

`MODIFY` allows writes such as insert, update, and delete on tables, with the required usage and select privileges as applicable.

```sql
GRANT MODIFY ON TABLE main.finance.transactions TO `finance_engineers`;
```

### Revoke

```sql
REVOKE SELECT ON TABLE main.finance.transactions FROM `finance_analysts`;
```

A revoke removes that grant. A principal might still receive the same privilege through another group or inherited grant, so inspect effective permissions and group membership.

### `DENY` trap

The SQL `DENY` statement is **not supported for Unity Catalog**. It applies only to objects in the legacy `hive_metastore`.

For Unity Catalog:

- Do not use `DENY` to override a broad grant.
- Revoke or narrow the grant.
- Design group membership and inheritance carefully.
- Use row filters, column masks, ABAC, dynamic views, or workspace bindings for other boundaries.

The official objective lists `GRANT`, `REVOKE`, and `DENY`, making this scope distinction highly testable.

### Ownership and `MANAGE`

- An owner has all capabilities on the owned object and can manage its permissions.
- `MANAGE` allows permission management, ownership transfer, and deletion but does not automatically grant data access.
- `ALL PRIVILEGES` does not include `MANAGE`.

### Compute effective access

Evaluate access from every path:

```text
direct user grants
+ group membership grants
+ inherited catalog/schema grants
+ ownership or MANAGE capabilities
+ row/column policies
= effective result
```

A direct `REVOKE SELECT` does not create a deny. If the user remains in a group
with inherited `SELECT`, access can remain. Inspect effective permissions
instead of reading one statement in isolation.

### Least-privilege examples

| Responsibility | Narrow grant design |
|---|---|
| Analysts read one schema | Group receives parent usage plus schema-level `SELECT` |
| ETL service reads silver and writes gold | Service principal receives usage, narrow silver `SELECT`, and gold `MODIFY` |
| Data steward manages grants but should not read rows | `MANAGE` without automatic `SELECT` |
| Developer creates tables in a sandbox schema | Usage plus schema-scoped create privilege, not catalog ownership |

Ownership is not a convenient substitute for missing privileges. It carries
broad control and should be assigned deliberately.

### Parent privilege reasoning

To resolve `main.finance.transactions`, the principal must be able to traverse
`main` and `finance` before table-level `SELECT` matters. If a question says
the table grant exists but the query fails during name resolution, check
`USE CATALOG` and `USE SCHEMA`.

## 7.3 Row filters and column masks

These controls change what a query returns based on the querying user's identity.

### Row filter

A row filter is a SQL UDF attached to a table. It returns a Boolean for each row.

```sql
CREATE FUNCTION main.security.region_filter(region STRING)
RETURN IF(
  is_account_group_member('global_finance'),
  true,
  region = 'US'
);

ALTER TABLE main.finance.transactions
SET ROW FILTER main.security.region_filter ON (region);
```

Global finance sees all rows; other covered users see only US rows.

### Column mask

A column mask is a SQL UDF that replaces a column value at query time.

```sql
CREATE FUNCTION main.security.mask_account_id(account_id STRING)
RETURN CASE
  WHEN is_account_group_member('finance_privileged') THEN account_id
  ELSE concat('****', right(account_id, 4))
END;

ALTER TABLE main.finance.customers
ALTER COLUMN account_id
SET MASK main.security.mask_account_id;
```

The stored value is not rewritten. Authorized users receive the original value; others receive the function result.

### Table-level controls versus dynamic views

- Table-level row filters/masks secure one table directly.
- A dynamic view can join, reshape, filter, and mask one or more source tables for a curated interface.
- ABAC scales common controls across many tagged objects.

Keep policy UDFs simple and deterministic. Security evaluation can restrict optimizer choices, and complex UDFs can add query cost.

### Trace the query result

Row filters and masks execute when data is queried:

1. Unity Catalog authorizes access to the object.
2. The row-filter function evaluates which rows are visible.
3. Column-mask functions transform protected values in those rows.
4. The user receives the policy-shaped result.

The stored table is unchanged. Removing a mask does not restore values because
the values were never rewritten.

### Choose among three fine-grained controls

| Requirement | Best fit |
|---|---|
| One table hides rows by region | Direct row filter |
| One table obscures account numbers | Direct column mask |
| A secured interface joins tables and derives columns | Dynamic view |
| The same PII rule follows tagged columns across many schemas | ABAC policy |

A column mask changes a value; it does not remove an entire row. A row filter
returns a Boolean for row visibility; it is not a substitute for protecting
one sensitive field.

### Policy-performance discipline

Prefer simple SQL UDFs with minimal arguments. External calls, nondeterministic
logic, or complex Python functions make policies harder to optimize, test, and
audit. Test both an authorized and unauthorized identity and confirm row count,
visible values, and query performance.

## 7.4 Attribute-based access control

Unity Catalog ABAC uses:

- **Governed tags** as controlled attributes on data objects or columns
- **Policies** attached at catalog, schema, or table scope
- **Matching conditions** that select tagged tables or columns
- **Row-filter or column-mask functions** that enforce visibility
- `TO` and `EXCEPT` principal scopes

Example design:

1. A governed tag `classification=pii` can be assigned only by authorized stewards.
2. A catalog-level column-mask policy matches columns with that tag.
3. The policy masks them for ordinary analysts.
4. A trusted operations group is exempt.
5. Newly tagged columns receive the policy automatically.

A simplified current SQL shape is:

```sql
CREATE POLICY mask_pii
ON CATALOG main
COLUMN MASK main.security.mask_value
TO `account users`
EXCEPT `pii_stewards`
FOR TABLES
MATCH COLUMNS
  has_tag_value('classification', 'pii') AS sensitive_column
ON COLUMN sensitive_column;
```

Always consult current syntax and requirements. ABAC availability depends on supported compute, and policies use governed—not arbitrary—tags.

### When ABAC wins

Use ABAC when:

- The same rule must cover many schemas or tables.
- New tagged objects should be protected automatically.
- Policy authors must be separated from table owners.
- Classification attributes drive access consistently.

Use a direct table filter or mask when the rule is intentionally table-specific and limited in scope.

### ABAC operating model

ABAC separates responsibilities:

- Tag administrators define governed keys and allowed values.
- Data stewards assign classification tags.
- Policy authors define reusable row-filter or mask behavior.
- Catalog/schema owners attach centralized policy scope.
- Table owners manage their data without silently removing higher-level policy.

This separation is valuable only when tag assignment is controlled. A free-form
comment such as “contains PII” is not a governed attribute and should not drive
automatic enforcement.

### Policy rollout checklist

1. Inventory columns and tables that should match.
2. Define governed tag keys and allowed values.
3. Test the policy function independently.
4. Attach policy at the narrowest scope that still provides central coverage.
5. Test included, excluded, and newly tagged objects.
6. Monitor performance and audit policy changes.
7. Define an emergency and rollback procedure.

ABAC reduces repetitive attachment work, but a broadly scoped incorrect policy
can also affect many objects. Controlled rollout matters.

### Governance scenario walkthrough

A new column `email` is added tomorrow:

- With manually attached table masks, someone must notice and attach the mask.
- With a catalog ABAC policy matching `classification=pii`, the column is
  protected after an authorized steward applies the governed tag.

The policy does not infer sensitivity by reading the column name; governed
classification remains an explicit responsibility.

## Least-privilege decision process

1. Identify principal type: human, group, or workload.
2. Identify action: discover, read, write, create, manage, or own.
3. Identify narrowest securable scope.
4. Add required parent usage privileges.
5. Prefer group-based human grants.
6. Test effective access with the intended identity.
7. Add row/column controls only when object-level privileges are insufficient.
8. Use ABAC when the control must scale by governed attributes.

## Exam traps

- Dropping an external table does not delete the underlying files.
- Dropping a managed table deletes metadata and managed data.
- `LOCATION` indicates an external table path.
- External table metadata is still governed by Unity Catalog.
- Direct storage access can bypass Unity Catalog.
- `SELECT` alone is insufficient without parent usage privileges.
- A revoke may not remove access received through another group or inherited grant.
- `DENY` is not supported for Unity Catalog.
- `MANAGE` does not automatically grant `SELECT`.
- Row filters restrict rows; column masks transform visible column values.
- ABAC uses governed tags and centrally attached policies.
- `UNSET MANAGED` is a rollback for a recent supported conversion, not a universal conversion tool.

## Hands-on task

Complete lab 10:

1. Create a managed table.
2. Create an external table over a governed path if available.
3. Compare `DESCRIBE DETAIL`.
4. Grant read access to a group at the required hierarchy.
5. Revoke it and inspect effective access.
6. Create a row-filter or column-mask UDF.
7. Write an ABAC design using a governed `classification` tag.
8. State what files remain after dropping each table type.

## Repair prompt

> I missed objective [7.x]. Draw the Unity Catalog hierarchy and list the principal's effective privileges from direct, group, and inherited grants. State who owns the data lifecycle, what the query should reveal, and whether the policy belongs on one table or many tagged objects. Explicitly check the Unity Catalog versus hive_metastore scope. Cite current official docs.

## Official references

- [Unity Catalog table types](https://docs.databricks.com/aws/en/tables/types)
- [External tables](https://docs.databricks.com/aws/en/tables/external)
- [Convert external tables to managed](https://docs.databricks.com/aws/en/tables/convert-to-managed)
- [Unity Catalog permissions concepts](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/permissions-concepts)
- [Manage privileges](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/)
- [Row filters and column masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks)
- [Attribute-based access control](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac)
- [`DENY` scope](https://docs.databricks.com/gcp/en/sql/language-manual/security-deny)
- [Section 7 Diagnostic](../../assessments/diagnostics/section-07-diagnostic.md)
