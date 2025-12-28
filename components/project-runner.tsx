"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { SendIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "./markdown-renderer"

interface ProjectRunnerProps {
  metadata: {
    description: string
    apiEndpoint?: string
    tags?: string[]
  }
  onExit: () => void
  onLog: (message: string, level: "info" | "success" | "warning" | "error") => void
}

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function ProjectRunner({ metadata, onExit, onLog }: ProjectRunnerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `Project: ${metadata.description}\nType your messages to interact with the AI. Type "exit" to return to terminal.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const simulateAIResponse = async (userMessage: string) => {
    // Simulate backend processing with logs
    onLog("Received user input", "info")
    await sleep(100)

    onLog("Running guardrails check...", "info")
    await sleep(200)
    onLog("✓ Content safety validated", "success")

    onLog("Checking cache for similar queries...", "info")
    await sleep(150)
    onLog("Cache miss - proceeding with RAG", "warning")

    onLog("Generating embeddings for query...", "info")
    await sleep(200)
    onLog("✓ Embeddings generated (768 dimensions)", "success")

    onLog("Performing vector search in knowledge base...", "info")
    await sleep(250)
    onLog("✓ Retrieved 5 relevant documents", "success")

    onLog("Augmenting prompt with context...", "info")
    await sleep(150)

    onLog("Sending request to LLM...", "info")
    await sleep(300)
    onLog("✓ LLM response received (234 tokens)", "success")

    onLog("Applying output filters...", "info")
    await sleep(100)
    onLog("✓ Output validated", "success")

    onLog("Caching response for future queries...", "info")
    await sleep(100)
    onLog("✓ Response cached", "success")

    // Generate a mock response
    const responses = [
      `I understand you're asking about "${userMessage.slice(0, 50)}". Based on the knowledge base, I can provide relevant information retrieved through RAG (Retrieval-Augmented Generation).`,
      `Great question! The system has processed your query and retrieved contextual information to provide an accurate response about "${userMessage.slice(0, 40)}".`,
      `Let me help you with that. After searching through the vector database and retrieving relevant context, here's what I found about your query.`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isProcessing) return

    // Check for exit command
    if (trimmed.toLowerCase() === "exit") {
      onExit()
      return
    }

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Simulate AI processing
      const response = await simulateAIResponse(trimmed)

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      onLog(`Error: ${error}`, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col bg-terminal-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-terminal-border px-4 py-3">
        <div>
          <h3 className="font-mono text-sm font-semibold text-terminal-fg">Project Shell</h3>
          <p className="mt-0.5 font-mono text-xs text-terminal-muted">{metadata.description}</p>
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
      <div ref={scrollRef} className="terminal-scrollbar flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-4">
            {msg.role === "system" ? (
              <div className="rounded border border-terminal-accent/30 bg-terminal-accent/5 p-3">
                <div className="mb-1 font-mono text-xs font-semibold uppercase text-terminal-accent">System</div>
                <div className="whitespace-pre-wrap font-mono text-sm text-terminal-fg">{msg.content}</div>
              </div>
            ) : msg.role === "user" ? (
              <div className="ml-8 rounded bg-terminal-border/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-terminal-success">You</span>
                  <span className="font-mono text-xs text-terminal-muted">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="whitespace-pre-wrap font-mono text-sm text-terminal-fg">{msg.content}</div>
              </div>
            ) : (
              <div className="mr-8 rounded bg-terminal-accent/10 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-terminal-accent">AI Assistant</span>
                  <span className="font-mono text-xs text-terminal-muted">{msg.timestamp.toLocaleTimeString()}</span>
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
            <div className="mb-1 font-mono text-xs font-semibold text-terminal-accent">AI Assistant</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-terminal-accent" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-terminal-accent delay-75" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-terminal-accent delay-150" />
              <span className="ml-2 font-mono text-sm text-terminal-muted">Processing...</span>
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
            className="flex-1 bg-transparent font-mono text-sm text-terminal-fg outline-none placeholder:text-terminal-muted disabled:opacity-50"
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
        <div className="mt-2 font-mono text-xs text-terminal-muted">
          Press Enter to send • Watch the backend logs below for processing details
        </div>
      </div>
    </div>
  )
}
