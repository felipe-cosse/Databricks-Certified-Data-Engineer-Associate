# Course Guide

## What this course prepares you to do

The Associate exam tests whether you can make correct, practical choices for foundational data-engineering work on the Databricks Data Intelligence Platform. It is not a syntax-memorization contest. Most good answers follow a small set of principles:

1. Choose the most managed current Databricks capability that satisfies the requirement.
2. Preserve reliability with Delta Lake, checkpoints, idempotent ingestion, and explicit data-quality rules.
3. Use Unity Catalog as the governance boundary.
4. Separate interactive development from repeatable production deployment.
5. Diagnose with evidence from the Jobs UI, run history, query profile, Spark UI, logs, and metrics.
6. Optimize the bottleneck demonstrated by the evidence, not the resource that is easiest to resize.

## How the course is organized

Each section contains:

- An **orientation**: one plain-English sentence per official objective
- A **deep dive**: concepts, decision rules, examples, and current terminology
- An **exam lens**: common distractors and how to eliminate them
- A **runnable example**: SQL or Python where the objective calls for it
- A **hands-on task**: a short workspace exercise
- A **10-question diagnostic**: answer before reviewing its key
- A **repair prompt**: a repeatable way to correct misconceptions

The final lab manual combines the hands-on work into ten projects under 30 minutes each. The three mock exams reproduce the published scored-question count and time limit.

## Recommended order

Do not read the course from page one to the end on your first pass.

1. Take all seven diagnostics without notes.
2. Record the result and the objective behind every miss.
3. Rank sections by both score and exam weight.
4. Deep-dive the weakest high-weight objectives first.
5. Complete the mapped labs.
6. Re-answer missed questions in your own words.
7. Take a timed mock only after every objective has at least one green confidence mark.

## Confidence scale

Use this scale in the study journal:

| Level | Meaning | Evidence required |
|---|---|---|
| 0 — Unknown | I cannot define the objective. | None |
| 1 — Recognize | I recognize the terms but cannot choose confidently. | Plain-English explanation |
| 2 — Explain | I can compare the main choices and reject distractors. | Correct diagnostic answer plus explanation |
| 3 — Perform | I can complete the task in a workspace without a walkthrough. | Completed lab |
| 4 — Transfer | I can solve an unfamiliar scenario and justify tradeoffs. | Correct mock item plus rationale |

Aim for level 3 on every objective and level 4 on the high-weight sections.

## Exam timing

Ninety minutes for 45 scored questions gives an average of two minutes per question.

- First pass: about 60 minutes. Answer clear questions and flag uncertain ones.
- Review: about 25 minutes. Revisit flagged questions and inspect wording such as **incremental**, **near real time**, **managed**, **Unity Catalog**, **all rows**, **historical baseline**, or **least privilege**.
- Final check: about 5 minutes. Ensure every question has one answer.

Do not spend five minutes proving one hard answer while leaving easy questions unseen.

## Scope discipline

The official May 2026 exam guide is the blueprint. Current documentation sometimes contains features released after the blueprint. Learn those only when they clarify an objective. Do not let an interesting preview feature displace a named exam topic.

Code on the exam is SQL when possible and Python otherwise. This course follows that preference.

## Verification rule

Every technical lesson links to official Databricks documentation. Treat the links as the final authority if the UI, release state, runtime requirement, or product name has changed.

