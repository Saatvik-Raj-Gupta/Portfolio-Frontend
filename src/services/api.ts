const BASE_URL = "http://localhost:8080/api";

async function fetchText(endpoint: string): Promise<string> {
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.text();
  return data;
}

export const api = {
  about: () => fetchText("/about"),
  education: () => fetchText("/education"),
  skills: () => fetchText("/skills"),
  projects: () => fetchText("/projects"),
  experience: () => fetchText("/experience"),
};
