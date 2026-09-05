import { useState } from "react";
import { celebrationBurst } from "../lib/confetti";
import { giftMessage } from "../lib/content";
import { Eyebrow, Section, Title } from "./ui";

export default function GiftBox() {
  const [open, setOpen] = useState(false);

  return (
    <Section id="gift" className="flex flex-col justify-center">
      <Eyebrow>A tiny surprise</Eyebrow>
      <Title sub="Tap the box, Ma'am — there's something inside for you.">Open Your Gift</Title>

      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            if (!open) {
              setOpen(true);
              celebrationBurst();
            } else {
              setOpen(false);
            }
          }}
          className="group relative h-40 w-44 shrink-0 cursor-pointer focus:outline-none sm:h-48 sm:w-52"
          aria-label="Open the gift"
        >
          {/* glow */}
          <div
            className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${
              open ? "scale-150 bg-amber-300/40" : "bg-rose-400/20 sm:group-hover:bg-amber-300/25"
            }`}
          />

          {/* lid */}
          <div
            className={`absolute top-10 left-1/2 z-20 h-10 w-48 -translate-x-1/2 rounded-xl bg-gradient-to-b from-rose-300 to-rose-400 shadow-xl sm:top-12 sm:h-12 sm:w-56 ${
              open ? "lid-open" : "transition-transform duration-500 sm:group-hover:-translate-y-2"
            }`}
          >
            <div className="absolute inset-x-0 top-0 mx-auto h-full w-7 bg-gradient-to-b from-amber-200 to-amber-400 sm:w-8" />
            <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 gap-1 sm:-top-7">
              <span className="block h-7 w-7 -rotate-12 rounded-full border-[5px] border-amber-300 sm:h-8 sm:w-8 sm:border-[6px]" />
              <span className="block h-7 w-7 rotate-12 rounded-full border-[5px] border-amber-300 sm:h-8 sm:w-8 sm:border-[6px]" />
            </div>
          </div>

          {/* body */}
          <div className="absolute bottom-3 left-1/2 h-28 w-40 -translate-x-1/2 overflow-hidden rounded-xl bg-gradient-to-b from-purple-500 to-purple-800 shadow-2xl sm:bottom-4 sm:h-32 sm:w-48">
            <div className="absolute inset-y-0 left-1/2 w-7 -translate-x-1/2 bg-gradient-to-b from-amber-200 to-amber-400 sm:w-8" />
            <div
              className={`absolute inset-0 flex items-center justify-center text-4xl transition-all duration-500 ${
                open ? "-translate-y-2 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <span className="animate-floaty">💐</span>
            </div>
          </div>

          {!open && (
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.3em] text-amber-200/70 uppercase">
              tap me
            </span>
          )}
        </button>

        <div
          className={`max-w-xl text-center transition-all duration-700 ${
            open
              ? "mt-8 translate-y-0 opacity-100 sm:mt-10"
              : "pointer-events-none mt-4 h-0 translate-y-6 overflow-hidden opacity-0"
          }`}
        >
          <h3 className="font-display text-[1.25rem] leading-snug font-light text-balance text-amber-100 sm:text-2xl">
            {giftMessage.title}
          </h3>
          <p className="mt-2.5 text-[0.82rem] leading-relaxed text-pretty text-cream/70 sm:text-[0.9rem]">
            {giftMessage.body}
          </p>
        </div>
      </div>
    </Section>
  );
}
