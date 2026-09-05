import { useEffect, useState } from "react";
import { quotes } from "../lib/content";
import { Section } from "./ui";

export default function Quotes() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % quotes.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <Section className="flex items-center">
      <div className="glass relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl px-4 py-8 text-center sm:rounded-3xl sm:px-12 sm:py-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/15 blur-3xl" />
        <span className="font-display absolute top-2 left-5 text-6xl leading-none text-amber-300/20 select-none sm:top-4 sm:left-8 sm:text-8xl">
          “
        </span>

        <div className="relative min-h-[180px] sm:min-h-[150px]">
          {quotes.map((q, idx) => (
            <blockquote
              key={q.text}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
                idx === i
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-4 opacity-0"
              }`}
            >
              <p className="font-display px-1 text-[1.2rem] leading-snug font-light text-balance text-cream sm:text-3xl">
                {q.text}
              </p>
              <footer className="mt-5 text-[0.58rem] tracking-[0.25em] text-amber-300/80 uppercase sm:mt-6 sm:text-[0.68rem] sm:tracking-[0.35em]">
                — {q.by}
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-1 sm:mt-8 sm:gap-2">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Quote ${idx + 1}`}
              className="group flex h-9 items-center px-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  idx === i ? "w-8 bg-amber-300" : "w-1.5 bg-cream/25 group-hover:bg-cream/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
