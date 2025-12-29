"use client";

import { useEffect, useState } from "react";

interface TutorialAnimationProps {
  onComplete: () => void;
}

const tutorialSteps = [
  { text: "", delay: 300 },
  {
    text: "Welcome to Phoenix Portfolio",
    delay: 150,
    className: "text-terminal-accent text-lg font-semibold",
  },
  { text: "", delay: 100 },
  {
    text: "Quick Navigation Guide:",
    delay: 120,
    className: "text-terminal-success",
  },
  { text: "", delay: 80 },
  { text: '  • Type "help" to see all available commands', delay: 100 },
  { text: '  • Use "ls" to list directories', delay: 100 },
  { text: '  • Navigate with "cd <directory>"', delay: 100 },
  { text: '  • Read files with "cat <file>"', delay: 100 },
  { text: "  • Click files in the sidebar to open them", delay: 100 },
  { text: "", delay: 80 },
  { text: "  • Press / for command history", delay: 100 },
  { text: "  • Press Tab for autocompletion", delay: 100 },
  { text: "", delay: 80 },
  {
    text: "Explore cv/, projects/, skills/, and technologies/",
    delay: 150,
    className: "text-terminal-warning",
  },
  { text: "", delay: 100 },
  {
    text: "Press any key to continue...",
    delay: 200,
    className: "text-terminal-prompt animate-pulse",
  },
];

export function TutorialAnimation({ onComplete }: TutorialAnimationProps) {
  const [messages, setMessages] = useState<typeof tutorialSteps>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (currentIndex >= tutorialSteps.length) {
      setCanSkip(true);
      return;
    }

    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, tutorialSteps[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }, tutorialSteps[currentIndex].delay);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (!canSkip) return;

    const handleKeyPress = () => {
      onComplete();
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", handleKeyPress);
    };
  }, [canSkip, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal-bg">
      <div className="w-full max-w-3xl space-y-1.5 px-8 font-mono text-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.className || "text-terminal-fg"}>
            {msg.text || "\u00A0"}
          </div>
        ))}
        {currentIndex < tutorialSteps.length && (
          <div className="inline-block h-4 w-2 animate-pulse bg-terminal-prompt" />
        )}
      </div>
    </div>
  );
}
