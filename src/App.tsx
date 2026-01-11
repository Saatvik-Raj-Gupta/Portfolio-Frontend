import "./styles/terminal.css";

function App() {
  return (
    <div className="terminal">
      <div className="terminal-output">
        <div className="terminal-line">
          <span className="prompt">saatvik@portfolio:~$</span> help
        </div>

        <div className="terminal-line">
          Available commands:
        </div>

        <div className="terminal-line">about</div>
        <div className="terminal-line">skills</div>
        <div className="terminal-line">projects</div>
        <div className="terminal-line">experience</div>
        <div className="terminal-line">contact</div>

        <br />

        <div className="terminal-line">
          <span className="prompt">saatvik@portfolio:~$</span>
          <span className="cursor">█</span>
        </div>
      </div>
    </div>
  );
}

export default App;
