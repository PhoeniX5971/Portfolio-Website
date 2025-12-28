"use client"

import { useState } from "react"
import { BootAnimation } from "@/components/boot-animation"
import { TerminalView } from "@/components/terminal-view"

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false)

  if (!bootComplete) {
    return <BootAnimation onComplete={() => setBootComplete(true)} />
  }

  return <TerminalView />
}
