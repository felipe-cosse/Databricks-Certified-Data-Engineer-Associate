import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { sections } from "../src/data/curriculum.js";
import { buildObjectivePages } from "../src/lib/coursePages.js";

function readSection(section) {
  const filenames = [
    "databricks-intelligence-platform",
    "data-ingestion-and-loading",
    "data-transformation-and-modeling",
    "working-with-lakeflow-jobs",
    "implementing-cicd",
    "troubleshooting-monitoring-optimization",
    "governance-and-security",
  ];
  return readFileSync(
    new URL(`../content/course/sections/0${section.id}-${filenames[section.id - 1]}.md`, import.meta.url),
    "utf8",
  );
}

test("every official objective has one course reader page", () => {
  for (const section of sections) {
    const sectionMarkdown = readSection(section);
    const pages = buildObjectivePages(sectionMarkdown, section);
    assert.ok(
      sectionMarkdown.trim().split(/\s+/).length >= 1_500,
      `section ${section.id} needs deeper lesson content`,
    );
    assert.equal(pages.length, section.objectives.length);
    assert.deepEqual(
      pages.map(({ id }) => id),
      section.objectives.map(([id]) => id),
    );
    pages.forEach((page) => assert.ok(
      page.markdown.trim().split(/\s+/).length >= 250,
      `objective ${page.id} needs deeper lesson content`,
    ));
  }
});

test("objective pages contain only their selected section-one topic", () => {
  const pages = buildObjectivePages(readSection(sections[0]), sections[0]);

  assert.match(pages[0].markdown, /## Build the platform mental model/);
  assert.doesNotMatch(pages[0].markdown, /## Choose the right compute/);
  assert.match(pages[1].markdown, /## Choose the right compute/);
  assert.doesNotMatch(pages[1].markdown, /## Build the platform mental model/);
});

test("custom page plans align course topics to official objective labels", () => {
  const jobsPages = buildObjectivePages(readSection(sections[3]), sections[3]);
  const optimizationPages = buildObjectivePages(readSection(sections[5]), sections[5]);

  assert.match(jobsPages[0].markdown, /## Dependencies and run conditions/);
  assert.match(jobsPages[1].markdown, /## Common task types/);
  assert.match(jobsPages[2].markdown, /## Triggers/);
  assert.match(optimizationPages[3].markdown, /## Liquid clustering/);
  assert.match(optimizationPages[3].markdown, /## Predictive optimization/);
  assert.match(optimizationPages[4].markdown, /## Cluster startup failures/);
  assert.match(optimizationPages[4].markdown, /## Library conflicts/);
});
