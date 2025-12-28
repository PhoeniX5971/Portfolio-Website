export interface Theme {
  id: string
  name: string
  colors: {
    terminalBg: string
    terminalFg: string
    terminalBorder: string
    prompt: string
    accent: string
    error: string
    success: string
    warning: string
  }
}

export const themes: Theme[] = [
  {
    id: "arch",
    name: "Arch Linux",
    colors: {
      terminalBg: "oklch(0.08 0.01 240)",
      terminalFg: "oklch(0.92 0.02 90)",
      terminalBorder: "oklch(0.2 0.02 240)",
      prompt: "oklch(0.75 0.15 150)",
      accent: "oklch(0.65 0.2 200)",
      error: "oklch(0.7 0.2 20)",
      success: "oklch(0.7 0.15 140)",
      warning: "oklch(0.75 0.15 80)",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    colors: {
      terminalBg: "oklch(0.16 0.04 285)",
      terminalFg: "oklch(0.95 0.01 90)",
      terminalBorder: "oklch(0.28 0.06 285)",
      prompt: "oklch(0.75 0.2 330)",
      accent: "oklch(0.7 0.18 270)",
      error: "oklch(0.65 0.22 15)",
      success: "oklch(0.7 0.16 145)",
      warning: "oklch(0.75 0.18 95)",
    },
  },
  {
    id: "nord",
    name: "Nord",
    colors: {
      terminalBg: "oklch(0.20 0.02 240)",
      terminalFg: "oklch(0.88 0.01 210)",
      terminalBorder: "oklch(0.30 0.03 240)",
      prompt: "oklch(0.65 0.12 195)",
      accent: "oklch(0.60 0.14 220)",
      error: "oklch(0.62 0.18 25)",
      success: "oklch(0.68 0.12 160)",
      warning: "oklch(0.75 0.15 85)",
    },
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    colors: {
      terminalBg: "oklch(0.18 0.03 60)",
      terminalFg: "oklch(0.88 0.04 80)",
      terminalBorder: "oklch(0.28 0.04 60)",
      prompt: "oklch(0.70 0.15 100)",
      accent: "oklch(0.65 0.14 180)",
      error: "oklch(0.60 0.2 25)",
      success: "oklch(0.68 0.13 140)",
      warning: "oklch(0.72 0.16 75)",
    },
  },
  {
    id: "monokai",
    name: "Monokai",
    colors: {
      terminalBg: "oklch(0.15 0.02 285)",
      terminalFg: "oklch(0.92 0.01 90)",
      terminalBorder: "oklch(0.25 0.03 285)",
      prompt: "oklch(0.75 0.2 340)",
      accent: "oklch(0.70 0.18 180)",
      error: "oklch(0.65 0.22 20)",
      success: "oklch(0.72 0.16 145)",
      warning: "oklch(0.78 0.17 85)",
    },
  },
]
