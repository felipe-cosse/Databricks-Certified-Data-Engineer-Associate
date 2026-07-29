import { glossaryEntries } from "../data/glossary.js";

const aliases = glossaryEntries.flatMap((entry) => (
  [entry.term, ...(entry.aliases || [])].map((alias) => ({
    alias,
    entry,
  }))
));
const entryByAlias = new Map(
  aliases.map(({ alias, entry }) => [alias.toLocaleLowerCase(), entry]),
);
const pattern = aliases
  .map(({ alias }) => alias)
  .sort((left, right) => right.length - left.length)
  .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
  .join("|");
const matcherSource = `(?<![\\p{L}\\p{N}])(${pattern})(?![\\p{L}\\p{N}])`;

export function findGlossaryTerms(text) {
  if (!text || !pattern) return [{ text }];

  const matcher = new RegExp(matcherSource, "giu");
  const segments = [];
  let cursor = 0;

  for (const match of text.matchAll(matcher)) {
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index) });
    const matchedText = match[0];
    const entry = entryByAlias.get(matchedText.toLocaleLowerCase());
    segments.push({
      text: matchedText,
      term: entry.term,
      definition: entry.definition,
    });
    cursor = match.index + matchedText.length;
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments.length ? segments : [{ text }];
}
