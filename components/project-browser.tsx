"use client";

import { FolderIcon, FileIcon, ChevronRight, ChevronDown } from "lucide-react";
import { getNode, type FileNode } from "@/lib/filesystem";
import { useState } from "react";

interface ProjectBrowserProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  onOpenFile: (content: string, filename: string) => void;
}

export function ProjectBrowser({
  currentPath,
  onPathChange,
  onOpenFile,
}: ProjectBrowserProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["~"]),
  );

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handleClick = (node: FileNode, path: string, fullPath: string) => {
    if (node.type === "directory") {
      toggleExpand(fullPath);
      onPathChange(fullPath);
    } else if (node.type === "file" && node.content) {
      // Open markdown viewer for files
      onOpenFile(node.content, node.name);
    }
  };

  const renderNode = (node: FileNode, path: string, depth = 0) => {
    const fullPath = path === "~" ? `~/${node.name}` : `${path}/${node.name}`;
    const isExpanded = expandedPaths.has(fullPath);
    const isCurrent =
      currentPath === fullPath || (currentPath === "~" && fullPath === "~");

    const depthOffset = node.type === "file" ? 25 : 0;
    return (
      <div key={fullPath}>
        <button
          onClick={() => handleClick(node, path, fullPath)}
          className={`flex w-full items-center gap-2 rounded px-2 py-1.5 font-mono text-sm transition-colors ${
            isCurrent
              ? "bg-terminal-accent/20 text-terminal-accent"
              : "text-terminal-fg hover:bg-terminal-border/30"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8 + depthOffset}px` }}
        >
          {node.type === "directory" && (
            <span className="text-terminal-muted">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
          )}
          {node.type === "directory" ? (
            <FolderIcon className="h-4 w-4 text-terminal-accent" />
          ) : (
            <FileIcon className="h-4 w-4 text-terminal-muted" />
          )}
          <span className="truncate">{node.name}</span>
          {node.metadata?.runnable && (
            <span className="ml-auto rounded bg-terminal-success/20 px-1.5 py-0.5 text-xs text-terminal-success">
              RUN
            </span>
          )}
        </button>
        {node.type === "directory" && isExpanded && node.children && (
          <div>
            {node.children.map((child) =>
              renderNode(child, fullPath, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  const rootNode = getNode("~");

  return (
    <div className="flex w-80 flex-col bg-terminal-bg">
      <div className="border-b border-terminal-border px-4 py-2">
        <h3 className="font-mono text-xs font-semibold uppercase text-terminal-fg">
          File Browser
        </h3>
        <p className="mt-1 font-mono text-xs text-terminal-muted">
          {currentPath}
        </p>
      </div>
      <div className="terminal-scrollbar flex-1 overflow-y-auto p-2">
        {rootNode && rootNode.children && (
          <>{rootNode.children.map((child) => renderNode(child, "~", 0))}</>
        )}
      </div>

      {/* Project metadata panel */}
      {(() => {
        const currentNode = getNode(currentPath);
        if (currentNode?.metadata) {
          return (
            <div className="border-t border-terminal-border bg-terminal-border/20 p-4">
              <h4 className="mb-2 font-mono text-xs font-semibold uppercase text-terminal-fg">
                Project Info
              </h4>
              <p className="mb-2 font-mono text-xs text-terminal-fg">
                {currentNode.metadata.description}
              </p>
              {currentNode.metadata.tags && (
                <div className="flex flex-wrap gap-1">
                  {currentNode.metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-terminal-accent/20 px-2 py-1 font-mono text-xs text-terminal-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {currentNode.metadata.runnable && (
                <div className="mt-3 font-mono text-xs text-terminal-success">
                  ✓ Runnable - type "run" in terminal
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
