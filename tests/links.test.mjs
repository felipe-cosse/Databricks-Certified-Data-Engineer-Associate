import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, extname, resolve } from "node:path";
import test from "node:test";

const repositoryRoot = resolve(import.meta.dirname, "..");
const markdownRoots = [
  resolve(repositoryRoot, "README.md"),
  resolve(repositoryRoot, "CONTRIBUTING.md"),
  resolve(repositoryRoot, "content"),
  resolve(repositoryRoot, "docs"),
];

function markdownFiles(path) {
  if (extname(path) === ".md") return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => (
    entry.isDirectory()
      ? markdownFiles(resolve(path, entry.name))
      : extname(entry.name) === ".md"
        ? [resolve(path, entry.name)]
        : []
  ));
}

function localTargets(markdown) {
  const markdownLinks = [...markdown.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)]
    .map((match) => match[1]);
  const htmlImages = [...markdown.matchAll(/<img[^>]+src=["']([^"']+)["']/g)]
    .map((match) => match[1]);

  return [...markdownLinks, ...htmlImages]
    .filter((target) => !/^(?:https?:|mailto:|#)/.test(target))
    .map((target) => decodeURIComponent(target.split("#")[0].split("?")[0]));
}

function externalTargets(markdown) {
  const markdownLinks = [...markdown.matchAll(/!?\[[^\]]*]\((https?:\/\/[^)]+)\)/g)]
    .map((match) => match[1]);
  const metadataSources = [...markdown.matchAll(/\bsource=(https?:\/\/[^\s>]+)/g)]
    .map((match) => match[1]);
  return [...markdownLinks, ...metadataSources];
}

test("all local Markdown links and images resolve", () => {
  const broken = markdownRoots.flatMap(markdownFiles).flatMap((filename) => {
    const markdown = readFileSync(filename, "utf8");
    return localTargets(markdown)
      .map((target) => ({
        source: filename.slice(repositoryRoot.length + 1),
        target,
        resolved: resolve(dirname(filename), target),
      }))
      .filter(({ resolved }) => !existsSync(resolved));
  });

  assert.deepEqual(broken, []);
});

test("external course links use approved hosts and current source paths", () => {
  const allowedHosts = new Set([
    "customer-academy.databricks.com",
    "docs.databricks.com",
    "github.com",
    "img.shields.io",
    "localhost",
    "www.databricks.com",
  ]);
  const invalid = markdownRoots.flatMap(markdownFiles).flatMap((filename) => {
    const markdown = readFileSync(filename, "utf8");
    return externalTargets(markdown).flatMap((target) => {
      const url = new URL(target);
      const reasons = [];
      if (url.hostname !== "localhost" && url.protocol !== "https:") {
        reasons.push("non-HTTPS");
      }
      if (!allowedHosts.has(url.hostname)) reasons.push("unapproved host");
      if (url.pathname.includes("exam-guide-may-2026-000.pdf")) {
        reasons.push("superseded exam guide");
      }
      return reasons.map((reason) => ({
        source: filename.slice(repositoryRoot.length + 1),
        target,
        reason,
      }));
    });
  });

  assert.deepEqual(invalid, []);
});
