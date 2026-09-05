import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative z-10 px-4 py-5 sm:px-9 sm:py-7", className)}
    >
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-center gap-3">
      <span className="gold-line h-px w-8 sm:w-14" />
      <span className="text-[0.55rem] tracking-[0.3em] text-amber-300/90 uppercase sm:text-[0.62rem] sm:tracking-[0.4em]">
        {children}
      </span>
      <span className="gold-line h-px w-8 sm:w-14" />
    </div>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-5 text-center sm:mb-7">
      <h2 className="font-display text-[clamp(1.65rem,6.5vw,2.25rem)] leading-tight font-light text-balance text-cream sm:text-4xl lg:text-5xl">
        {children}
      </h2>
      {sub && (
        <p className="mx-auto mt-2 max-w-xl text-[0.8rem] leading-relaxed text-pretty text-cream/60 sm:mt-3 sm:text-sm">
          {sub}
        </p>
      )}
    </div>
  );
}
