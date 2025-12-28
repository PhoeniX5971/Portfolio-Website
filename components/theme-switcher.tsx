"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { themes } from "@/lib/themes";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState(themes[0]);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);

    const root = document.documentElement;
    root.style.setProperty("--terminal-bg", theme.colors.terminalBg);
    root.style.setProperty("--terminal-fg", theme.colors.terminalFg);
    root.style.setProperty("--terminal-border", theme.colors.terminalBorder);
    root.style.setProperty("--terminal-prompt", theme.colors.prompt);
    root.style.setProperty("--terminal-accent", theme.colors.accent);
    root.style.setProperty("--terminal-error", theme.colors.error);
    root.style.setProperty("--terminal-success", theme.colors.success);
    root.style.setProperty("--terminal-warning", theme.colors.warning);
  };

  // apply default theme on first load
  useEffect(() => {
    applyTheme(themes[0].id);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="
            gap-2
            text-terminal-fg
            border border-terminal-border
            hover:bg-terminal-accent
            hover:text-terminal-bg
            transition-colors
          "
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          bg-terminal-bg
          text-terminal-fg
          border border-terminal-border
          shadow-lg
        "
      >
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className="
              cursor-pointer
              hover:bg-terminal-accent
              hover:text-terminal-bg
              focus:bg-terminal-accent
              focus:text-terminal-bg
            "
          >
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
