import { letter, teacher } from "../lib/content";
import { Eyebrow, Section, Title } from "./ui";

export default function Letter() {
  const paragraphs = letter.trim().split("\n\n");

  return (
    <Section id="letter">
      <Eyebrow>From our hearts</Eyebrow>
      <Title sub="Some things deserve to be written down, not just said.">A Letter For You</Title>

      <div className="relative mx-auto max-w-2xl">
        {/* stacked paper effect */}
        <div className="absolute inset-x-3 -bottom-2 h-full rotate-1 rounded-2xl bg-cream/20 sm:rounded-3xl" />
        <div className="absolute inset-x-1.5 -bottom-1 h-full -rotate-1 rounded-2xl bg-cream/40 sm:rounded-3xl" />

        <article className="paper relative rounded-2xl px-4 py-6 shadow-2xl sm:rounded-3xl sm:px-10 sm:py-8">
          <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-tr-2xl bg-gradient-to-bl from-amber-300/40 to-transparent sm:rounded-tr-3xl" />

          <div className="mb-4 flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">✉️</span>
            <span className="h-px flex-1 bg-plum/20" />
            <span className="text-[0.5rem] tracking-[0.18em] text-plum/50 uppercase sm:text-[0.55rem]">
              05 · 09 · Teacher's Day
            </span>
          </div>

          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`font-hand text-plum/90 ${
                i === 0
                  ? "text-xl sm:text-2xl"
                  : "mt-3 text-[1.05rem] leading-relaxed sm:mt-4 sm:text-xl"
              }`}
            >
              {p}
            </p>
          ))}

          <div className="mt-5 border-t border-plum/15 pt-3 text-right sm:mt-6 sm:pt-4">
            <p className="font-hand text-lg text-plum sm:text-2xl">{teacher.fromLine}</p>
            <p className="mt-0.5 text-[0.5rem] tracking-[0.2em] text-plum/50 uppercase sm:text-[0.58rem]">
              with all our love ❤️
            </p>
          </div>
        </article>
      </div>
    </Section>
  );
}
