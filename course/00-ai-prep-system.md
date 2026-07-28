# Six-Step AI Preparation System

This workflow implements the six steps in the June 2026 Databricks Certification AI Prep Guide. It turns an AI assistant into a bounded tutor while keeping official sources and hands-on evidence in control.

## Step 1 — Set up

Complete this once before studying:

- Book the exam or set a target date.
- Download the current exam guide from the certification page.
- Choose an AI assistant.
- Create a Databricks Free Edition or trial workspace.
- Create a Databricks Academy account and find the recommended learning path.
- Make a copy of the study journal in this repository.
- Schedule a guide-version check for two weeks before the exam.

The exam guide recommends these related courses:

- Data Engineering with Databricks
- Data Ingestion with Lakeflow Connect
- Deploy Workloads with Lakeflow Jobs
- DevOps Essentials for Data Engineering
- Data Interoperability with Unity Catalog
- Build Data Pipelines with Lakeflow Spark Declarative Pipelines
- Get Started with Data Governance on Databricks

### Definition of done

You have a date, current guide, workspace, Academy access, journal, and recurring study blocks.

## Step 2 — Prime your AI

Start every AI study session with a bounded instruction like this:

> I am studying for the Databricks certification defined by the attached May 2026 exam guide. Teach only objectives in that guide. Use current product names and official Databricks documentation or Academy material. Cite the exact official documentation URL for important claims. If an official source does not confirm a claim, say that it is unverified instead of guessing. Prefer SQL examples, using Python only when needed.

Then provide:

1. The exam guide
2. Your renamed-product table
3. The section you are studying
4. The exact objective when asking for a deep dive
5. Your recent misses and confidence ratings

### Guardrails

- A confident AI answer without an official source is a hypothesis.
- Release state, defaults, supported runtimes, and UI labels are especially time-sensitive.
- The exam guide controls scope; documentation controls current behavior.
- Run code. A plausible snippet is not evidence until it executes.

## Step 3 — Maintain the renamed-product trap table

Use [Renamed Products and Legacy Traps](00-renamed-products.md) at the start of each session. Add any old name your AI or course material produces.

The most important current mappings are:

| Old or transitional term | Current exam-ready term |
|---|---|
| Databricks Repos | Databricks Git folders |
| Databricks Asset Bundles | Declarative Automation Bundles |
| Delta Live Tables (DLT) | Lakeflow pipelines / Lakeflow Spark Declarative Pipelines |
| Lakeflow Declarative Pipelines | Lakeflow Spark Declarative Pipelines |
| Workflows / Jobs | Lakeflow Jobs |

Do not replace still-valid code names automatically. For example, the CLI resource group can retain an older internal name while the product UI uses the current name.

## Step 4 — Run the five-part loop for each section

### 4.1 Orient

Ask for one plain-English sentence per objective. The first page of each course section already provides this.

Output requirement: you can explain what the section expects without using product marketing language.

### 4.2 Diagnose

Take the 10-question diagnostic at the end of the section before reading the answer key. Score by objective, not only by section.

Use these bands:

- 9–10: strong; verify with the lab
- 7–8: workable; repair every miss
- 5–6: weak; complete the whole section and lab
- 0–4: priority gap; study before taking a full mock

### 4.3 Deep dive

For each miss, paste the exact objective and request:

- Core concept
- How Databricks implements it now
- When to use it and when to choose an alternative
- Common mistakes and distractors
- One runnable example
- Official source links

The seven course sections provide this structure. Use AI for alternate explanations, not as a replacement for the official link.

### 4.4 Practice

Take a full 45-question practice exam:

- 90-minute timer
- Closed book
- One final answer per question
- Distribution matching the blueprint
- Answers hidden until submission

The interactive site enforces this flow. Markdown versions are available for offline use.

### 4.5 Repair

For each miss, complete all four fields:

1. My selected answer and reasoning
2. The hidden assumption that made it attractive
3. Why the correct answer better satisfies the requirement
4. A new scenario that tests the same objective differently

Retake only the related questions after 24–72 hours. Immediate rereading tests recognition, not retention.

## Step 5 — Complete the hands-on minimum

Reading is insufficient. Complete the ten tasks in the [Hands-on Lab Manual](08-hands-on-labs.md):

1. Create bronze, silver, and gold Unity Catalog objects.
2. Load cloud files with `COPY INTO`.
3. Ingest incrementally with Auto Loader.
4. Clean and reshape nested data with PySpark.
5. Build gold tables, views, materialized views, and streaming tables.
6. Add data-quality constraints and expectations.
7. Build a Lakeflow Jobs DAG with control flow and triggers.
8. Build and validate a Declarative Automation Bundle.
9. Diagnose a skewed or memory-heavy Spark workload.
10. Configure Unity Catalog privileges, a row filter or mask, and an ABAC design.

If your workspace edition does not expose a feature, write the intended configuration, compare it to the official docs, and mark the task “simulated,” not “complete.”

## Step 6 — Work backward in a 25/50/25 pace

Enter your exam date in the interactive study plan or journal.

### First quarter — Diagnose

- Take all seven section diagnostics.
- Establish confidence for all 33 objectives.
- Identify the weakest two or three high-impact sections.
- Set up the renamed-products table and source-verification habit.

### Middle half — Deep dive and build

- Study missed objectives.
- Complete all ten labs.
- Repeat diagnostics until every section is at least 80%.
- Explain decisions aloud without notes.

### Final quarter — Timed practice and repair

- Take all three 45-question mocks.
- Use the repair log for every miss and lucky guess.
- Recheck the official guide two weeks before the exam.
- Stop adding new resources in the final days; consolidate the objective map and hands-on evidence.

### Compressed schedule

If time is short:

1. Prime the AI with the guide and rename table.
2. Diagnose before reading.
3. Run and verify every important code sample.
4. Investigate disagreement between tools in official docs.
5. Complete the hands-on checklist.

