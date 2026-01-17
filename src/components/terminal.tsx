import { useEffect, useRef, useState } from "react";
import { handleCommand, type CommandResult } from "../utils/commandHandler";
import { formatByCommand } from "../utils/formatters";
import config from "../config";
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

const API_BASE_URL = config.api.baseUrl;
const TYPE_SPEED = 15; // ms per character

export default function Terminal() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>(INTRO);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Typing sound function
  const playTypingSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Quick click sound
    oscillator.frequency.value = 800 + Math.random() * 200;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.02);
  };

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
        const lines = formatByCommand(result.endpoint, data);

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
  const renderLine = (line: string, idx: number) => {
    // Helper function to parse text and make URLs/emails clickable
    const parseLinks = (text: string) => {
      // Split by both URLs and emails
      const parts = text.split(/(\bhttps?:\/\/[^\s]+|[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g);
      
      return parts.map((part, i) => {
        if (!part) return null;
        
        if (/^https?:\/\//.test(part)) {
          return (
            <a 
              key={i} 
              href={part} 
              className="line-link" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        } else if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/.test(part)) {
          return (
            <a 
              key={i} 
              href={`mailto:${part}`} 
              className="line-link"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      });
    };

    // prompt + command
    const promptMatch = line.match(/^visitor@saatvik\.dev:~\$\s?(.*)$/i);
    if (promptMatch) {
      const cmd = promptMatch[1];
      return (
        <div key={idx} className="terminal-line">
          <span className="line-prompt">visitor@saatvik.dev:~$</span>
          {" "}
          <span className="line-command">{cmd}</span>
        </div>
      );
    }

    // big ASCII banner lines
    if (/^[█▉▊▋▌▍░▒▓\s]+$/.test(line) || line.includes("██")) {
      return (
        <div key={idx} className="terminal-line line-banner">
          {line}
        </div>
      );
    }

    // headings (uppercase words)
    if (/^[A-Z0-9 \-]{2,}$/.test(line) && line.trim() === line && /[A-Z]/.test(line)) {
      return (
        <div key={idx} className="terminal-line line-heading">
          {line}
        </div>
      );
    }

    // errors
    if (/error|command not found|backend error/i.test(line)) {
      return (
        <div key={idx} className="terminal-line line-error">
          {line}
        </div>
      );
    }

    // bullets - now with clickable links inside
    if (/^\s*[•\*\-]\s+/.test(line) || /^\s*•/.test(line) || /^\s*\d+\./.test(line)) {
      return (
        <div key={idx} className="terminal-line line-bullet">
          {parseLinks(line)}
        </div>
      );
    }

    // Check if line contains links
    if (/https?:\/\//.test(line) || /@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/.test(line)) {
      return (
        <div key={idx} className="terminal-line">
          {parseLinks(line)}
        </div>
      );
    }

    // default
    return (
      <div key={idx} className="terminal-line">
        {line}
      </div>
    );
  };

  return (
    <div className="terminal">
      {output.map((line, idx) => renderLine(line, idx))}

      <div className="terminal-input">
        <span className="prompt">visitor@saatvik.dev:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onKeyPress={playTypingSound}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
