# Section 5 — Implementing CI/CD

**Exam weight:** 10%  
**Official objectives:** 4  
**Mock allocation:** 5 of 45 questions

## Orientation

1. **Objective 5.1:** Use Databricks Git folders for branch-based interactive development, commits, pushes, and pull-request collaboration.
2. **Objective 5.2:** Keep one codebase and inject dev, test, and prod differences through Declarative Automation Bundle variables, targets, and overrides.
3. **Objective 5.3:** Package code and workspace resources in a bundle and promote the reviewed definition across environments.
4. **Objective 5.4:** Use the Databricks CLI to validate, deploy, run, inspect, and manage bundles in automated workflows.

## 5.1 Development versus deployment

Separate these concerns:

- **Git folders:** interactive workspace development connected to a remote Git repository.
- **Pull requests:** review and merge through the Git provider.
- **Declarative Automation Bundles:** define and deploy code plus Databricks resources.
- **CI/CD runner:** tests, validates, and deploys the bundle with a machine identity.

Current official guidance uses Git folders for interactive development and bundles for production CI/CD.

## 5.2 Git folders workflow

1. Clone or create a Git folder connected to the remote repository.
2. Create or switch to a feature branch.
3. Edit notebooks and files.
4. Review the diff.
5. Commit and push.
6. Create a pull request in the Git provider.
7. Pass automated checks and review.
8. Merge to the protected branch.
9. Let CI deploy the reviewed revision.

Git folders support pull, push, commit, branch management, diffing, merging, rebasing, and conflict resolution. The remote Git provider remains the collaboration system for pull requests and protected-branch policy.

### Common mistakes

- Editing production code directly in the production workspace
- Treating notebook revision history as the team source of truth
- Sharing one Git folder among multiple developers
- Committing secrets
- Deploying a branch that has not passed review

## 5.3 Declarative Automation Bundles

Declarative Automation Bundles were formerly Databricks Asset Bundles. They provide an infrastructure-as-code project definition for:

- Source files and notebooks
- Lakeflow Jobs
- Lakeflow pipelines
- Dashboards and other supported resources
- Artifacts such as Python wheels
- Tests and deployment metadata
- Environment targets

The command group remains `databricks bundle`.

### Minimal bundle

```yaml
bundle:
  name: associate-course-pipeline

variables:
  catalog:
    description: Destination catalog
    default: dev

resources:
  jobs:
    orders_job:
      name: orders-${bundle.target}
      tasks:
        - task_key: transform
          notebook_task:
            notebook_path: ./src/transform_orders.ipynb
            base_parameters:
              catalog: ${var.catalog}
          environment_key: default
      environments:
        - environment_key: default
          spec:
            client: "4"

targets:
  dev:
    default: true
    mode: development
    variables:
      catalog: dev

  test:
    variables:
      catalog: test

  prod:
    mode: production
    variables:
      catalog: prod
```

Exact resource fields evolve. Use the current schema and `databricks bundle validate`; understand the architecture rather than memorizing every YAML property.

## 5.4 Variables, substitutions, targets, and overrides

### Variables

Custom variables represent values that differ by deployment or must be supplied from outside.

Examples:

- Catalog or schema name
- Warehouse ID
- Notification destination
- Source path
- Service endpoint

Reference a custom variable with:

```text
${var.catalog}
```

### Substitutions

Substitutions reference known bundle/workspace/resource values, such as:

```text
${bundle.name}
${bundle.target}
${workspace.current_user.userName}
${resources.jobs.orders_job.id}
```

### Targets

Targets define deployment contexts such as `dev`, `test`, and `prod`. Target settings override top-level defaults.

One codebase plus target overrides is safer than three drifting copies of the project.

### Development and production modes

Development mode can apply developer-friendly defaults and isolate resources. Production mode applies production-oriented validation and behavior. Do not rely on mode alone for every organizational control; define identities, permissions, paths, and approvals explicitly.

## 5.5 Bundle lifecycle

```text
init → develop → test → validate → deploy → run → observe → promote
```

Core commands:

```bash
databricks bundle init
databricks bundle validate -t dev
databricks bundle deploy -t dev
databricks bundle run -t dev orders_job
databricks bundle summary -t dev
```

After test approval:

```bash
databricks bundle validate -t prod
databricks bundle deploy -t prod
databricks bundle run -t prod orders_job
```

Validation checks the bundle definition against supported schemas and resolves configuration. It does not prove the data transformation is logically correct. Unit and integration tests remain necessary.

### Bundle state

Deployment tracks resources associated with the bundle identity. Deploying a bundle updates the managed resources. If a resource was deployed by a bundle, edit the bundle and redeploy so the source definition remains authoritative; ad hoc UI edits create drift.

### Promotion

A strong promotion flow:

1. Commit identifies source revision.
2. CI runs formatting and tests.
3. CI validates the bundle.
4. Deploy to dev/test.
5. Run integration checks.
6. Require approval for production.
7. Deploy the same reviewed revision to the prod target.

Do not rebuild different code for each environment. Change configuration, identity, and destination through targets.

## 5.6 Authentication and secrets

Automated production deployments should use a workload identity such as a service principal and follow least privilege. Prefer workload identity federation where supported. Do not store personal access tokens or cloud secrets in bundle YAML or Git.

Keep deployment identity and run identity conceptually separate:

- Deployment identity creates or updates resources.
- Run identity accesses data and services when the job executes.

## Exam traps

- Repos is the old product name; use Git folders.
- Asset Bundles is the old name; use Declarative Automation Bundles.
- The `bundle` CLI command did not change with the rename.
- A pull request is created and reviewed in the Git provider, not magically completed by a notebook commit.
- Git folders are for interactive source development, not the preferred production deployment mechanism.
- `validate` does not deploy.
- `deploy` does not necessarily run the job.
- A target selects environment configuration; a separate copied repository is not required.
- Manual production UI edits create drift from bundle source.
- Never commit secrets.

## Hands-on task

Complete lab 8:

1. Create a local bundle project.
2. Define one job and one notebook/file.
3. Add `dev` and `prod` targets with different catalogs.
4. Run `bundle validate` for both.
5. Inspect the resolved summary.
6. If a workspace is available, deploy to dev and run the job.
7. Record how production authentication and approval would differ.

## Repair prompt

> I missed objective [5.x]. Separate the scenario into source-control, review, packaging, configuration, validation, deployment, execution, and identity steps. Name the Databricks feature or CLI command for each, and explain why the distractor causes drift, leaks configuration, or skips review. Cite current official docs.

## Official references

- [Git folders concepts](https://docs.databricks.com/aws/en/repos/git-folders-concepts)
- [Git integration setup](https://docs.databricks.com/aws/en/repos/repos-setup)
- [What are Declarative Automation Bundles?](https://docs.databricks.com/aws/en/dev-tools/bundles/)
- [Bundle configuration reference](https://docs.databricks.com/aws/en/dev-tools/bundles/reference)
- [`bundle` command group](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)
- [CI/CD workflows](https://docs.databricks.com/aws/en/dev-tools/ci-cd/flows)
- [Section 5 Diagnostic](../../assessments/diagnostics/section-05-diagnostic.md)
