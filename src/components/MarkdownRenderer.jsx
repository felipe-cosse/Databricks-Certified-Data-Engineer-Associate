import { Fragment } from "react";

function inline(text, onInternalLink) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:/.test(link[2]);
      return (
        <a
          key={index}
          href={link[2]}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          onClick={
            !external && onInternalLink
              ? (event) => {
                  event.preventDefault();
                  onInternalLink(link[2]);
                }
              : undefined
          }
        >
          {link[1]}
        </a>
      );
    }
    return <Fragment key={index}>{token}</Fragment>;
  });
}

function isBoundary(line) {
  return (
    !line ||
    /^#{1,6}\s/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^\|/.test(line) ||
    /^---+$/.test(line) ||
    /^<!--/.test(line)
  );
}

export function MarkdownRenderer({ markdown, hideTitle = false, onInternalLink }) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const output = [];
  const renderInline = (value) => inline(value, onInternalLink);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim() || /^<!--/.test(line)) {
      i += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.slice(3).trim();
      const code = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      output.push(
        <div className="code-wrap" key={`code-${i}`}>
          {language && <span className="code-language">{language}</span>}
          <pre><code>{code.join("\n")}</code></pre>
        </div>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      i += 1;
      if (hideTitle && level === 1) continue;
      const Tag = `h${Math.min(level, 4)}`;
      const anchor = heading[2]
        .replace(/[`*_]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      output.push(<Tag id={anchor} key={`h-${i}`}>{renderInline(heading[2])}</Tag>);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      output.push(<hr key={`hr-${i}`} />);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      output.push(<blockquote key={`quote-${i}`}>{renderInline(quote.join(" "))}</blockquote>);
      continue;
    }

    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?[\s|:-]+\|?$/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map((cell) => cell.trim()));
        i += 1;
      }
      const [head, , ...body] = rows;
      output.push(
        <div className="table-scroll" key={`table-${i}`}>
          <table>
            <thead><tr>{head.map((cell, col) => <th key={col}>{renderInline(cell)}</th>)}</tr></thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, col) => <td key={col}>{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      const pattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      while (i < lines.length && pattern.test(lines[i])) {
        items.push(lines[i].replace(pattern, ""));
        i += 1;
      }
      const ListTag = ordered ? "ol" : "ul";
      output.push(
        <ListTag key={`list-${i}`}>
          {items.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
        </ListTag>,
      );
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && !isBoundary(lines[i])) {
      paragraph.push(lines[i]);
      i += 1;
    }
    output.push(<p key={`p-${i}`}>{renderInline(paragraph.join(" "))}</p>);
  }

  return <div className="markdown">{output}</div>;
}
