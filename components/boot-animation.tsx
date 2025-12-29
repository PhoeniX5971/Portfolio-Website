"use client"

import { useEffect, useState } from "react"

interface BootAnimationProps {
  onComplete: () => void
}

const bootMessages = [
  { text: "Initializing Phoenix Portfolio system...", delay: 100 },
  { text: "Loading kernel modules", delay: 150 },
  { text: "  [OK] filesystem.ko", delay: 80 },
  { text: "  [OK] terminal.ko", delay: 80 },
  { text: "  [OK] renderer.ko", delay: 80 },
  { text: "  [OK] command_parser.ko", delay: 80 },
  { text: "  [OK] theme_manager.ko", delay: 80 },
  { text: "Mounting virtual filesystem", delay: 120 },
  { text: "  /cv -> mounted", delay: 60 },
  { text: "  /skills -> mounted", delay: 60 },
  { text: "  /technologies -> mounted", delay: 60 },
  { text: "  /projects -> mounted", delay: 60 },
  { text: "Starting system services", delay: 120 },
  { text: "  terminal daemon [started]", delay: 80 },
  { text: "  backend logger [started]", delay: 80 },
  { text: "  markdown renderer [started]", delay: 80 },
  { text: "", delay: 100 },
  { text: 'System ready. Type "help" for available commands.', delay: 200 },
]

export function BootAnimation({ onComplete }: BootAnimationProps) {
  const [messages, setMessages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex >= bootMessages.length) {
      setTimeout(onComplete, 500)
      return
    }

    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, bootMessages[currentIndex].text])
      setCurrentIndex((prev) => prev + 1)
    }, bootMessages[currentIndex].delay)

    return () => clearTimeout(timer)
  }, [currentIndex, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal-bg">
      <div className="w-full max-w-3xl space-y-1 px-8 font-mono text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.startsWith("  [OK]")
                ? "text-terminal-success"
                : msg.startsWith("  ")
                  ? "text-terminal-accent"
                  : msg.includes("ready")
                    ? "text-terminal-success font-semibold"
                    : "text-terminal-fg"
            }`}
          >
            {msg || "\u00A0"}
          </div>
        ))}
        {currentIndex < bootMessages.length && (
          <div className="inline-block h-4 w-2 animate-pulse bg-terminal-prompt" />
        )}
      </div>
    </div>
  )
}
