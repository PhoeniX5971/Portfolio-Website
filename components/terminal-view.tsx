"use client";

import { useState } from "react";
import { Terminal } from "./terminal";
import { BackendLogs, LogEntry } from "./backend-logs";
import { ProjectBrowser } from "./project-browser";
import { ThemeSwitcher } from "./theme-switcher";
import { ProjectRunner } from "./project-runner";
import { MarkdownViewer } from "./markdown-viewer";
import { ChevronUp, ChevronDown, Folder, X } from "lucide-react";

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

  // Mobile visibility states
  const [showLogsOnMobile, setShowLogsOnMobile] = useState(false);
  const [showBrowserMobile, setShowBrowserMobile] = useState(false);

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
    setShowBrowserMobile(false); // Close drawer on mobile after selection
  };

  const handleMobilePathChange = (path: string) => {
    setCurrentPath(path);
    // Optional: uncomment if you want the drawer to close when navigating folders
    // setShowBrowserMobile(false);
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden relative">
      {/* Header with theme switcher and mobile menu */}
      <div className="flex items-center justify-between border-b border-terminal-border bg-terminal-bg px-4 py-2 z-20">
        <div className="flex items-center gap-2 font-mono text-sm text-terminal-fg">
          <div className="flex gap-1.5 mr-2">
            <div className="h-3 w-3 rounded-full bg-terminal-error" />
            <div className="h-3 w-3 rounded-full bg-terminal-warning" />
            <div className="h-3 w-3 rounded-full bg-terminal-success" />
          </div>
          <span className="hidden sm:inline">Phoenix Portfolio</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Folder Button */}
          <button
            onClick={() => setShowBrowserMobile(true)}
            className="md:hidden p-2 text-terminal-fg hover:bg-white/10 rounded-md transition-colors"
            aria-label="Open Project Browser"
          >
            <Folder className="h-5 w-5" />
          </button>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="flex flex-1 flex-col md:border-r border-terminal-border overflow-hidden">
          {/* Terminal or Project Runner */}
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

          {/* Backend Logs Section */}
          <div className="flex flex-col border-t border-terminal-border bg-terminal-bg">
            {/* This button shows ONLY on mobile */}
            <button
              onClick={() => setShowLogsOnMobile(!showLogsOnMobile)}
              className="md:hidden w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 text-terminal-fg">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  Backend Logs
                </span>
              </div>
              {showLogsOnMobile ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>

            <div
              className={`${
                showLogsOnMobile
                  ? "h-64 border-t border-terminal-border"
                  : "h-0"
              } md:h-64 md:border-t-0 transition-all duration-300 overflow-hidden`}
            >
              {/* No props needed, the component handles its own visibility now! */}
              <BackendLogs logs={logs} />
            </div>
          </div>
        </div>

        {/* Right side: Project Browser (Desktop Only) */}
        <div className="hidden md:flex md:w-80 shrink-0 h-full overflow-hidden bg-terminal-bg">
          <ProjectBrowser
            currentPath={currentPath}
            onPathChange={setCurrentPath}
            onOpenFile={handleOpenFile}
          />
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {/* Backdrop (Darkens screen when drawer is open) */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 md:hidden ${
          showBrowserMobile ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowBrowserMobile(false)}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-terminal-bg border-l border-terminal-border z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          showBrowserMobile ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-terminal-border">
          <span className="font-mono text-sm font-bold text-terminal-fg">
            PROJECT BROWSER
          </span>
          <button
            onClick={() => setShowBrowserMobile(false)}
            className="p-1 text-terminal-fg hover:bg-white/10 rounded"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="h-[calc(100%-60px)] overflow-y-auto">
          <ProjectBrowser
            currentPath={currentPath}
            onPathChange={handleMobilePathChange}
            onOpenFile={handleOpenFile}
          />
        </div>
      </div>

      {/* Markdown Viewer Modal */}
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
