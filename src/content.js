import platform from "../course/01-databricks-intelligence-platform.md?raw";
import ingestion from "../course/02-data-ingestion-and-loading.md?raw";
import transformation from "../course/03-data-transformation-and-modeling.md?raw";
import jobs from "../course/04-working-with-lakeflow-jobs.md?raw";
import cicd from "../course/05-implementing-cicd.md?raw";
import optimization from "../course/06-troubleshooting-monitoring-optimization.md?raw";
import governance from "../course/07-governance-and-security.md?raw";

import courseGuide from "../course/00-course-guide.md?raw";
import coverage from "../course/00-objective-coverage.md?raw";
import aiPrep from "../course/00-ai-prep-system.md?raw";
import renamed from "../course/00-renamed-products.md?raw";
import labs from "../course/08-hands-on-labs.md?raw";
import finalReview from "../course/09-final-review.md?raw";

import diagnostic1 from "../course/diagnostics/section-01-diagnostic.md?raw";
import diagnostic2 from "../course/diagnostics/section-02-diagnostic.md?raw";
import diagnostic3 from "../course/diagnostics/section-03-diagnostic.md?raw";
import diagnostic4 from "../course/diagnostics/section-04-diagnostic.md?raw";
import diagnostic5 from "../course/diagnostics/section-05-diagnostic.md?raw";
import diagnostic6 from "../course/diagnostics/section-06-diagnostic.md?raw";
import diagnostic7 from "../course/diagnostics/section-07-diagnostic.md?raw";

import exam1 from "../exams/practice-exam-1.md?raw";
import exam2 from "../exams/practice-exam-2.md?raw";
import exam3 from "../exams/practice-exam-3.md?raw";

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

