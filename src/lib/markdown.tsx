import type { ReactNode } from "react";

/**
 * Minimal markdown for Vault teardowns: paragraphs, **bold**, [links](url).
 * No HTML passthrough — keeps SEO/public pages safe without a heavy MD stack.
 */
export function renderTeardownMarkdown(source: string): ReactNode {
  const text = source.trim();
  if (!text) return null;

  const blocks = text.split(/\n{2,}/);

  return blocks.map((block, i) => {
    const lines = block.split("\n");
    const listItems = lines.every((l) => /^[-*]\s+/.test(l.trim()) || l.trim() === "");
    if (listItems && lines.some((l) => l.trim())) {
      return (
        <ul key={i} className="my-2 list-disc space-y-1 pl-5">
          {lines
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l, j) => (
              <li key={j}>{inlineMarkdown(l.replace(/^[-*]\s+/, ""))}</li>
            ))}
        </ul>
      );
    }
    return (
      <p key={i} className={i === 0 ? undefined : "mt-3"}>
        {inlineMarkdown(block.replace(/\n/g, " "))}
      </p>
    );
  });
}

function inlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    if (m[0].startsWith("**")) {
      nodes.push(<strong key={key++}>{m[0].slice(2, -2)}</strong>);
    } else {
      const href = m[3];
      const safe =
        href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");
      if (safe) {
        nodes.push(
          <a key={key++} href={href}>
            {m[2]}
          </a>
        );
      } else {
        nodes.push(m[2]);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
