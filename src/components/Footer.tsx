import { celebrationBurst } from "../lib/confetti";
import { teacher } from "../lib/content";

export default function Footer() {
  return (
    <footer className="relative z-10 flex flex-col items-center justify-center px-4 py-8 text-center sm:px-5">
      <div className="mx-auto max-w-3xl">
        <div className="gold-line mx-auto mb-8 h-px w-2/3 sm:mb-10" />

        <p className="font-display text-[clamp(1.5rem,6.5vw,2.1rem)] leading-snug font-light text-balance text-cream sm:text-4xl">
          Thank you for everything, <span className="text-shimmer">{teacher.name}</span>.
        </p>
        <p className="font-hand mt-2.5 text-lg text-rose-200 sm:mt-3 sm:text-2xl">
          You will always be our favourite chapter. 💫
        </p>

        <button
          onClick={() => celebrationBurst()}
          className="mt-6 rounded-full border border-amber-300/40 px-7 py-3 text-sm text-amber-200 transition-colors active:bg-amber-300/20 sm:hover:bg-amber-300/10"
        >
          One more celebration 🎊
        </button>

        <p className="mt-8 text-[0.58rem] tracking-[0.28em] text-cream/35 uppercase">
          Happy Teacher's Day · 5 September
        </p>
        <p className="mt-1.5 text-[0.58rem] tracking-[0.2em] text-cream/25">
          Made with ❤️, chalk dust and a lot of gratitude
        </p>
      </div>
    </footer>
  );
}
