"use client";

import { useState } from "react";
import { Terminal } from "./terminal";
import { BackendLogs, LogEntry } from "./backend-logs";
import { ProjectBrowser } from "./project-browser";
import { ThemeSwitcher } from "./theme-switcher";
import { ProjectRunner } from "./project-runner";
import { MarkdownViewer } from "./markdown-viewer";

export function TerminalView() {
  const [currentPath, setCurrentPath] = useState("~");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toISOString(),
      level: "info",
      message: "System initialized",
    },
  ]);
  const [runningProject, setRunningProject] = useState<any>(null);
  const [markdownView, setMarkdownView] = useState<{
    content: string;
    filename: string;
  } | null>(null);

  const addLog = (
    message: string,
    level: "info" | "success" | "warning" | "error",
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        level,
        message,
      },
    ]);
  };

  const handleRunProject = (metadata: any) => {
    setRunningProject(metadata);
    addLog(`Project started: ${metadata.description}`, "success");
  };

  const handleExitProject = () => {
    addLog("Project stopped", "info");
    setRunningProject(null);
  };

  const handleOpenFile = (content: string, filename: string) => {
    setMarkdownView({ content, filename });
    addLog(`Opened ${filename}`, "info");
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header with theme switcher */}
      <div className="flex items-center justify-between border-b border-terminal-border bg-terminal-bg px-4 py-2">
        <div className="flex items-center gap-2 font-mono text-sm text-terminal-fg">
          <div className="h-3 w-3 rounded-full bg-terminal-error" />
          <div className="h-3 w-3 rounded-full bg-terminal-warning" />
          <div className="h-3 w-3 rounded-full bg-terminal-success" />
          <span className="ml-2">Portfolio Terminal</span>
        </div>
        <ThemeSwitcher />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col border-r border-terminal-border overflow-hidden">
          {/* Terminal or Project Runner - Takes remaining space and scrolls */}
          <div className="flex-1 overflow-hidden">
            {runningProject ? (
              <ProjectRunner
                metadata={runningProject}
                onExit={handleExitProject}
                onLog={addLog}
              />
            ) : (
              <Terminal
                onPathChange={setCurrentPath}
                onRunProject={handleRunProject}
                onLog={addLog}
              />
            )}
          </div>

          {/* Backend Logs - Fixed height, stays in place */}
          <div className="h-64 border-t border-terminal-border z-0">
            <BackendLogs logs={logs} />
          </div>
        </div>

        {/* Right side: Project Browser */}
        <ProjectBrowser
          currentPath={currentPath}
          onPathChange={setCurrentPath}
          onOpenFile={handleOpenFile}
        />
      </div>

      {markdownView && (
        <MarkdownViewer
          content={markdownView.content}
          filename={markdownView.filename}
          onClose={() => setMarkdownView(null)}
        />
      )}
    </div>
  );
}
