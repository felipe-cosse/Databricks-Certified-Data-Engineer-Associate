import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const roots = ["README.md", "CONTRIBUTING.md", "content", "docs"];

function markdownFiles(target) {
  const absolute = path.join(root, target);
  if (!fs.existsSync(absolute)) return [];
  if (path.extname(absolute) === ".md") return [absolute];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => (
    entry.isDirectory()
      ? markdownFiles(path.join(target, entry.name))
      : path.extname(entry.name) === ".md"
        ? [path.join(absolute, entry.name)]
        : []
  ));
}

const occurrences = roots.flatMap(markdownFiles).flatMap((filename) => {
  const markdown = fs.readFileSync(filename, "utf8");
  const markdownLinks = [...markdown.matchAll(/!?\[[^\]]*]\((https?:\/\/[^)]+)\)/g)]
    .map((match) => match[1]);
  const metadataSources = [...markdown.matchAll(/\bsource=(https?:\/\/[^\s>]+)/g)]
    .map((match) => match[1]);
  return [...markdownLinks, ...metadataSources]
    .map((url) => ({
      filename: path.relative(root, filename),
      url,
    }))
    .filter(({ url }) => new URL(url).hostname.endsWith("databricks.com"));
});
const sourcesByUrl = new Map();

for (const occurrence of occurrences) {
  if (!sourcesByUrl.has(occurrence.url)) sourcesByUrl.set(occurrence.url, []);
  sourcesByUrl.get(occurrence.url).push(occurrence.filename);
}

async function check(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: { "user-agent": "dea-study-lab-link-check/1.0" },
  });
  await response.body?.cancel();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

const queue = [...sourcesByUrl.keys()];
const failures = [];
const workerCount = Math.min(6, queue.length);

await Promise.all(
  Array.from({ length: workerCount }, async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        await check(url);
        process.stdout.write(".");
      } catch (error) {
        failures.push({
          url,
          sources: sourcesByUrl.get(url),
          error: error.message,
        });
        process.stdout.write("F");
      }
    }
  }),
);

process.stdout.write("\n");
if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.error}: ${failure.url}`);
    console.error(`  ${failure.sources.join(", ")}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Validated ${sourcesByUrl.size} unique Databricks links.`);
}
