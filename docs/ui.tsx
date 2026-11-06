import { Fragment, type ReactNode } from 'react';
import { CopyButton } from 'krts.ui';

/* ── layout pieces ────────────────────────────────────────────────────── */

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line-subtle py-8 first:border-t-0">
      <h2 className="text-[13px] font-medium tracking-wide text-fg-subtle">{title}</h2>
      <div className="mt-4 flex flex-col gap-12">{children}</div>
    </section>
  );
}

/** One component: a heading, then one or more examples. */
export function Entry({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div id={id} data-entry className="flex scroll-mt-8 flex-col gap-4">
      <h3 className="text-lg font-semibold tracking-tight text-fg">{title}</h3>
      {children}
    </div>
  );
}

/** A live demo with its code underneath, in one frame. */
export function Example({
  label,
  code,
  children,
  className,
}: {
  label?: string;
  code: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <div className="text-sm text-fg-muted">{label}</div>}
      <div className="overflow-hidden rounded-[14px] border border-line-subtle">
        <div className={'flex min-h-28 flex-wrap items-center gap-3 p-6 ' + (className ?? '')}>{children}</div>
        <CodeBlock code={code} />
      </div>
    </div>
  );
}

export function CodeBlock({ code }: { code: string }) {
  const text = code.trim();
  return (
    <div className="relative border-t border-line-subtle bg-surface/50">
      <pre className="max-h-[420px] overflow-auto p-4 pr-14 text-[12.5px] leading-relaxed">
        <code>
          <Highlight code={text} />
        </code>
      </pre>
      <CopyButton value={text} size="xs" variant="ghost" className="absolute top-2 right-2 bg-surface hover:bg-surface-hover" label="Copy code" />
    </div>
  );
}

/* ── tiny JSX/TS highlighter ──────────────────────────────────────────── */

const TOKEN =
  /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|(<\/?)([A-Za-z][\w.]*)|\b(import|from|export|const|let|return|function|await|async|new|type|interface|if|else|true|false|null|undefined)\b|([A-Za-z_$][\w$-]*)(?==)|\b(\d+(?:\.\d+)?)\b/g;

function Highlight({ code }: { code: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    if (m.index > last) out.push(<Fragment key={i++}>{code.slice(last, m.index)}</Fragment>);
    const [all, comment, str, lt, tag, kw, attr, num] = m;
    if (comment) out.push(<span key={i++} className="text-fg-subtle italic">{comment}</span>);
    else if (str) out.push(<span key={i++} className="text-success">{str}</span>);
    else if (tag)
      out.push(
        <Fragment key={i++}>
          <span className="text-fg-subtle">{lt}</span>
          <span className={/^[A-Z]/.test(tag) ? 'text-fg font-medium' : 'text-fg'}>{tag}</span>
        </Fragment>,
      );
    else if (kw) out.push(<span key={i++} className="text-danger">{kw}</span>);
    else if (attr) out.push(<span key={i++} className="text-warning">{attr}</span>);
    else if (num) out.push(<span key={i++} className="text-warning">{num}</span>);
    else out.push(<Fragment key={i++}>{all}</Fragment>);
    last = m.index + all.length;
  }
  if (last < code.length) out.push(<Fragment key={i++}>{code.slice(last)}</Fragment>);
  return <span className="text-fg-muted">{out}</span>;
}

/* ── demo icons ───────────────────────────────────────────────────────── */

export const I = {
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M19 4h-9M14 20H5M15 4 9 20" />,
  underline: <path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />,
  link: <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  heart: <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  sidebar: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />,
};

export const Ico = ({ d, size = 16, fill }: { d: ReactNode; size?: number; fill?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {d}
  </svg>
);
