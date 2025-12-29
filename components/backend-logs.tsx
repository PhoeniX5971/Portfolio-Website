"use client"

import { useEffect, useRef } from "react"

interface LogEntry {
  timestamp: string
  level: "info" | "success" | "warning" | "error"
  message: string
}

interface BackendLogsProps {
  logs: LogEntry[]
}

export function BackendLogs({ logs }: BackendLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-terminal-success"
      case "warning":
        return "text-terminal-warning"
      case "error":
        return "text-terminal-error"
      default:
        return "text-terminal-accent"
    }
  }

  return (
    <div className="flex h-full flex-col bg-terminal-bg">
      <div className="border-b border-terminal-border px-4 py-2">
        <h3 className="font-mono text-xs font-semibold uppercase text-terminal-fg">Backend Logs</h3>
      </div>
      <div ref={scrollRef} className="terminal-scrollbar flex-1 overflow-y-auto px-4 py-2 font-mono text-xs">
        {logs.map((log, idx) => (
          <div key={idx} className="mb-1 flex gap-2">
            <span className="text-terminal-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className={getLevelColor(log.level)}>[{log.level.toUpperCase()}]</span>
            <span className="text-terminal-fg">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
