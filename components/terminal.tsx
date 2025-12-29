"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { TerminalPrompt } from "./terminal-prompt";
import { executeCommand, getCommandSuggestions } from "@/lib/commands";

interface TerminalLine {
  type: "input" | "output" | "error";
  content: string;
  path?: string;
}

interface TerminalProps {
  onPathChange: (path: string) => void;
  onRunProject: (metadata: any) => void;
  onLog: (
    message: string,
    level: "info" | "success" | "warning" | "error",
  ) => void;
}

export function Terminal({ onPathChange, onRunProject, onLog }: TerminalProps) {
  const [currentPath, setCurrentPath] = useState("~");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "Welcome to the Portfolio Terminal!" },
    { type: "output", content: 'Type "help" to see available commands.' },
    { type: "output", content: "" },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSuggestionsCount = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (input) {
      const sugg = getCommandSuggestions(input, currentPath);
      setSuggestions(sugg);
      setSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  }, [input, currentPath]);

  useEffect(() => {
    if (
      suggestions.length > 0 &&
      prevSuggestionsCount.current === 0 &&
      scrollRef.current
    ) {
      requestAnimationFrame(() => {
        scrollRef.current!.scrollTo({
          top: scrollRef.current!.scrollHeight,
          behavior: "smooth",
        });
      });
    }

    prevSuggestionsCount.current = suggestions.length;
  }, [suggestions]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Tab for autocomplete
    if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[suggestionIndex]);
        setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      }
      return;
    }

    // Arrow up for history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
      return;
    }

    // Arrow down for history
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
      return;
    }

    // Enter to execute
    if (e.key === "Enter") {
      e.preventDefault();
      if (!input.trim()) return;

      // Add input to lines
      const newLines: TerminalLine[] = [
        ...lines,
        { type: "input", content: input, path: currentPath },
      ];

      // Execute command
      const result = executeCommand(input, currentPath);

      // Handle special commands
      if (result.output.includes("__CLEAR__")) {
        setLines([]);
        setInput("");
        setHistory([...history, input]);
        setHistoryIndex(-1);
        return;
      }

      if (result.output.includes("__RUN__")) {
        onLog("Starting project...", "info");
        onRunProject(result.metadata);
        setLines([
          ...newLines,
          { type: "output", content: `Entering project shell...` },
          {
            type: "output",
            content:
              'Type your messages to interact with the AI. Type "exit" to return.',
          },
        ]);
        setInput("");
        setHistory([...history, input]);
        setHistoryIndex(-1);
        return;
      }

      // Handle path change
      if (result.newPath) {
        setCurrentPath(result.newPath);
        onPathChange(result.newPath);
        onLog(`Changed directory to ${result.newPath}`, "info");
      }

      // Add output
      result.output.forEach((line) => {
        newLines.push({ type: "output", content: line });
      });

      // Add error if present
      if (result.error) {
        newLines.push({ type: "error", content: result.error });
        onLog(result.error, "error");
      }

      setLines(newLines);
      setInput("");
      setHistory([...history, input]);
      setHistoryIndex(-1);
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col bg-terminal-bg relative">
      <div
        ref={scrollRef}
        className="terminal-scrollbar flex-1 overflow-y-auto p-4 cursor-text"
        onClick={handleTerminalClick}
      >
        {lines.map((line, idx) => (
          <div key={idx} className="mb-1">
            {line.type === "input" ? (
              <div className="flex items-center gap-2">
                <TerminalPrompt currentPath={line.path || currentPath} />
                <span className="font-mono text-sm text-terminal-fg">
                  {line.content}
                </span>
              </div>
            ) : line.type === "error" ? (
              <div className="font-mono text-sm text-terminal-error">
                {line.content}
              </div>
            ) : (
              <div className="font-mono text-sm text-terminal-fg">
                {line.content}
              </div>
            )}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center gap-2">
          <TerminalPrompt currentPath={currentPath} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent font-mono text-sm text-terminal-fg outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {suggestions.length > 0 && (
          <div className="relative z-50 mt-2 rounded border border-terminal-border bg-terminal-bg/95 p-2 backdrop-blur shadow-lg">
            <div className="text-xs text-terminal-muted mb-1">
              Suggestions (press Tab):
            </div>
            {suggestions.slice(0, 5).map((sugg, idx) => (
              <div
                key={idx}
                className={`font-mono text-xs ${
                  idx === suggestionIndex % suggestions.length
                    ? "text-terminal-accent font-semibold"
                    : "text-terminal-fg"
                }`}
              >
                {sugg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
