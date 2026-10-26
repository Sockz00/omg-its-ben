import { Fragment, type ReactNode } from 'react';
import { CodeBlock } from './highlight';

/* Minimal, safe Markdown subset → React (no dangerouslySetInnerHTML). */

function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (t.startsWith('**')) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('`')) out.push(<code key={k} className="icode">{t.slice(1, -1)}</code>);
    else if (t.startsWith('[')) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      const ext = mm[2].startsWith('http');
      out.push(<a key={k} href={mm[2]} className="ulink" {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{mm[1]}</a>);
    } else out.push(<em key={k}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className = 'prose' }: { source: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.split('\n');
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      blocks.push(<CodeBlock key={k++} source={buf.join('\n')} lang={(lang || 'txt') as never} />);
      continue;
    }
    if (line.startsWith('## ')) { blocks.push(<h2 key={k++}>{inline(line.slice(3), k)}</h2>); i++; continue; }
    if (line.startsWith('### ')) { blocks.push(<h3 key={k++}>{inline(line.slice(4), k)}</h3>); i++; continue; }
    if (line.startsWith('> ')) { blocks.push(<blockquote key={k++}>{inline(line.slice(2), k)}</blockquote>); i++; continue; }
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) items.push(lines[i++].slice(2));
      blocks.push(<ul key={k++}>{items.map((it, j) => <li key={j}>{inline(it, j)}</li>)}</ul>);
      continue;
    }
    if (!line.trim()) { i++; continue; }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(## |### |> |- |```)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k++}>{inline(para.join(' '), k)}</p>);
  }
  return <div className={className}>{blocks.map((b, j) => <Fragment key={j}>{b}</Fragment>)}</div>;
}
