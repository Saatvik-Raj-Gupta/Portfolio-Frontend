export type CommandResult =
  | { type: "api"; endpoint: "about" | "education" | "skills" | "projects" | "experience" }
  | { type: "output"; output: string }
  | { type: "clear" };

export function handleCommand(command: string): CommandResult {
  const cmd = command.trim().toLowerCase();

  switch (cmd) {
    case "about":
    case "education":
    case "skills":
    case "projects":
    case "experience":
      return { type: "api", endpoint: cmd };

    case "help":
      return {
        type: "output",
        output: `
Available commands:
  about
  education
  skills
  projects
  experience
  clear
        `.trim(),
      };

    case "clear":
      return { type: "clear" };

    default:
      return {
        type: "output",
        output: `command not found: ${command}`,
      };
  }
}
