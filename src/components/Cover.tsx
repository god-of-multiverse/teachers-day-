import { useEffect, useRef, useState } from "react";
import { celebrationBurst, fireConfetti } from "../lib/confetti";
import { heroTaglines, teacher } from "../lib/content";

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const del = useRef(false);

  useEffect(() => {
    let t: number;
    const tick = () => {
      const full = words[idx.current % words.length];
      const next = del.current ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1);
      setText(next);

      let delay = del.current ? 32 : 58;
      if (!del.current && next === full) {
        delay = 2200;
        del.current = true;
      } else if (del.current && next === "") {
        del.current = false;
        idx.current += 1;
        delay = 320;
      }
      t = window.setTimeout(tick, delay);
    };
    t = window.setTimeout(tick, 120);
    return () => clearTimeout(t);
  }, [text, words]);

  return text;
}

export default function Cover() {
  const typed = useTypewriter(heroTaglines);

  useEffect(() => {
    const t = setTimeout(() => celebrationBurst(), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center px-5 py-7 text-center sm:px-10 sm:py-9">
      {/* embossed border, like a hardback cover */}
      <div className="pointer-events-none absolute inset-1 rounded-xl border border-amber-300/20 sm:inset-2 sm:rounded-2xl" />
      <div className="pointer-events-none absolute inset-2 rounded-lg border border-amber-300/10 sm:inset-4 sm:rounded-xl" />

      <div className="animate-floaty mb-3 text-4xl sm:mb-5 sm:text-6xl" style={{ animationDelay: "-2s" }}>
        🌷
      </div>

      <p className="text-[0.55rem] tracking-[0.32em] text-amber-300/80 uppercase sm:text-xs sm:tracking-[0.5em]">
        5 · September · Teacher's Day
      </p>

      <h1 className="mt-4 font-display text-[clamp(2.3rem,11vw,3.6rem)] leading-[0.95] font-light text-balance sm:mt-5 sm:text-7xl md:text-8xl">
        <span className="text-shimmer block">Happy</span>
        <span className="block text-cream">Teacher's Day</span>
      </h1>

      <div className="my-4 flex items-center justify-center gap-3 sm:my-5">
        <span className="gold-line h-px w-10 sm:w-20" />
        <span className="text-amber-300/80">❦</span>
        <span className="gold-line h-px w-10 sm:w-20" />
      </div>

      <p className="font-hand text-[clamp(1.5rem,7vw,2.2rem)] text-rose-200 sm:text-4xl">
        {teacher.fullName}
      </p>

      <div className="mt-4 flex min-h-[4rem] items-center justify-center sm:min-h-[3.5rem]">
        <p className="max-w-xl text-[0.9rem] leading-relaxed text-pretty text-cream/75 sm:text-lg">
          <span className="text-cream/50">Because </span>
          <span className="text-amber-200">{typed}</span>
          <span className="caret text-amber-300">|</span>
        </p>
      </div>

      <button
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          fireConfetti(r.left + r.width / 2, r.top, 110);
        }}
        className="animate-pulse-glow mt-5 rounded-full bg-gradient-to-r from-amber-300 via-rose-200 to-amber-300 px-7 py-3.5 text-sm font-semibold tracking-wide text-plum transition-transform active:scale-95 sm:mt-7 sm:px-9 sm:hover:scale-105"
      >
        🎉 Celebrate Ma'am!
      </button>

      <p className="mt-6 flex items-center gap-2 text-[0.6rem] tracking-[0.28em] text-cream/35 uppercase sm:mt-8">
        <span className="hidden sm:inline">Click the right side to begin</span>
        <span className="sm:hidden">Tap the right side to begin</span>
        <span className="inline-block animate-pulse">→</span>
      </p>
    </div>
  );
}
