import { type FileNode, getNode, listDirectory, resolvePath } from "./filesystem"

export interface CommandResult {
  output: string[]
  error?: string
  newPath?: string
  metadata?: FileNode["metadata"]
  showMarkdown?: {
    content: string
    filename: string
  }
}

export interface Command {
  name: string
  description: string
  usage: string
  execute: (args: string[], currentPath: string) => CommandResult
}

export const commands: Record<string, Command> = {
  help: {
    name: "help",
    description: "Display available commands",
    usage: "help [command]",
    execute: (args) => {
      if (args[0]) {
        const cmd = commands[args[0]]
        if (cmd) {
          return {
            output: [`Command: ${cmd.name}`, `Description: ${cmd.description}`, `Usage: ${cmd.usage}`],
          }
        }
        return { output: [], error: `Unknown command: ${args[0]}` }
      }

      const output = [
        "Available commands:",
        "",
        ...Object.values(commands).map((cmd) => `  ${cmd.name.padEnd(12)} - ${cmd.description}`),
        "",
        'Type "help <command>" for more information on a specific command.',
      ]
      return { output }
    },
  },

  ls: {
    name: "ls",
    description: "List directory contents",
    usage: "ls [path]",
    execute: (args, currentPath) => {
      const targetPath = args[0] ? resolvePath(args[0], currentPath) : currentPath
      const node = getNode(targetPath)

      if (!node) {
        return { output: [], error: `ls: cannot access '${args[0]}': No such file or directory` }
      }

      if (node.type !== "directory") {
        return { output: [node.name] }
      }

      const items = listDirectory(node)
      const output = items.map((item) => {
        const icon = item.type === "directory" ? "📁" : "📄"
        return `${icon} ${item.name}`
      })

      return { output: output.length > 0 ? output : ["(empty directory)"] }
    },
  },

  cd: {
    name: "cd",
    description: "Change directory",
    usage: "cd <path>",
    execute: (args, currentPath) => {
      if (!args[0]) {
        return { output: [], newPath: "~" }
      }

      console.log("[v0] cd command - args:", args)
      console.log("[v0] cd command - currentPath:", currentPath)

      const targetPath = resolvePath(args[0], currentPath)
      console.log("[v0] cd command - resolved targetPath:", targetPath)

      const node = getNode(targetPath)
      console.log("[v0] cd command - found node:", node?.name, node?.type)

      if (!node) {
        return { output: [], error: `cd: ${args[0]}: No such file or directory` }
      }

      if (node.type !== "directory") {
        return { output: [], error: `cd: ${args[0]}: Not a directory` }
      }

      return { output: [], newPath: targetPath }
    },
  },

  pwd: {
    name: "pwd",
    description: "Print working directory",
    usage: "pwd",
    execute: (args, currentPath) => {
      return { output: [currentPath] }
    },
  },

  cat: {
    name: "cat",
    description: "Display file contents",
    usage: "cat <file>",
    execute: (args, currentPath) => {
      if (!args[0]) {
        return { output: [], error: "cat: missing file operand" }
      }

      const targetPath = resolvePath(args[0], currentPath)
      const node = getNode(targetPath)

      if (!node) {
        return { output: [], error: `cat: ${args[0]}: No such file or directory` }
      }

      if (node.type !== "file") {
        return { output: [], error: `cat: ${args[0]}: Is a directory` }
      }

      return { output: node.content ? node.content.split("\n") : ["(empty file)"] }
    },
  },

  man: {
    name: "man",
    description: "Display manual/documentation for projects",
    usage: "man [project]",
    execute: (args, currentPath) => {
      const node = getNode(currentPath)

      if (!node) {
        return { output: [], error: "man: No documentation available" }
      }

      // Look for README.md in current directory if it's a project
      if (node.type === "directory" && node.children) {
        const readme = node.children.find((child) => child.name === "README.md")
        if (readme && readme.content) {
          return { output: readme.content.split("\n") }
        }
      }

      // If an argument is provided, try to find that directory
      if (args[0]) {
        const targetPath = resolvePath(args[0], currentPath)
        const targetNode = getNode(targetPath)

        if (targetNode && targetNode.type === "directory" && targetNode.children) {
          const readme = targetNode.children.find((child) => child.name === "README.md")
          if (readme && readme.content) {
            return { output: readme.content.split("\n") }
          }
        }
      }

      return { output: [], error: "man: No manual entry found" }
    },
  },

  whoami: {
    name: "whoami",
    description: "Display current user information",
    usage: "whoami",
    execute: () => {
      return {
        output: [
          "phoenix@portfolio",
          "",
          "AI systems developer focused on agentic architectures,",
          "long-term memory, and real-world system integration.",
        ],
      }
    },
  },

  clear: {
    name: "clear",
    description: "Clear the terminal screen",
    usage: "clear",
    execute: () => {
      return { output: ["__CLEAR__"] }
    },
  },

  run: {
    name: "run",
    description: "Run a project (if in a project directory)",
    usage: "run",
    execute: (args, currentPath) => {
      const node = getNode(currentPath)

      if (!node || !node.metadata || !node.metadata.runnable) {
        return {
          output: [],
          error: "run: This directory does not contain a runnable project",
        }
      }

      return {
        output: ["__RUN__"],
        metadata: node.metadata,
      }
    },
  },

  tree: {
    name: "tree",
    description: "Display directory tree structure",
    usage: "tree [path]",
    execute: (args, currentPath) => {
      const targetPath = args[0] ? resolvePath(args[0], currentPath) : currentPath
      const node = getNode(targetPath)

      if (!node) {
        return { output: [], error: `tree: ${args[0]}: No such file or directory` }
      }

      const buildTree = (node: FileNode, prefix = "", isLast = true): string[] => {
        const lines: string[] = []
        const connector = isLast ? "└── " : "├── "
        const icon = node.type === "directory" ? "📁" : "📄"

        lines.push(`${prefix}${connector}${icon} ${node.name}`)

        if (node.type === "directory" && node.children) {
          const newPrefix = prefix + (isLast ? "    " : "│   ")
          node.children.forEach((child, index) => {
            const childIsLast = index === node.children!.length - 1
            lines.push(...buildTree(child, newPrefix, childIsLast))
          })
        }

        return lines
      }

      if (node.type === "file") {
        return { output: [`📄 ${node.name}`] }
      }

      const output = [`📁 ${node.name}`]
      if (node.children) {
        node.children.forEach((child, index) => {
          const isLast = index === node.children!.length - 1
          output.push(...buildTree(child, "", isLast))
        })
      }

      return { output }
    },
  },
}

export function executeCommand(input: string, currentPath: string): CommandResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: [] }

  const [cmdName, ...args] = trimmed.split(/\s+/)
  const command = commands[cmdName]

  if (!command) {
    return { output: [], error: `Command not found: ${cmdName}. Type 'help' for available commands.` }
  }

  return command.execute(args, currentPath)
}

export function getCommandSuggestions(partial: string, currentPath: string): string[] {
  const [cmdName, ...args] = partial.split(/\s+/)

  // If we're still typing the command name
  if (args.length === 0 && !partial.endsWith(" ")) {
    return Object.keys(commands).filter((cmd) => cmd.startsWith(cmdName))
  }

  // If we're typing arguments, suggest paths
  if (["cd", "ls", "cat", "man", "tree"].includes(cmdName)) {
    const currentArg = args[args.length - 1] || ""
    const node = getNode(currentPath)

    if (node && node.type === "directory" && node.children) {
      return node.children
        .filter((child) => child.name.startsWith(currentArg))
        .map((child) => `${cmdName} ${child.name}`)
    }
  }

  return []
}
