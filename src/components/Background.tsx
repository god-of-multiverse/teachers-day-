import { useEffect, useMemo, useState } from "react";

type Petal = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  char: string;
  opacity: number;
};

const CHARS = ["🌸", "🌼", "✿", "❀", "🍃", "✦"];

export default function Background() {
  // fewer particles on phones = smoother scrolling & less battery drain
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mqW = window.matchMedia("(max-width: 639px)");
    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setMobile(mqW.matches);
      setReduced(mqR.matches);
    };
    sync();
    mqW.addEventListener("change", sync);
    mqR.addEventListener("change", sync);
    return () => {
      mqW.removeEventListener("change", sync);
      mqR.removeEventListener("change", sync);
    };
  }, []);

  const petalCount = reduced ? 0 : mobile ? 5 : 12;
  const starCount = reduced ? 10 : mobile ? 14 : 36;

  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: petalCount }, (_, i) => ({
        left: (i * 11.3 + Math.random() * 6) % 100,
        delay: Math.random() * 18,
        duration: 16 + Math.random() * 16,
        size: 10 + Math.random() * (mobile ? 12 : 20),
        drift: (Math.random() - 0.5) * (mobile ? 120 : 220),
        char: CHARS[(Math.random() * CHARS.length) | 0],
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [petalCount, mobile],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: starCount }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.4,
        delay: Math.random() * 6,
        dur: 2.5 + Math.random() * 4,
      })),
    [starCount],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-[#14081f]" />

      {/* aurora blobs */}
      <div className="animate-aurora absolute -top-1/3 left-[-15%] h-[80vh] w-[80vw] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.35),transparent_65%)] blur-3xl" />
      <div
        className="animate-aurora absolute top-1/4 right-[-20%] h-[75vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(244,163,192,0.28),transparent_65%)] blur-3xl"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="animate-aurora absolute bottom-[-25%] left-1/4 h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(232,184,75,0.22),transparent_65%)] blur-3xl"
        style={{ animationDelay: "-15s" }}
      />

      {/* stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="ambient-star absolute rounded-full bg-amber-100"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* falling petals */}
      {petals.map((p, i) => (
        <span
          key={i}
          className="ambient-petal absolute top-0 select-none"
          style={
            {
              left: `${p.left}%`,
              fontSize: p.size,
              opacity: p.opacity,
              "--drift": `${p.drift}px`,
              animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
            } as React.CSSProperties
          }
        >
          {p.char}
        </span>
      ))}

      {/* vignette + grain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,4,16,0.75)_100%)]" />
    </div>
  );
}
