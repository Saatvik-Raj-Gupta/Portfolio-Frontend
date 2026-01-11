import { useEffect, useRef, useState } from "react";
import { handleCommand, type CommandResult } from "../utils/commandHandler";
import AsciiVisualPanel from "./AsciiVisualPanel";
import { formatOutput } from "../utils/formatOutput";
import "../styles/terminal.css";

const INTRO = [
    "",
  "███████╗ █████╗  █████╗ ████████╗██╗   ██╗██╗██╗  ██╗",
  "██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██║   ██║██║██║ ██╔╝",
  "███████╗███████║███████║   ██║   ██║   ██║██║█████╔╝ ",
  "╚════██║██╔══██║██╔══██║   ██║   ██║   ██║██║██╔═██╗ ",
  "███████║██║  ██║██║  ██║   ██║   ╚██████╔╝██║██║  ██╗",
  "╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝╚═╝  ╚═╝",
  "",
  "Saatvik Raj Gupta — AI/ML Engineer | Full Stack Developer",
  "",
  "Welcome to my terminal portfolio.",
  "Type `help` to see available commands.",
  ""
];

const API_BASE_URL = "http://localhost:8080/api";
const TYPE_SPEED = 15; // ms per character

export default function Terminal() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>(INTRO);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  // 🔥 TYPEWRITER EFFECT
  const typeLines = async (lines: string[]) => {
    for (const line of lines) {
      let current = "";
      for (const char of line) {
        current += char;
        setOutput(prev => [...prev.slice(0, -1), current]);
        await new Promise(res => setTimeout(res, TYPE_SPEED));
      }
      setOutput(prev => [...prev, ""]);
    }
  };

  const fetchFromBackend = async (endpoint: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!res.ok) throw new Error("Backend error");
    return res.json();
  };

  const runCommand = async (command: string) => {
    const result: CommandResult = handleCommand(command);

    // CLEAR
    if (result.type === "clear") {
      setOutput(INTRO);
      return;
    }

    // STATIC OUTPUT
    if (result.type === "output") {
      setOutput(prev => [...prev, `visitor@saatvik.dev:~$ ${command}`, ""]);
      await typeLines(result.output.split("\n"));
      return;
    }

    // API OUTPUT
    if (result.type === "api") {
      setOutput(prev => [...prev, `visitor@saatvik.dev:~$ ${command}`, "Loading..."]);

      try {
        const data = await fetchFromBackend(result.endpoint);
        const lines = formatOutput(data);

        setOutput(prev => [...prev.slice(0, -1), ""]);
        await typeLines(lines);
      } catch {
        setOutput(prev => [...prev.slice(0, -1), "Error fetching data"]);
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const command = input.trim();
      if (!command) return;

      runCommand(command);
      setHistory(prev => [...prev, command]);
      setHistoryIndex(null);
      setInput("");
    }

    if (e.key === "ArrowUp" && history.length) {
      const index =
        historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(history[index]);
    }

    if (e.key === "ArrowDown" && historyIndex !== null) {
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(index);
        setInput(history[index]);
      }
    }
  };

//   return (
//     <div className="terminal" onClick={() => inputRef.current?.focus()}>
//       {output.map((line, idx) => (
//         <div key={idx} className="terminal-line">
//           {line}
//         </div>
//       ))}

//       <div className="terminal-input">
//         <span className="prompt">visitor@saatvik.dev:~$</span>
//         <input
//           ref={inputRef}
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={onKeyDown}
//           spellCheck={false}
//           autoComplete="off"
//         />
//       </div>

//       <div ref={bottomRef} />
//     </div>
//   );
return (
    <div className="terminal-layout">
      {/* LEFT: TERMINAL */}
      <div className="terminal">
        {output.map((line, idx) => (
          <div key={idx} className="terminal-line">
            {line}
          </div>
        ))}

        <div className="terminal-input">
          <span className="prompt">visitor@saatvik.dev:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div ref={bottomRef} />
      </div>

      {/* RIGHT: STATIC ASCII PANEL */}
      <AsciiVisualPanel />
    </div>
  );
}
