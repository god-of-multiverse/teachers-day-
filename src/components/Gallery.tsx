import { useState } from "react";
import { createPortal } from "react-dom";
import { gallery } from "../lib/content";
import { Eyebrow, Section, Title } from "./ui";

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section id="gallery">
      <Eyebrow>A little gallery</Eyebrow>
      <Title sub="Painted memories of everything a classroom of yours felt like.">
        Colours of Gratitude
      </Title>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2.5 sm:gap-3 lg:max-w-none lg:grid-cols-4">
        {gallery.map((g, i) => (
          <button
            key={g.src}
            onClick={() => setOpen(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 text-left active:scale-[0.98] sm:rounded-2xl lg:aspect-[4/5]"
          >
            <img
              src={g.src}
              alt={g.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1200ms] sm:group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14081f] via-[#14081f]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5">
              <h3 className="font-display text-sm leading-tight font-semibold text-amber-100 sm:text-base lg:text-lg">
                {g.title}
              </h3>
              <p className="mt-0.5 text-[0.65rem] leading-snug text-cream/70 sm:text-[0.7rem]">
                {g.caption}
              </p>
            </div>
            <span className="absolute top-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[0.5rem] tracking-widest text-cream/70 uppercase backdrop-blur">
              view
            </span>
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[999] flex cursor-zoom-out items-center justify-center overscroll-contain bg-black/90 p-3 backdrop-blur-md sm:p-5"
          >
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="glass absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-lg text-cream"
          >
            ✕
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 sm:rounded-3xl"
          >
            <img
              src={gallery[open].src}
              alt={gallery[open].title}
              className="max-h-[58vh] w-full object-cover sm:max-h-[70vh]"
            />
            <div className="glass p-4 text-center sm:p-6">
              <h3 className="font-display text-xl text-amber-100 sm:text-2xl">
                {gallery[open].title}
              </h3>
              <p className="font-hand mt-1 text-lg text-rose-200 sm:text-xl">
                {gallery[open].caption}
              </p>
            </div>

            {/* swipe-free prev / next for thumbs */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                onClick={() => setOpen((open - 1 + gallery.length) % gallery.length)}
                className="glass h-11 rounded-full px-5 text-sm text-cream/85"
              >
                ← Prev
              </button>
              <button
                onClick={() => setOpen((open + 1) % gallery.length)}
                className="glass h-11 rounded-full px-5 text-sm text-cream/85"
              >
                Next →
              </button>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </Section>
  );
}
