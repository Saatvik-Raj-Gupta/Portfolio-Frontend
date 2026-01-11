export default function AsciiVisualPanel() {
  const SPHERE = [
    "        ***        ",
    "     **       **   ",
    "   **             **",
    "  *                 *",
    " *                   *",
    " *                   *",
    "  *                 *",
    "   **             **",
    "     **       **   ",
    "        ***        ",
  ];

  return (
    <div className="ascii-panel">
      <pre>
        {SPHERE.join("\n")}
      </pre>
    </div>
  );
}
