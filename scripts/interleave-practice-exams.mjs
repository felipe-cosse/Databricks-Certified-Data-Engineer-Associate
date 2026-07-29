import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { objectiveSources } from "../src/data/objective-sources.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expected = { 1: 3, 2: 9, 3: 10, 4: 7, 5: 5, 6: 4, 7: 7 };

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1_664_525 * state + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

function interleavedSectionOrder(seed) {
  const base = Object.entries(expected).flatMap(([section, count]) => (
    Array(count).fill(Number(section))
  ));

  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const order = [...base];
    const random = seededRandom(seed + attempt * 10_007);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
    }
    if (order.every((section, index) => index === 0 || section !== order[index - 1])) {
      return order;
    }
  }

  throw new Error(`Could not produce a non-adjacent section order for seed ${seed}`);
}

function interleave(filename, seed) {
  const markdown = fs.readFileSync(filename, "utf8");
  const firstQuestion = markdown.search(/^### Q\d{2}\s*$/m);
  const sourceSet = markdown.search(/^## Official source set\s*$/m);

  if (firstQuestion < 0 || sourceSet < 0) {
    throw new Error(`Could not find question or source boundaries in ${filename}`);
  }

  const introduction = markdown.slice(0, firstQuestion).trimEnd();
  const footer = markdown.slice(sourceSet).trim();
  const chunks = markdown
    .slice(firstQuestion, sourceSet)
    .split(/^### Q\d{2}\s*$/gm)
    .slice(1)
    .map((chunk) => chunk.trim());
  const queues = new Map();

  for (const chunk of chunks) {
    const section = Number(chunk.match(/section=(\d)/)?.[1]);
    if (!queues.has(section)) queues.set(section, []);
    queues.get(section).push(chunk);
  }

  const ordered = interleavedSectionOrder(seed).map((section) => {
    const chunk = queues.get(section)?.shift();
    if (!chunk) throw new Error(`Missing section ${section} question in ${filename}`);
    const objective = chunk.match(/objective=([0-9.]+)/)?.[1];
    const source = objectiveSources[objective];
    if (!source) throw new Error(`Missing source for objective ${objective} in ${filename}`);
    return chunk.replace(
      /<!--\s*meta:\s*([^>]*?)(?:;\s*source=[^;>]+)?\s*-->/,
      (_match, metadata) => (
        `<!-- meta: ${metadata.trim().replace(/;\s*source=[^;>]+$/, "")}; source=${source} -->`
      ),
    );
  });

  const leftovers = [...queues.values()].flat();
  if (leftovers.length) {
    throw new Error(`Unexpected extra questions in ${filename}`);
  }

  const questions = ordered.map(
    (chunk, index) => `### Q${String(index + 1).padStart(2, "0")}\n${chunk}`,
  );
  fs.writeFileSync(
    filename,
    `${introduction}\n\n${questions.join("\n\n")}\n\n${footer}\n`,
  );
}

const examSeeds = [12_345, 987_654_321, 42_424_242];
for (let exam = 1; exam <= 3; exam += 1) {
  interleave(
    path.join(
      root,
      "content",
      "assessments",
      "practice-exams",
      `practice-exam-${exam}.md`,
    ),
    examSeeds[exam - 1],
  );
}
