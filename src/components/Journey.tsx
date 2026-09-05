import { journey } from "../lib/content";
import { Eyebrow, Section, Title } from "./ui";

export default function Journey() {
  return (
    <Section id="journey">
      <Eyebrow>Our story with you</Eyebrow>
      <Title sub="A little walk back through the years we spent in your classroom.">
        The Journey
      </Title>

      <div className="relative mx-auto max-w-2xl">
        <div className="absolute top-1 bottom-1 left-[9px] w-px bg-gradient-to-b from-transparent via-amber-300/50 to-transparent sm:left-1/2" />

        {journey.map((j, i) => {
          const right = i % 2 === 1;
          return (
            <div key={j.year} className="relative mb-5 pl-8 last:mb-0 sm:mb-6 sm:pl-0">
              <div
                className={`sm:w-1/2 ${right ? "sm:ml-auto sm:pl-8 sm:text-left" : "sm:pr-8 sm:text-right"}`}
              >
                <span className="font-hand text-lg text-rose-200 sm:text-xl">{j.year}</span>
                <h3 className="font-display text-base leading-tight font-semibold text-cream sm:text-xl">
                  {j.title}
                </h3>
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-pretty text-cream/65 sm:text-[0.82rem]">
                  {j.text}
                </p>
              </div>

              <span className="absolute top-1.5 left-[9px] flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center sm:left-1/2">
                <span className="absolute h-3.5 w-3.5 animate-ping rounded-full bg-amber-300/40" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-200 to-rose-300 ring-4 ring-[#1a0c27]" />
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
