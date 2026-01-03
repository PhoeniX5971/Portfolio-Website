"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { SendIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./markdown-renderer";

interface ProjectRunnerProps {
  metadata: {
    description: string;
    apiEndpoint?: string;
    tags?: string[];
  };
  onExit: () => void;
  onLog: (
    message: string,
    level: "info" | "success" | "warning" | "error",
  ) => void;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export function ProjectRunner({ metadata, onExit, onLog }: ProjectRunnerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `Project: ${metadata.description}\n\n⚠️ GUIDELINES:\n1. Do not overuse the AI.\n2. Sending >1 request/second will result in an INSTANT BAN.\n3. There is a 5-second cooldown between messages.\n\nType your messages to interact with the AI. Type "exit" to return to terminal.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate or retrieve Session ID
  useEffect(() => {
    let sid = sessionStorage.getItem("assistant_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("assistant_session_id", sid);
    }
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    if (trimmed.toLowerCase() === "exit") {
      onExit();
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const apiEndpoint = "/api/projects/assistant";
      const sessionId =
        sessionStorage.getItem("assistant_session_id") || "unknown";

      onLog("Sending request to backend...", "info");

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "log") {
              onLog(
                event.data.message,
                event.data.type as "info" | "success" | "warning" | "error",
              );
            } else if (event.type === "message") {
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: event.data,
                  timestamp: new Date(),
                },
              ]);
            }
          } catch (e) {
            console.error("Error parsing stream line:", line, e);
          }
        }
      }

      if (!response.ok) {
        throw new Error("Stream ended with error status");
      }
    } catch (error) {
      onLog(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
        "error",
      );

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // Security Cooldown: 5 seconds
      setTimeout(() => setIsProcessing(false), 5000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-terminal-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-terminal-border px-4 py-3">
        <div>
          <h3 className="font-mono text-sm font-semibold text-terminal-fg">
            Project Shell
          </h3>
          <p className="mt-0.5 font-mono text-xs text-gray-400">
            {metadata.description}
          </p>
        </div>
        <Button
          onClick={onExit}
          variant="ghost"
          size="sm"
          className="gap-2 text-terminal-error hover:bg-terminal-error/10"
        >
          <XIcon className="h-4 w-4" />
          Exit
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="terminal-scrollbar flex-1 overflow-y-auto p-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-4">
            {msg.role === "system" ? (
              <div className="rounded border border-terminal-accent/30 bg-terminal-accent/5 p-3">
                <div className="mb-1 font-mono text-xs font-semibold uppercase text-terminal-accent">
                  System
                </div>
                <div className="whitespace-pre-wrap font-mono text-sm text-terminal-fg">
                  {msg.content}
                </div>
              </div>
            ) : msg.role === "user" ? (
              <div className="ml-8 rounded bg-terminal-border/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-terminal-success">
                    You
                  </span>
                  <span className="font-mono text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="whitespace-pre-wrap font-mono text-sm text-terminal-fg">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="mr-8 rounded bg-terminal-accent/10 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-terminal-accent">
                    AI Assistant
                  </span>
                  <span className="font-mono text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="mr-8 rounded bg-terminal-accent/10 p-3">
            <div className="mb-1 font-mono text-xs font-semibold text-terminal-accent">
              AI Assistant
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-terminal-accent" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-terminal-accent delay-75" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-terminal-accent delay-150" />
              <span className="ml-2 font-mono text-sm text-gray-400">
                Processing...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-terminal-border bg-terminal-bg p-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-terminal-prompt">›</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder='Type your message or "exit" to return...'
            className="flex-1 bg-transparent font-mono text-sm text-terminal-fg outline-none placeholder:text-gray-400 disabled:opacity-50"
            spellCheck={false}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="sm"
            className="gap-2 bg-terminal-accent text-terminal-bg hover:bg-terminal-accent/80"
          >
            <SendIcon className="h-4 w-4" />
            Send
          </Button>
        </div>
        <div className="mt-2 font-mono text-xs text-gray-400">
          Press Enter to send • Watch the backend logs below for processing
          details
        </div>
      </div>
    </div>
  );
}
