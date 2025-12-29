"use client"

interface TerminalPromptProps {
  username?: string
  hostname?: string
  currentPath: string
}

export function TerminalPrompt({ username = "phoenix", hostname = "portfolio", currentPath }: TerminalPromptProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span className="text-terminal-success">{username}</span>
      <span className="text-terminal-fg">@</span>
      <span className="text-terminal-accent">{hostname}</span>
      <span className="text-terminal-fg">:</span>
      <span className="text-terminal-warning">{currentPath}</span>
      <span className="text-terminal-prompt">›</span>
    </div>
  )
}
