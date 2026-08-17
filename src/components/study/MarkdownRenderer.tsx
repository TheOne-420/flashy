"use client";

function renderInline(text: string): (string | React.ReactNode)[] {
  const parts: (string | React.ReactNode)[] = [];
  let remaining = text;

  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={parts.length}>{match[2]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={parts.length}>{match[4]}</em>);
    } else if (match[6]) {
      parts.push(
        <code key={parts.length} className="rounded bg-zinc-100 px-1 py-0.5 text-xs font-mono dark:bg-zinc-800">
          {match[6]}
        </code>,
      );
    } else if (match[8]) {
      parts.push(
        <a
          key={parts.length}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 underline hover:text-violet-700 dark:text-violet-400"
        >
          {match[8]}
        </a>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }
  return parts;
}

export default function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: number) => {
    if (inList) {
      blocks.push(
        <ul key={key} className="mb-2 list-disc pl-5">
          {listItems}
        </ul>,
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushList(i);
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (listMatch) {
      inList = true;
      listItems.push(<li key={`li-${i}`}>{renderInline(listMatch[1])}</li>);
      return;
    }

    flushList(i);
    blocks.push(
      <p key={`p-${i}`} className="mb-1">
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList(lines.length);

  return <div className="leading-relaxed">{blocks}</div>;
}
