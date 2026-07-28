# Section 5 Diagnostic — Implementing CI/CD

### D01
<!-- meta: objective=5.1; answer=B -->
**Question:** What is the current name for the workspace feature formerly called Databricks Repos?

A. Delta folders  
B. Databricks Git folders  
C. Pipeline repositories  
D. Workspace bundles

**Rationale:** Repos are now called Git folders; some API and CLI names still retain `repos`.

**Reference:** [Git folders](https://docs.databricks.com/aws/en/repos/git-folders-concepts)

### D02
<!-- meta: objective=5.1; answer=D -->
**Question:** Where is a pull request normally created and approved?

A. In a Spark stage  
B. In Catalog Explorer  
C. In a SQL warehouse  
D. In the remote Git provider

**Rationale:** Git folders support branch and commit operations, while the Git provider handles pull-request review and merge policy.

**Reference:** [Git folders](https://docs.databricks.com/aws/en/repos/git-folders-concepts)

### D03
<!-- meta: objective=5.2; answer=A -->
**Question:** One project must deploy to different catalogs in dev and prod. Which design is best?

A. One codebase with bundle targets and variable overrides  
B. Copy and edit the repository for each environment  
C. Hard-code `prod` in every notebook  
D. Manually edit production after every deployment

**Rationale:** Targets and overrides parameterize environment differences while keeping one reviewed codebase.

**Reference:** [Bundle configuration](https://docs.databricks.com/aws/en/dev-tools/bundles/reference)

### D04
<!-- meta: objective=5.3; answer=C -->
**Question:** What are Databricks Asset Bundles now called?

A. Git folders  
B. Lakeflow packages  
C. Declarative Automation Bundles  
D. Deployment notebooks

**Rationale:** The product was renamed; the bundle CLI command remains compatible.

**Reference:** [Bundle FAQ](https://docs.databricks.com/aws/en/dev-tools/bundles/faqs)

### D05
<!-- meta: objective=5.4; answer=B -->
**Question:** Which command checks the resolved bundle configuration without deploying resources?

A. `databricks bundle run`  
B. `databricks bundle validate`  
C. `databricks bundle deploy`  
D. `databricks jobs delete`

**Rationale:** `bundle validate` checks the definition and supported schema.

**Reference:** [Bundle commands](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)

### D06
<!-- meta: objective=5.4; answer=D -->
**Question:** Which command creates or updates bundle-managed resources in the target workspace?

A. `bundle validate`  
B. `bundle summary`  
C. `repos list`  
D. `bundle deploy`

**Rationale:** Deploy applies the bundle definition to the selected target.

**Reference:** [Bundle commands](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)

### D07
<!-- meta: objective=5.4; answer=A -->
**Question:** After deployment, which command starts the resource key `orders_job` in the dev target?

A. `databricks bundle run -t dev orders_job`  
B. `databricks bundle validate orders_job`  
C. `git push orders_job`  
D. `databricks sql run dev`

**Rationale:** `bundle run` starts a deployed job or pipeline resource by key in the selected target.

**Reference:** [Bundle lifecycle](https://docs.databricks.com/aws/en/dev-tools/bundles/work-tasks)

### D08
<!-- meta: objective=5.3; answer=C -->
**Question:** A bundle-managed job is changed directly in the production UI. What is the main risk?

A. Delta Lake loses ACID support.  
B. The Git branch is automatically deleted.  
C. The workspace resource drifts from its source definition and can be overwritten.  
D. The SQL warehouse becomes serverless.

**Rationale:** Bundle source should remain authoritative; UI-only changes are not captured and can be replaced on redeploy.

**Reference:** [Monitor bundle jobs](https://docs.databricks.com/aws/en/jobs/monitor)

### D09
<!-- meta: objective=5.2; answer=B -->
**Question:** Which value is a good bundle variable?

A. A hard-coded personal access token  
B. The deployment catalog name  
C. The correct answer to a unit test  
D. A developer's uncommitted notebook state

**Rationale:** Environment-specific catalog names belong in variables; secrets should not be committed to bundle source.

**Reference:** [Bundle configuration](https://docs.databricks.com/aws/en/dev-tools/bundles/reference)

### D10
<!-- meta: objective=5.3; answer=D -->
**Question:** Which promotion flow is strongest?

A. Manually copy notebooks to production.  
B. Deploy a different unreviewed code revision to each target.  
C. Skip tests after validation succeeds.  
D. Test and validate a reviewed revision, deploy to test, approve, then deploy the same revision to prod.

**Rationale:** Promotion should preserve revision identity and add testing and approval gates.

**Reference:** [CI/CD workflows](https://docs.databricks.com/aws/en/dev-tools/ci-cd/flows)

