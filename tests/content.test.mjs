import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { objectiveCount, sections } from "../src/data/curriculum.js";
import { objectiveSources } from "../src/data/objective-sources.js";
import { formatTime, parseQuestions, scoreQuestions } from "../src/lib/parse.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const objectivesBySection = new Map(
  sections.map((section) => [
    section.id,
    new Set(section.objectives.map(([objective]) => objective)),
  ]),
);
const allObjectives = new Set(
  sections.flatMap((section) => section.objectives.map(([objective]) => objective)),
);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertValidQuestion(question, filename) {
  assert.ok(objectivesBySection.has(question.section), `${filename}: invalid section`);
  assert.ok(
    objectivesBySection.get(question.section).has(question.objective),
    `${filename}: ${question.id} objective ${question.objective} does not belong to section ${question.section}`,
  );
  assert.equal(Object.keys(question.options).length, 4, `${filename}: ${question.id}`);
  assert.ok(["A", "B", "C", "D"].includes(question.answer), `${filename}: ${question.id}`);
  assert.ok(question.question.length > 20, `${filename}: ${question.id}`);
  assert.ok(question.rationale.length > 40, `${filename}: ${question.id}`);
  assert.equal(
    new Set(Object.values(question.options).map((option) => option.toLowerCase())).size,
    4,
    `${filename}: ${question.id} repeats an option`,
  );
}

function promptTokens(prompt) {
  const stopWords = new Set(
    "a an the and or to of in on for with from by is are be been which what should does do this that when after before every only best most must can how into their its it as than while"
      .split(" "),
  );
  return new Set(
    prompt
      .toLowerCase()
      .replace(/`[^`]+`/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((token) => token.length > 2 && !stopWords.has(token)),
  );
}

function jaccard(left, right) {
  const intersection = [...left].filter((token) => right.has(token)).length;
  return intersection / (left.size + right.size - intersection);
}

function expandObjectiveMap(value) {
  const objectives = [];
  for (const rawToken of value.split(",")) {
    const token = rawToken.trim();
    const range = token.match(/^(\d)\.(\d+)[–-](?:(\d)\.)?(\d+)$/);
    if (!range) {
      objectives.push(token);
      continue;
    }
    const [, startSection, startNumber, endSection = startSection, endNumber] = range;
    assert.equal(startSection, endSection, `cross-section range ${token}`);
    for (let number = Number(startNumber); number <= Number(endNumber); number += 1) {
      objectives.push(`${startSection}.${number}`);
    }
  }
  return objectives;
}

test("the course exposes all seven sections and 33 official objectives", () => {
  assert.equal(sections.length, 7);
  assert.equal(objectiveCount, 33);
  assert.deepEqual(sections.map((section) => section.weight), [6, 21, 22, 16, 10, 10, 15]);
  assert.equal(sections.reduce((total, section) => total + section.weight, 0), 100);
});

test("each section diagnostic has ten valid questions", () => {
  for (let section = 1; section <= 7; section += 1) {
    const filename = `content/assessments/diagnostics/section-${String(section).padStart(2, "0")}-diagnostic.md`;
    const questions = parseQuestions(read(filename), section);
    assert.equal(questions.length, 10, filename);
    for (const question of questions) {
      assertValidQuestion(question, filename);
      assert.equal(question.section, section);
      assert.match(question.reference, /https:\/\/(?:docs\.)?databricks\.com\//);
    }
  }
});

test("each mock is interleaved, sourced, and covers the available objectives", () => {
  const expected = { 1: 3, 2: 9, 3: 10, 4: 7, 5: 5, 6: 4, 7: 7 };
  const requiredDistinctObjectives = { 1: 2, 2: 7, 3: 7, 4: 4, 5: 4, 6: 4, 7: 4 };
  const allPrompts = new Set();
  const allQuestions = [];
  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const sectionSequences = new Set();

  for (let exam = 1; exam <= 3; exam += 1) {
    const filename = `content/assessments/practice-exams/practice-exam-${exam}.md`;
    const questions = parseQuestions(read(filename));
    assert.equal(questions.length, 45);
    sectionSequences.add(questions.map((question) => question.section).join(""));
    const distribution = {};
    const objectiveCoverage = {};
    const prompts = new Set();

    for (const [index, question] of questions.entries()) {
      assertValidQuestion(question, filename);
      distribution[question.section] = (distribution[question.section] || 0) + 1;
      if (!objectiveCoverage[question.section]) objectiveCoverage[question.section] = new Set();
      objectiveCoverage[question.section].add(question.objective);
      prompts.add(question.question);
      allPrompts.add(question.question);
      allQuestions.push({ ...question, exam });
      answerCounts[question.answer] += 1;
      assert.equal(
        question.source,
        objectiveSources[question.objective],
        `${filename}: ${question.id} source`,
      );
      if (index > 0) {
        assert.notEqual(
          question.section,
          questions[index - 1].section,
          `${filename}: adjacent questions disclose a section block`,
        );
      }
    }

    assert.deepEqual(distribution, expected);
    assert.equal(prompts.size, 45);
    for (const [section, minimum] of Object.entries(requiredDistinctObjectives)) {
      assert.ok(
        objectiveCoverage[section].size >= minimum,
        `${filename}: section ${section} objective coverage`,
      );
    }
  }

  assert.equal(allPrompts.size, 135);
  assert.equal(sectionSequences.size, 3, "each mock should use a different interleaving");
  assert.ok(Math.max(...Object.values(answerCounts)) - Math.min(...Object.values(answerCounts)) <= 5);

  for (let left = 0; left < allQuestions.length; left += 1) {
    for (let right = left + 1; right < allQuestions.length; right += 1) {
      if (allQuestions[left].objective !== allQuestions[right].objective) continue;
      assert.ok(
        jaccard(
          promptTokens(allQuestions[left].question),
          promptTokens(allQuestions[right].question),
        ) < 0.65,
        `semantic near-duplicate: exam ${allQuestions[left].exam} ${allQuestions[left].id} and exam ${allQuestions[right].exam} ${allQuestions[right].id}`,
      );
    }
  }
});

test("the lab manual maps hands-on or simulated evidence to all 33 objectives", () => {
  const manual = read("content/course/labs/hands-on-labs.md");
  const mappings = [...manual.matchAll(/^\*\*Maps to:\*\*\s*([^\n]+)/gm)]
    .flatMap((match) => expandObjectiveMap(match[1].trim()));
  const mappedObjectives = new Set(mappings);

  assert.deepEqual(
    [...mappedObjectives].filter((objective) => !allObjectives.has(objective)),
    [],
  );
  assert.deepEqual(
    [...allObjectives].filter((objective) => !mappedObjectives.has(objective)),
    [],
  );
});

test("high-risk labs preserve their executable behavior contracts", () => {
  const manual = read("content/course/labs/hands-on-labs.md");
  assert.match(manual, /DROP TABLE IF EXISTS main\.dea_bronze\.orders_copy/);
  assert.match(manual, /Expected schema-evolution stop/);
  assert.ok(
    manual.slice(manual.indexOf('f"{source}/events-002.json"')).match(/run_loader\(\)/g).length >= 2,
  );
  assert.match(manual, /parameters:\s*\n\s+- \$\{var\.catalog\}/);
  assert.match(manual, /environment_key: default/);
  assert.match(manual, /catalog = sys\.argv\[1\]/);
  assert.match(manual, /SparkSession\.builder\.getOrCreate\(\)/);
  assert.doesNotMatch(
    manual.slice(manual.indexOf("## Lab 8"), manual.indexOf("## Lab 9")),
    /dbutils\.widgets/,
  );
  assert.match(manual, /spark\.sql\.autoBroadcastJoinThreshold", "-1"/);
  assert.match(manual, /F\.broadcast\(small\)/);
});

test("scoring and exam clock helpers are deterministic", () => {
  const questions = [
    { id: "Q01", section: 1, answer: "A" },
    { id: "Q02", section: 2, answer: "B" },
  ];
  assert.deepEqual(scoreQuestions(questions, { Q01: "A", Q02: "C" }), {
    correct: 1,
    total: 2,
    percent: 50,
    bySection: {
      1: { correct: 1, total: 1 },
      2: { correct: 0, total: 1 },
    },
  });
  assert.equal(formatTime(5400), "90:00");
  assert.equal(formatTime(-1), "00:00");
});
