import platform from "../../content/course/sections/01-databricks-intelligence-platform.md?raw";
import ingestion from "../../content/course/sections/02-data-ingestion-and-loading.md?raw";
import transformation from "../../content/course/sections/03-data-transformation-and-modeling.md?raw";
import jobs from "../../content/course/sections/04-working-with-lakeflow-jobs.md?raw";
import cicd from "../../content/course/sections/05-implementing-cicd.md?raw";
import optimization from "../../content/course/sections/06-troubleshooting-monitoring-optimization.md?raw";
import governance from "../../content/course/sections/07-governance-and-security.md?raw";

import courseGuide from "../../content/course/guides/course-guide.md?raw";
import coverage from "../../content/course/guides/objective-coverage.md?raw";
import aiPrep from "../../content/course/guides/ai-prep-system.md?raw";
import renamed from "../../content/course/guides/renamed-products.md?raw";
import labs from "../../content/course/labs/hands-on-labs.md?raw";
import finalReview from "../../content/course/guides/final-review.md?raw";

import diagnostic1 from "../../content/assessments/diagnostics/section-01-diagnostic.md?raw";
import diagnostic2 from "../../content/assessments/diagnostics/section-02-diagnostic.md?raw";
import diagnostic3 from "../../content/assessments/diagnostics/section-03-diagnostic.md?raw";
import diagnostic4 from "../../content/assessments/diagnostics/section-04-diagnostic.md?raw";
import diagnostic5 from "../../content/assessments/diagnostics/section-05-diagnostic.md?raw";
import diagnostic6 from "../../content/assessments/diagnostics/section-06-diagnostic.md?raw";
import diagnostic7 from "../../content/assessments/diagnostics/section-07-diagnostic.md?raw";

import exam1 from "../../content/assessments/practice-exams/practice-exam-1.md?raw";
import exam2 from "../../content/assessments/practice-exams/practice-exam-2.md?raw";
import exam3 from "../../content/assessments/practice-exams/practice-exam-3.md?raw";
import { glossaryEntries } from "./glossary";

export const lessons = [
  platform,
  ingestion,
  transformation,
  jobs,
  cicd,
  optimization,
  governance,
];

export const supportingResources = [
  { id: "guide", title: "Course guide", eyebrow: "Start here", markdown: courseGuide },
  { id: "coverage", title: "Objective coverage", eyebrow: "33 of 33", markdown: coverage },
  {
    id: "glossary",
    title: "Plain-language glossary",
    eyebrow: `${glossaryEntries.length} terms`,
    markdown: [
      "# Plain-language Glossary",
      "",
      "Hover over any dotted term in the course, or focus it with the keyboard, to see the same definition in context.",
      "",
      "| Term | Plain-language meaning |",
      "|---|---|",
      ...[...glossaryEntries]
        .sort((left, right) => left.term.localeCompare(right.term))
        .map((entry) => `| ${entry.term} | ${entry.definition} |`),
    ].join("\n"),
  },
  { id: "ai-prep", title: "Six-step AI prep system", eyebrow: "Study method", markdown: aiPrep },
  { id: "renames", title: "Renamed products", eyebrow: "Exam traps", markdown: renamed },
  { id: "labs", title: "Hands-on lab manual", eyebrow: "10 labs", markdown: labs },
  { id: "review", title: "Final review", eyebrow: "Finish strong", markdown: finalReview },
];

export const diagnosticMarkdown = [
  diagnostic1,
  diagnostic2,
  diagnostic3,
  diagnostic4,
  diagnostic5,
  diagnostic6,
  diagnostic7,
];

export const examMarkdown = [exam1, exam2, exam3];
