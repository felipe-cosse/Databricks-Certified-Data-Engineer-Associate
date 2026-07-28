import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { objectiveCount, sections } from "../src/data.js";
import { formatTime, parseQuestions, scoreQuestions } from "../src/lib/parse.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("the course exposes all seven sections and 33 official objectives", () => {
  assert.equal(sections.length, 7);
  assert.equal(objectiveCount, 33);
  assert.deepEqual(sections.map((section) => section.weight), [6, 21, 22, 16, 10, 10, 15]);
  assert.equal(sections.reduce((total, section) => total + section.weight, 0), 100);
});

test("each section diagnostic has ten valid questions", () => {
  for (let section = 1; section <= 7; section += 1) {
    const filename = `course/diagnostics/section-${String(section).padStart(2, "0")}-diagnostic.md`;
    const questions = parseQuestions(read(filename), section);
    assert.equal(questions.length, 10, filename);
    for (const question of questions) {
      assert.equal(Object.keys(question.options).length, 4);
      assert.ok(["A", "B", "C", "D"].includes(question.answer));
      assert.ok(question.question.length > 20);
      assert.ok(question.rationale.length > 15);
      assert.equal(question.section, section);
    }
  }
});

test("each mock has 45 unique, complete questions with the intended distribution", () => {
  const expected = { 1: 3, 2: 9, 3: 10, 4: 7, 5: 5, 6: 4, 7: 7 };
  const allPrompts = new Set();
  for (let exam = 1; exam <= 3; exam += 1) {
    const questions = parseQuestions(read(`exams/practice-exam-${exam}.md`));
    assert.equal(questions.length, 45);
    const distribution = {};
    const prompts = new Set();
    for (const question of questions) {
      distribution[question.section] = (distribution[question.section] || 0) + 1;
      prompts.add(question.question);
      allPrompts.add(question.question);
      assert.equal(Object.keys(question.options).length, 4);
      assert.ok(question.objective);
      assert.ok(question.rationale);
    }
    assert.deepEqual(distribution, expected);
    assert.equal(prompts.size, 45);
  }
  assert.equal(allPrompts.size, 135);
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
