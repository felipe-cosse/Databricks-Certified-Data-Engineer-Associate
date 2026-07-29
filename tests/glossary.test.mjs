import assert from "node:assert/strict";
import test from "node:test";

import { glossaryEntries } from "../src/data/glossary.js";
import { findGlossaryTerms } from "../src/lib/glossary.js";

test("the glossary provides concise, unique definitions for specialist terms", () => {
  assert.ok(glossaryEntries.length >= 140);
  const aliases = new Set();

  for (const entry of glossaryEntries) {
    assert.ok(entry.term.length >= 2, entry.term);
    assert.ok(entry.definition.split(/\s+/).length >= 6, entry.term);
    assert.ok(entry.definition.split(/\s+/).length <= 35, entry.term);
    for (const alias of [entry.term, ...(entry.aliases || [])]) {
      const normalized = alias.toLocaleLowerCase();
      assert.ok(!aliases.has(normalized), `duplicate glossary alias: ${alias}`);
      aliases.add(normalized);
    }
  }

  for (const required of [
    "ABAC",
    "ACID",
    "AI",
    "API",
    "AQE",
    "CDC",
    "CI/CD",
    "CLI",
    "CSV",
    "DAG",
    "ETL",
    "HTTP",
    "JDBC",
    "JSON",
    "ODBC",
    "OOM",
    "PII",
    "REST",
    "SLA",
    "SQL",
    "UDF",
    "UI",
    "URL",
    "XML",
    "YAML",
  ]) {
    assert.ok(aliases.has(required.toLocaleLowerCase()), `missing acronym: ${required}`);
  }
});

test("tooltip matching prefers complete terms and respects word boundaries", () => {
  const matches = findGlossaryTerms(
    "Lakeflow Jobs runs a DAG with CI/CD, ODBC, and a broadcast join.",
  ).filter((segment) => segment.definition);

  assert.deepEqual(
    matches.map((segment) => segment.term),
    ["Lakeflow Jobs", "DAG", "CI/CD", "ODBC", "broadcast join"],
  );
  assert.equal(
    findGlossaryTerms("A golden record is not the gold layer.")
      .filter((segment) => segment.term === "gold").length,
    1,
  );
});
