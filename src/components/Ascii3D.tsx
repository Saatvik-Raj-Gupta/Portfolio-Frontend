import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  command?: string | null;
};

// ASCII characters ordered by increasing density
const ASCII_RAMP = " .,:;iI+hH#W%$@";

export default function Ascii3D({ command }: Props) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const lastCommandRef = useRef<string | null>(null);
  const [mode, setMode] = useState<"sphere" | "face" | "icon">("sphere");
  const [iconArt, setIconArt] = useState<string | null>(null);

  // Simple face art (placeholder). We can replace with higher-res art later.
  const FACE_ART = [
    '      _____      ',
    '   .-""     ""-.   ',
    '  /  O     O  \\',
    ' |     \\_/     | ',
    ' |   \\_____/   | ',
    '  \\           /  ',
    "   `-._____.-'   ",
  ];

  const ICONS: Record<string, string[]> = {
    about: ["  (•_•)", " <)   )", "  /   /"],
  } as any;

  // update mode when command prop changes
  useEffect(() => {
    if (!command) return;
    const cmd = command.trim().toLowerCase();
    lastCommandRef.current = cmd;
    // show icon if available, otherwise a simple label
    const art = ICONS[cmd] ? ICONS[cmd].join("\n") : `  [ ${cmd} ]`;
    setIconArt(art);
    setMode("icon");
    const t = setTimeout(() => setMode("sphere"), 1400);
    return () => clearTimeout(t);
  }, [command]);

  // idle behaviour: toggle between sphere and face every few seconds
  useEffect(() => {
    const id = setInterval(() => {
      setMode((m) => (m === "icon" ? m : m === "sphere" ? "face" : "sphere"));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const renderFrame = useCallback(() => {
    const pre = preRef.current;
    if (!pre) return;

    const width = 48; // number of characters per row
    const height = 32; // number of rows
    const aspect = width / height;

    if (mode === "icon" && iconArt) {
      pre.textContent = iconArt;
      return;
    }

    if (mode === "face") {
      // center face art in the pre area
      const padLeft = Math.max(0, Math.floor((width - FACE_ART[0].length) / 2));
      const lines = Array.from({ length: height }, (_, r) => {
        const fi = r - Math.floor((height - FACE_ART.length) / 2);
        if (fi >= 0 && fi < FACE_ART.length) {
          return " ".repeat(padLeft) + FACE_ART[fi];
        }
        return " ".repeat(width);
      });
      pre.textContent = lines.join("\n");
      return;
    }

    // Sphere rendering with Earth-like rotation showing latitude/longitude grid
    const theta = angleRef.current;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const lines: string[] = [];
    for (let j = 0; j < height; j++) {
      let row = "";
      for (let i = 0; i < width; i++) {
        // map i,j to -1..1
        const x = (i / (width - 1)) * 2 - 1;
        const y = (j / (height - 1)) * 2 - 1;
        // correct aspect
        const xx = x * aspect;
        const d2 = xx * xx + y * y;
        if (d2 > 1) {
          row += " ";
          continue;
        }

        // Calculate BOTH possible z values (front and back of sphere)
        const zSqrt = Math.sqrt(1 - d2);
        
        // For a given (x,y), there are two points on sphere: (x,y,+z) and (x,y,-z)
        // We'll check BOTH and see which one is visible after rotation
        
        // Front surface point
        const z1 = zSqrt;
        const rx1 = cosT * xx + sinT * z1;
        const rz1 = -sinT * xx + cosT * z1;
        
        // Back surface point
        const z2 = -zSqrt;
        const rx2 = cosT * xx + sinT * z2;
        const rz2 = -sinT * xx + cosT * z2;
        
        // Pick the point that's facing the camera (larger rz = closer to camera)
        const useBack = rz2 > rz1;
        const rx = useBack ? rx2 : rx1;
        const rz = useBack ? rz2 : rz1;
        const originalZ = useBack ? z2 : z1;
        
        // Calculate spherical coordinates for grid pattern (like Earth lat/long)
        const phi = Math.atan2(y, rx); // latitude
        const lambda = Math.atan2(originalZ, xx) + theta; // longitude (rotates with sphere)
        
        // Draw latitude/longitude grid lines
        const latLine = Math.abs(Math.sin(phi * 6)) > 0.95; // 6 latitude lines
        const lonLine = Math.abs(Math.sin(lambda * 8)) > 0.95; // 8 longitude lines
        const isGridLine = latLine || lonLine;

        // Lighting calculation
        const lx = 0.5;
        const ly = 0.5;
        const lz = 1.0;
        const lenL = Math.sqrt(lx * lx + ly * ly + lz * lz);

        // Normal at rotated position
        const nx = rx;
        const ny = y;
        const nz = rz;
        const lenN = Math.sqrt(nx * nx + ny * ny + nz * nz);
        const ndotl = (nx * lx + ny * ly + nz * lz) / (lenN * lenL);
        
        // Depth factor: closer points are brighter
        const depthFactor = (rz + 1) / 2;
        
        // Combine lighting and depth
        let brightness = Math.max(0, ndotl * 0.6 + depthFactor * 0.4);
        
        // Grid lines are brighter
        if (isGridLine) {
          brightness = Math.min(1, brightness + 0.3);
        }

        const idx = Math.floor(brightness * (ASCII_RAMP.length - 1));
        row += ASCII_RAMP[idx];
      }
      lines.push(row);
    }
    pre.textContent = lines.join("\n");
  }, [mode, iconArt]);

  useEffect(() => {
    const loop = () => {
      angleRef.current += 0.03;
      renderFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [renderFrame]);

  return (
    <pre
      ref={preRef}
      aria-hidden
      className="ascii-pre"
      style={{ color: "#60a5fa", fontFamily: "JetBrains Mono, monospace", fontSize: 11, margin: 0 }}
    />
  );
}
