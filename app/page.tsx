"use client"

import { useState } from "react"
import { BootAnimation } from "@/components/boot-animation"
import { TutorialAnimation } from "@/components/tutorial-animation"
import { TerminalView } from "@/components/terminal-view"

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false)
  const [tutorialComplete, setTutorialComplete] = useState(false)

  if (!bootComplete) {
    return <BootAnimation onComplete={() => setBootComplete(true)} />
  }

  if (!tutorialComplete) {
    return <TutorialAnimation onComplete={() => setTutorialComplete(true)} />
  }

  return <TerminalView />
}
