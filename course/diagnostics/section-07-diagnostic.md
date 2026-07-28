# Section 7 Diagnostic — Governance and Security

### D01
<!-- meta: objective=7.1; answer=A -->
**Question:** What happens when a Unity Catalog managed table is dropped?

A. Its metadata and managed data files are deleted.  
B. Only its metadata is deleted; files always remain.  
C. The entire catalog is deleted.  
D. All external locations are deleted.

**Rationale:** Unity Catalog owns the managed table's metadata and data lifecycle.

**Reference:** [Table types](https://docs.databricks.com/aws/en/tables/types)

### D02
<!-- meta: objective=7.1; answer=C -->
**Question:** What happens when a Unity Catalog external table is dropped?

A. Cloud files are always deleted.  
B. The storage credential is deleted.  
C. Table metadata is removed while the underlying files remain.  
D. The table automatically becomes managed.

**Rationale:** The user owns the external data lifecycle; Unity Catalog removes its registration.

**Reference:** [External tables](https://docs.databricks.com/aws/en/tables/external)

### D03
<!-- meta: objective=7.1; answer=B -->
**Question:** Which clause indicates that a table should reference a user-managed cloud path?

A. `CLUSTER BY`  
B. `LOCATION`  
C. `EXPECT`  
D. `BROADCAST`

**Rationale:** A Unity Catalog external table is defined over an external location using `LOCATION`.

**Reference:** [External tables](https://docs.databricks.com/aws/en/tables/external)

### D04
<!-- meta: objective=7.1; answer=D -->
**Question:** A supported Delta external table should become a managed table while retaining configuration and history. Which current operation is designed for this?

A. `DROP TABLE`  
B. `DENY SELECT`  
C. `VACUUM`  
D. `ALTER TABLE ... SET MANAGED`

**Rationale:** On a supported runtime and qualifying table, `SET MANAGED` performs the conversion.

**Reference:** [Convert to managed](https://docs.databricks.com/aws/en/tables/convert-to-managed)

### D05
<!-- meta: objective=7.2; answer=C -->
**Question:** Which privileges normally accompany table `SELECT` in the Unity Catalog hierarchy?

A. `MODIFY` and `MANAGE`  
B. `CREATE TABLE` and ownership  
C. `USE CATALOG` and `USE SCHEMA`  
D. `READ VOLUME` and `WRITE VOLUME`

**Rationale:** A principal must traverse the catalog and schema to access a table.

**Reference:** [Permissions concepts](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/permissions-concepts)

### D06
<!-- meta: objective=7.2; answer=A -->
**Question:** A scenario asks an engineer to use `DENY SELECT` on a Unity Catalog table. What is the correct response?

A. `DENY` is unsupported for Unity Catalog; narrow or revoke grants or use an appropriate fine-grained control.  
B. `DENY` always overrides all Unity Catalog grants.  
C. `DENY` converts the table to external.  
D. `DENY` applies only to service principals.

**Rationale:** SQL `DENY` applies to legacy `hive_metastore`, not Unity Catalog.

**Reference:** [`DENY`](https://docs.databricks.com/gcp/en/sql/language-manual/security-deny)

### D07
<!-- meta: objective=7.2; answer=D -->
**Question:** A user loses a direct `SELECT` grant but still reads the table. What is the most likely explanation?

A. Dropping an external table preserved the grant.  
B. Delta time travel restores privileges.  
C. The SQL warehouse ignores Unity Catalog.  
D. The user receives `SELECT` through a group or inherited parent grant.

**Rationale:** Effective access can come from group membership or inherited catalog/schema privileges.

**Reference:** [Permissions concepts](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/permissions-concepts)

### D08
<!-- meta: objective=7.3; answer=B -->
**Question:** Which control restricts which rows a user receives from a table?

A. Column mask  
B. Row filter  
C. Storage credential  
D. Bundle target

**Rationale:** A row filter evaluates a Boolean policy per row at query time.

**Reference:** [Filters and masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks)

### D09
<!-- meta: objective=7.3; answer=C -->
**Question:** A user's query should return `****1234` instead of the stored account number unless the user belongs to a privileged group. Which control fits?

A. File-arrival trigger  
B. Left join  
C. Column mask  
D. Liquid clustering

**Rationale:** A column mask transforms the visible value based on identity while leaving stored data unchanged.

**Reference:** [Filters and masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks)

### D10
<!-- meta: objective=7.4; answer=A -->
**Question:** The same PII mask must apply automatically to newly tagged columns across many schemas. Which design is best?

A. A Unity Catalog ABAC policy using governed tags  
B. A manual mask added separately by every table owner  
C. A `DENY` on the catalog  
D. A scheduled notebook that renames columns

**Rationale:** ABAC centrally matches governed tags and applies policies across a catalog/schema scope.

**Reference:** [ABAC](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac)

