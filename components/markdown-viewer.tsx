"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./markdown-renderer";
import { useEffect } from "react";

interface MarkdownViewerProps {
  content: string;
  filename: string;
  onClose: () => void;
}

export function MarkdownViewer({
  content,
  filename,
  onClose,
}: MarkdownViewerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-[90vw] h-[85vh] max-w-5xl bg-terminal-bg border-2 border-terminal-border rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-terminal-border bg-terminal-bg/50">
          <div className="flex items-center gap-3">
            <div className="text-terminal-accent font-mono text-sm">📄</div>
            <h2 className="text-terminal-fg font-mono text-lg">{filename}</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-terminal-fg hover:text-terminal-accent hover:bg-terminal-border/30"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-terminal-bg/30 terminal-scrollbar">
          <MarkdownRenderer content={content} />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-terminal-border bg-terminal-bg/50">
          <p className="text-gray-400 text-xs font-mono">
            Press ESC or click the X button to close
          </p>
        </div>
      </div>
    </div>
  );
}
