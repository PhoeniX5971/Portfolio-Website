"use client";

import { useEffect, useRef } from "react";

export interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

interface BackendLogsProps {
  logs: LogEntry[];
}

export function BackendLogs({ logs }: BackendLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-terminal-success";
      case "warning":
        return "text-terminal-warning";
      case "error":
        return "text-terminal-error";
      default:
        return "text-terminal-accent";
    }
  };

  return (
    <div className="flex h-full flex-col bg-terminal-bg z-0">
      {/* DYNAMIC HEADER:
          'hidden' hides it on mobile (where your toggle button lives).
          'md:block' shows it on desktop (where the toggle button is hidden).
      */}
      <div className="hidden md:block border-b border-terminal-border px-4 py-2">
        <h3 className="font-mono text-xs font-semibold uppercase text-terminal-fg">
          Backend Logs
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="terminal-scrollbar flex-1 overflow-y-auto px-4 py-2 font-mono text-xs"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="mb-1 flex gap-2">
            <span className="text-terminal-muted shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={`${getLevelColor(log.level)} shrink-0 font-bold`}>
              [{log.level.toUpperCase()}]
            </span>
            <span className="text-terminal-fg break-words">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
