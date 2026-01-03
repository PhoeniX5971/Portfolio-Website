import * as cvAbout from "@/content/cv/about.md";
import * as cvResume from "@/content/cv/resume.md";
import * as cvContact from "@/content/cv/contact.md";
import * as skills from "@/content/skills.md";
import * as techStack from "@/content/technologies.md";
import * as attackCopilot from "@/content/projects/attack-copilot.md";
import * as synaptic from "@/content/projects/synaptic.md";
import * as assistant from "@/content/projects/assistant.md";

export interface FileNode {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
  metadata?: {
    description?: string;
    tags?: string[];
    runnable?: boolean;
    apiEndpoint?: string;
  };
}

export const filesystem: FileNode = {
  name: "~",
  type: "directory",
  children: [
    {
      name: "cv",
      type: "directory",
      children: [
        {
          name: "about.md",
          type: "file",
          content: cvAbout.content,
        },
        {
          name: "contact.md",
          type: "file",
          content: cvContact.content,
        },
        {
          name: "resume.md",
          type: "file",
          content: cvResume.content,
        },
      ],
    },
    {
      name: "projects",
      type: "directory",
      children: [
        {
          name: "attack-copilot",
          type: "directory",
          metadata: attackCopilot.metadata,
          children: [
            {
              name: "README.md",
              type: "file",
              content: attackCopilot.content,
            },
          ],
        },
        {
          name: "synaptic",
          type: "directory",
          metadata: synaptic.metadata,
          children: [
            {
              name: "README.md",
              type: "file",
              content: synaptic.content,
            },
          ],
        },
        {
          name: "assistant",
          type: "directory",
          metadata: assistant.metadata,
          children: [
            {
              name: "README.md",
              type: "file",
              content: assistant.content,
            },
          ],
        },
      ],
    },
    {
      name: "skills",
      type: "file",
      content: skills.content,
    },
    {
      name: "technologies",
      type: "file",
      content: techStack.content,
    },
  ],
};

export function resolvePath(path: string, currentPath: string): string {
  console.log(
    "[v0] resolvePath - input path:",
    path,
    "currentPath:",
    currentPath,
  );

  // If absolute path, return as is
  if (path.startsWith("/")) return path;

  // If just ~, return home
  if (path === "~") return "~";

  // If path starts with ~/, treat as absolute from home
  if (path.startsWith("~/")) {
    return path.substring(1); // Remove ~ to get /path
  }

  // Build relative path
  let parts: string[];

  // If we're at home (~), start with empty parts
  if (currentPath === "~") {
    parts = [];
  } else {
    // Otherwise, split current path (removing leading / and ~)
    parts = currentPath
      .replace(/^~?\/?/, "")
      .split("/")
      .filter(Boolean);
  }

  const newParts = path.split("/").filter(Boolean);

  console.log("[v0] resolvePath - parts:", parts, "newParts:", newParts);

  for (const part of newParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }

  const result = parts.length === 0 ? "~" : "/" + parts.join("/");
  console.log("[v0] resolvePath - result:", result);
  return result;
}

export function getNode(
  path: string,
  root: FileNode = filesystem,
): FileNode | null {
  console.log("[v0] getNode - looking for path:", path);

  if (path === "~" || path === "/" || path === "") return root;

  // Remove leading ~ or / to get actual path parts
  const parts = path
    .replace(/^~?\/?/, "")
    .split("/")
    .filter(Boolean);
  console.log("[v0] getNode - path parts:", parts);

  let current = root;

  for (const part of parts) {
    console.log(
      "[v0] getNode - looking for part:",
      part,
      "in children:",
      current.children?.map((c) => c.name),
    );
    if (!current.children) return null;
    const next = current.children.find((child) => child.name === part);
    if (!next) {
      console.log("[v0] getNode - part not found:", part);
      return null;
    }
    current = next;
  }

  console.log("[v0] getNode - found:", current.name);
  return current;
}

export function listDirectory(node: FileNode): FileNode[] {
  if (node.type !== "directory" || !node.children) return [];
  return node.children;
}

export function getPathParts(path: string): string[] {
  if (path === "~") return ["~"];
  return ["~", ...path.split("/").filter(Boolean)];
}
