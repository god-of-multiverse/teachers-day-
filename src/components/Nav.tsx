import { useEffect, useState } from "react";
import MusicToggle from "./MusicToggle";

type Props = {
  pages: { label: string; icon: string }[];
  current: number;
  onNavigate: (i: number) => void;
};

export default function Nav({ pages, current, onNavigate }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // close the drawer whenever the page turns
  useEffect(() => setOpen(false), [current]);

  const progress = ((current + 1) / pages.length) * 100;

  return (
    <>
      {/* how far through the book we are */}
      <div className="fixed top-0 left-0 z-[600] h-[3px] w-full">
        <div
          className="h-full bg-gradient-to-r from-amber-300 via-rose-300 to-violet-400 transition-[width] duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <nav className="fixed inset-x-0 top-0 z-[550] border-b border-white/8 bg-[#14081f]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-8 sm:py-3">
          <button
            onClick={() => onNavigate(0)}
            className="font-display text-base tracking-wide text-cream sm:text-xl"
          >
            <span className="text-amber-300">✦</span> Teacher's&nbsp;Day
          </button>

          {/* desktop chapter links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {pages.slice(1, -1).map((p, i) => {
              const pageIndex = i + 1;
              return (
                <button
                  key={p.label}
                  onClick={() => onNavigate(pageIndex)}
                  className={`rounded-full px-3 py-2 text-[0.68rem] tracking-widest uppercase transition-colors ${
                    pageIndex === current
                      ? "bg-amber-300/15 text-amber-200"
                      : "text-cream/55 hover:bg-white/10 hover:text-amber-200"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <MusicToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="glass flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            >
              <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-[2px] w-5 rounded bg-amber-200 transition-all duration-300 ${
                  open ? "top-[7px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute top-[7px] left-0 block h-[2px] w-5 rounded bg-amber-200 transition-all duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[2px] w-5 rounded bg-amber-200 transition-all duration-300 ${
                  open ? "top-[7px] -rotate-45" : "top-[14px]"
                }`}
              />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* mobile table of contents */}
      <div
        className={`fixed inset-0 z-[540] md:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-[#0b0412]/85 backdrop-blur-md transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-3 top-16 rounded-3xl border border-white/12 bg-[#1c0e2b]/95 p-3 shadow-2xl transition-all duration-300 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <p className="px-4 pt-2 pb-3 text-[0.55rem] tracking-[0.3em] text-amber-300/70 uppercase">
            Contents
          </p>
          {pages.map((p, i) => (
            <button
              key={p.label}
              onClick={() => onNavigate(i)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm tracking-wider uppercase transition-colors ${
                i === current ? "bg-amber-300/15 text-amber-200" : "text-cream/75 active:bg-white/10"
              }`}
            >
              <span className="text-base">{p.icon}</span>
              <span className="flex-1">{p.label}</span>
              <span className="text-[0.6rem] text-cream/35">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
