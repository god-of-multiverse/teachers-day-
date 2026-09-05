import { qualities } from "../lib/content";
import { Eyebrow, Section, Title } from "./ui";

export default function Qualities() {
  return (
    <Section id="why">
      <Eyebrow>What makes you special</Eyebrow>
      <Title sub="Six of the countless reasons your students carry a piece of you wherever they go.">
        More Than A Teacher
      </Title>

      <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {qualities.map((q) => (
          <article
            key={q.title}
            className="group glass relative overflow-hidden rounded-xl p-3.5 transition-all duration-500 sm:rounded-2xl sm:p-4 sm:hover:-translate-y-1 sm:hover:border-amber-300/40"
          >
            <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl" />
            <div className="mb-2 flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300/25 to-rose-300/15 text-base sm:h-10 sm:w-10 sm:text-lg">
                {q.icon}
              </span>
              <h3 className="font-display text-base leading-tight font-semibold text-amber-100 sm:text-lg">
                {q.title}
              </h3>
            </div>
            <p className="text-[0.78rem] leading-relaxed text-pretty text-cream/65 sm:text-[0.8rem]">
              {q.text}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
