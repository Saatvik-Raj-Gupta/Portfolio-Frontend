export function formatOutput(data: any): string[] {
  if (data === null || data === undefined) {
    return ["No data"];
  }

  if (typeof data !== "object") {
    return [String(data)];
  }

  if (Array.isArray(data)) {
    return data.flatMap((item, index) => {
      const prefix = `- `;
      if (typeof item === "object") {
        return [prefix, ...formatOutput(item).map(l => `  ${l}`)];
      }
      return [`${prefix}${item}`];
    });
  }

  const lines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach(v => {
        if (typeof v === "object") {
          lines.push("  -");
          formatOutput(v).forEach(l => lines.push(`    ${l}`));
        } else {
          lines.push(`  - ${v}`);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      lines.push(`${key}:`);
      formatOutput(value).forEach(l => lines.push(`  ${l}`));
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines;
}
