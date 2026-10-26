import { useState, type ReactNode } from 'react';

/* Lightweight tokenizer-based syntax highlighter (no dependency). */

const KW: Record<string, string[]> = {
  ts: ['const', 'let', 'var', 'function', 'return', 'export', 'import', 'from', 'for', 'if', 'else', 'continue', 'break', 'new', 'type', 'interface', 'class', 'extends', 'async', 'await', 'of', 'in', 'true', 'false', 'null', 'undefined'],
  py: ['def', 'return', 'from', 'import', 'for', 'in', 'if', 'else', 'elif', 'while', 'not', 'and', 'or', 'break', 'continue', 'class', 'None', 'True', 'False', 'lambda', 'with', 'as'],
  glsl: ['precision', 'mediump', 'highp', 'uniform', 'varying', 'attribute', 'void', 'float', 'vec2', 'vec3', 'vec4', 'int', 'return', 'if', 'else', 'for'],
  c: ['static', 'inline', 'void', 'return', 'if', 'else', 'for', 'while', 'uint32_t', 'uint16_t', 'int', 'char', 'const', 'struct'],
  bash: ['add', 'table', 'chain', 'rule', 'accept', 'drop', 'log', 'prefix', 'if', 'then', 'fi', 'echo'],
};
KW.js = KW.ts;
KW.rust = ['fn', 'let', 'mut', 'pub', 'use', 'struct', 'impl', 'return', 'for', 'in', 'if', 'else', 'match'];

export function highlight(src: string, lang: string): ReactNode[] {
  const kws = new Set(KW[lang] ?? []);
  const comment = lang === 'py' || lang === 'bash' ? /#.*/y : /\/\/.*|\/\*[\s\S]*?\*\//y;
  const rules: [RegExp, string][] = [
    [comment, 'tk-c'],
    [/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y, 'tk-s'],
    [/\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b/y, 'tk-n'],
    [/[A-Za-z_][\w]*(?=\s*\()/y, 'tk-f'],
    [/[A-Za-z_][\w]*/y, 'id'],
    [/[{}()[\];,.<>=+\-*/%&|^!~?:]+/y, 'tk-p'],
    [/\s+/y, ''],
    [/./y, ''],
  ];
  const out: ReactNode[] = [];
  let pos = 0;
  let k = 0;
  while (pos < src.length) {
    for (const [re, cls] of rules) {
      re.lastIndex = pos;
      const m = re.exec(src);
      if (!m) continue;
      const t = m[0];
      let c = cls;
      if (cls === 'id') c = kws.has(t) ? 'tk-k' : /^[A-Z]/.test(t) ? 'tk-t' : '';
      if (cls === 'tk-f' && kws.has(t)) c = 'tk-k';
      out.push(c ? <span key={k++} className={c}>{t}</span> : t);
      pos += t.length;
      break;
    }
  }
  return out;
}

export function CodeBlock({ source, lang, filename }: { source: string; lang: string; filename?: string }) {
  const [copied, setCopied] = useState(false);
  const lines = source.split('\n').length;
  return (
    <figure className="code">
      <figcaption className="code__bar">
        <span>{filename ?? lang.toUpperCase()}</span>
        <span className="code__meta">{lang} · {lines} lines</span>
        <button
          type="button"
          className="code__copy"
          onClick={() => { navigator.clipboard?.writeText(source).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }); }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre tabIndex={0}>
        <span className="code__gutter" aria-hidden>{Array.from({ length: lines }, (_, i) => i + 1).join('\n')}</span>
        <code>{highlight(source, lang)}</code>
      </pre>
    </figure>
  );
}
