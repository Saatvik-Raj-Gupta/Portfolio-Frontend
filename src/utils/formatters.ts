/* 
  This file is responsible ONLY for presentation.
  It converts backend JSON into terminal-friendly text.
*/

export function formatByCommand(command: string, data: any): string[] {
  switch (command) {
    case "about":
      return formatAbout(data);

    case "education":
      return formatEducation(data);

    case "skills":
      return formatSkills(data);

    case "projects":
      return formatProjects(data);

    case "experience":
      return formatExperience(data);

    default:
      return genericFormat(data);
  }
}

/* ---------------- ABOUT ---------------- */

function formatAbout(data: any): string[] {
  const lines: string[] = [];

  lines.push("ABOUT");
  lines.push("-----");
  lines.push("");

  if (data.name) lines.push(`Name: ${data.name}`);
  if (data.headline) lines.push(`Role: ${data.headline}`);
  if (data.about) {
    lines.push("");
    lines.push(data.about);
  }

  if (data.contactDetails) {
    lines.push("");
    lines.push("Contact:");
    for (const [key, value] of Object.entries(data.contactDetails)) {
      lines.push(`  • ${key}: ${value}`);
    }
  }

  if (data.links) {
    lines.push("");
    lines.push("Links:");
    for (const [key, value] of Object.entries(data.links)) {
      lines.push(`  • ${key}: ${value}`);
    }
  }

  return lines;
}

/* ---------------- EDUCATION ---------------- */

function formatEducation(data: any[]): string[] {
  const lines: string[] = [];

  lines.push("EDUCATION");
  lines.push("---------");

  data.forEach((edu, index) => {
    lines.push("");
    lines.push(`${index + 1}. ${edu.instituteName}`);
    lines.push(`   Degree : ${edu.degree}`);
    lines.push(`   Field  : ${edu.fieldOfStudy}`);
    lines.push(
      `   Duration: ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`
    );

    if (edu.grade) {
      lines.push(`   Grade  : ${edu.grade}`);
    }

    if (edu.subjects?.length) {
      lines.push("   Subjects:");
      edu.subjects.forEach((sub: string) =>
        lines.push(`     • ${sub}`)
      );
    }
  });

  return lines;
}

/* ---------------- SKILLS ---------------- */
function formatSkills(data: any[]): string[] {
    const lines: string[] = [];

    lines.push("SKILLS");
    lines.push("------");

    if (!Array.isArray(data) || data.length === 0) {
        lines.push("");
        lines.push("No skills");
        return lines;
    }

    const grouped: Record<string, string[]> = {};

    data.forEach(skill => {
        const categoryRaw = skill?.category;
        const category = categoryRaw?.name ?? (categoryRaw ?? "Other").toString();

        const proficiencyRaw = skill?.proficiency;
        const proficiency = proficiencyRaw?.name ?? (proficiencyRaw ?? "").toString();

        const name = skill?.name ?? "Unnamed";

        const value = proficiency ? `${name} (${proficiency})` : name;

        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(value);
    });

    for (const [category, values] of Object.entries(grouped)) {
        lines.push("");
        lines.push(`${category}:`);
        values.forEach(v => lines.push(`  • ${v}`));
    }

    return lines;
}


/* ---------------- PROJECTS ---------------- */

function formatProjects(data: any[]): string[] {
    const lines: string[] = [];

    lines.push("PROJECTS");
    lines.push("--------");

    if (!Array.isArray(data) || data.length === 0) {
        lines.push("");
        lines.push("No projects");
        return lines;
    }

    // Local helper: wrap text to a maximum width, preserving paragraphs/newlines
    const wrapText = (input: string, maxWidth = 80): string[] => {
        const out: string[] = [];
        input.split(/\r?\n/).forEach((para) => {
            const words = para.split(/\s+/).filter(Boolean);
            if (words.length === 0) {
                out.push("");
                return;
            }
            let line = "";
            for (const w of words) {
                if ((line + (line ? " " : "") + w).length <= maxWidth) {
                    line = line ? `${line} ${w}` : w;
                } else {
                    out.push(line);
                    line = w;
                }
            }
            if (line) out.push(line);
        });
        return out;
    };

    data.forEach((project, index) => {
        lines.push("");

        const title = project?.title ?? project?.name ?? `Project ${index + 1}`;
        lines.push(`${index + 1}. ${title}`);

        const role = project?.role;
        if (role) lines.push(`   Role       : ${role}`);

        const shortDesc = project?.shortDescription ?? project?.description;
        if (shortDesc) {
            const wrapped = wrapText(String(shortDesc), 80);
            lines.push("   Summary    :");
            wrapped.forEach((l) => lines.push(`     ${l}`));
        }

        const detailed = project?.detailedDescription;
        if (detailed) {
            const wrapped = wrapText(String(detailed), 80);
            lines.push("   Description:");
            wrapped.forEach((line: string) => lines.push(`     ${line}`));
        }

        if (project?.techStack?.length) {
            lines.push("   Tech Stack:");
            project.techStack.forEach((tech: string) => lines.push(`     • ${tech}`));
        }

        const highlights = project?.highlights;
        if (highlights) {
            if (Array.isArray(highlights)) {
                lines.push("   Highlights:");
                highlights.forEach((h: string) => {
                    const parts = wrapText(String(h), 76);
                    if (parts.length === 0) return;
                    lines.push(`     • ${parts[0]}`);
                    for (let i = 1; i < parts.length; i++) lines.push(`       ${parts[i]}`);
                });
            } else {
                const parts = String(highlights)
                    .split(/\r?\n|;|•/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                if (parts.length === 1) {
                    const wrapped = wrapText(parts[0], 76);
                    lines.push("   Highlights  :");
                    wrapped.forEach((w, i) =>
                        i === 0 ? lines.push(`     • ${w}`) : lines.push(`       ${w}`)
                    );
                } else {
                    lines.push("   Highlights:");
                    parts.forEach((p) => {
                        const wrapped = wrapText(p, 76);
                        if (wrapped.length === 0) return;
                        lines.push(`     • ${wrapped[0]}`);
                        for (let i = 1; i < wrapped.length; i++) lines.push(`       ${wrapped[i]}`);
                    });
                }
            }
        }

        const git = project?.gitHubLink ?? project?.gitLink ?? project?.git;
        if (git) lines.push(`   GitHub     : ${git}`);
    });

    return lines;
}


/* ---------------- EXPERIENCE ---------------- */
function formatExperience(data: any[]): string[] {
    const lines: string[] = [];

    lines.push("EXPERIENCE");
    lines.push("----------");

    if (!Array.isArray(data) || data.length === 0) {
        lines.push("");
        lines.push("No experience");
        return lines;
    }

    data.forEach((exp, index) => {
        lines.push("");

        const company = exp?.company ?? "Unknown Company";
        const role = exp?.role ?? null;
        const duration = exp?.duration ?? "N/A";

        lines.push(`${index + 1}. ${company}`);
        if (role) lines.push(`   Role           : ${role}`);
        lines.push(`   Duration       : ${duration}`);

        // Responsibilities (expecting List<String>)
        const responsibilitiesRaw = exp?.responsibilities;
        if (responsibilitiesRaw) {
            const responsibilities = Array.isArray(responsibilitiesRaw)
                ? responsibilitiesRaw
                : String(responsibilitiesRaw)
                        .split(/\r?\n|;|•/)
                        .map((s) => s.trim())
                        .filter(Boolean);

            if (responsibilities.length > 0) {
                lines.push("   Responsibilities:");
                responsibilities.forEach((r: string) => lines.push(`     • ${r}`));
            }
        }

        // Achievements (expecting List<String>)
        const achievementsRaw = exp?.achievements;
        if (achievementsRaw) {
            const achievements = Array.isArray(achievementsRaw)
                ? achievementsRaw
                : String(achievementsRaw)
                        .split(/\r?\n|;|•/)
                        .map((s) => s.trim())
                        .filter(Boolean);

            if (achievements.length > 0) {
                lines.push("   Achievements:");
                achievements.forEach((a: string) => lines.push(`     • ${a}`));
            }
        }
    });

    return lines;
}


/* ---------------- FALLBACK ---------------- */

function genericFormat(data: any): string[] {
  if (data === null || data === undefined) return ["No data"];

  if (typeof data !== "object") return [String(data)];

  if (Array.isArray(data)) {
    return data.flatMap(item => genericFormat(item));
  }

  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "object") {
      lines.push(`${key}:`);
      genericFormat(value).forEach(l => lines.push(`  ${l}`));
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines;
}

/* ---------------- HELPERS ---------------- */

function formatDate(date: string | number | null): string {
  if (!date) return "N/A";
  try {
    return new Date(date).getFullYear().toString();
  } catch {
    return String(date);
  }
}
