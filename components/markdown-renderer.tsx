"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div
      className="prose prose-invert max-w-none fonr-profont"
      style={{ fontFamily: '"ProFont Nerd Font IIx", monospace' }}
    >
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: "1em 0",
                  borderRadius: "0.375rem",
                  padding: "1rem",
                  fontSize: "0.875rem",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="rounded bg-terminal-border/50 px-1.5 py-0.5 font-mono text-sm text-terminal-success"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-3xl font-bold text-terminal-accent border-b border-terminal-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-2xl font-bold text-terminal-accent">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-xl font-semibold text-terminal-fg">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-3 text-lg font-semibold text-terminal-fg">
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc space-y-2 text-terminal-fg">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2 text-terminal-fg">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-terminal-fg leading-relaxed">{children}</li>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-relaxed text-terminal-fg">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-terminal-accent hover:underline font-medium"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-terminal-accent">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-terminal-fg">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-terminal-accent pl-4 italic text-terminal-muted">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-terminal-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
