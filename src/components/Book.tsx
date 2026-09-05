import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { playPageTurn } from "../lib/pageSound";
import Cover from "./Cover";
import Footer from "./Footer";
import Gallery from "./Gallery";
import GiftBox from "./GiftBox";
import Journey from "./Journey";
import Letter from "./Letter";
import Nav from "./Nav";
import Qualities from "./Qualities";
import Quotes from "./Quotes";
import WishWall from "./WishWall";

export type PageDef = {
  label: string;
  icon: string;
  node: React.ReactNode;
  /** true = page manages its own height/scrolling instead of being scaled to fit */
  fill?: boolean;
};

const FLIP_MS = 1000;
const PAGE_KEY = "teachers-day-current-page";

const PAGES: PageDef[] = [
  { label: "Cover", icon: "🌷", node: <Cover /> },
  { label: "Why You", icon: "💛", node: <Qualities /> },
  { label: "Journey", icon: "🕰️", node: <Journey /> },
  { label: "Quotes", icon: "❝", node: <Quotes /> },
  { label: "Gallery", icon: "🎨", node: <Gallery /> },
  { label: "Gift", icon: "🎁", node: <GiftBox /> },
  { label: "Letter", icon: "✉️", node: <Letter /> },
  { label: "Wishes", icon: "📌", node: <WishWall />, fill: true },
  { label: "The End", icon: "💫", node: <Footer /> },
];

const TOTAL = PAGES.length;

/* ------------------------------------------------------------------
   FitBox — scales its content down just enough to sit perfectly
   inside the page. Nothing ever scrolls, clips or shifts.
------------------------------------------------------------------ */
function FitBox({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    let frame = 0;
    const measure = () => {
      const oh = outer.clientHeight;
      const ow = outer.clientWidth;
      // scrollHeight/Width are layout values — unaffected by our transform,
      // so this can never feed back into itself.
      const ih = inner.scrollHeight;
      const iw = inner.scrollWidth;
      if (!oh || !ih) return;

      const next = Math.min(1, oh / ih, ow / iw);
      setScale(Number.isFinite(next) && next > 0 ? Math.max(0.45, next) : 1);
    };

    measure();

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    ro.observe(outer);
    ro.observe(inner);

    // re-check once fonts and artwork have settled
    const t1 = window.setTimeout(measure, 120);
    const t2 = window.setTimeout(measure, 600);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [children]);

  return (
    <div
      ref={outerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        ref={innerRef}
        className="w-full"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- page frame (spine + folio) ---------------- */
function PageChrome({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* gutter shadow beside the spine */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-7 bg-gradient-to-r from-black/50 via-black/14 to-transparent sm:w-11" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[3px] bg-gradient-to-b from-amber-300/50 via-rose-300/40 to-amber-300/50" />
      {/* light falling from the fore-edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white/[0.045] to-transparent" />

      {children}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-4 pb-2 text-[0.52rem] tracking-[0.22em] text-cream/35 uppercase sm:px-9 sm:pb-2.5 sm:text-[0.55rem]">
        <span>{PAGES[i].label}</span>
        <span>
          {i + 1} / {TOTAL}
        </span>
      </div>
    </div>
  );
}

/** Renders a page either scaled-to-fit, or filling the frame with its own layout. */
function PageContent({ i, live }: { i: number; live: boolean }) {
  const page = PAGES[i];

  // fill pages own their height and handle their own scrolling
  if (page.fill) {
    return (
      <div className={`h-full overflow-hidden pb-6 sm:pb-7 ${live ? "page-in" : ""}`}>
        {page.node}
      </div>
    );
  }

  return (
    <div className="h-full px-1 pt-2 pb-8 sm:pb-9">
      <FitBox>
        <div className={live ? "page-in" : ""}>{page.node}</div>
      </FitBox>
    </div>
  );
}

export default function Book() {
  const [index, setIndex] = useState(() => {
    const saved = Number(localStorage.getItem(PAGE_KEY));
    return Number.isInteger(saved) && saved >= 0 && saved < TOTAL ? saved : 0;
  });
  const [flip, setFlip] = useState<{ from: number; dir: 1 | -1 } | null>(null);
  const busy = useRef(false);

  const jumpTo = useCallback(
    (target: number) => {
      if (busy.current || target === index || target < 0 || target >= TOTAL) return;
      busy.current = true;
      setFlip({ from: index, dir: target > index ? 1 : -1 });
      setIndex(target);
      localStorage.setItem(PAGE_KEY, String(target));
      playPageTurn();
      window.setTimeout(() => {
        setFlip(null);
        busy.current = false;
      }, FLIP_MS);
    },
    [index],
  );

  const go = useCallback((dir: 1 | -1) => jumpTo(index + dir), [jumpTo, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // swipe (ignored when the gesture is mostly vertical, so the wishes page scrolls)
  const touch = useRef({ x: 0, y: 0, t: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (
      Math.abs(dx) > 55 &&
      Math.abs(dx) > Math.abs(dy) * 1.6 &&
      Date.now() - touch.current.t < 800
    ) {
      go(dx < 0 ? 1 : -1);
    }
  };

  /* ---------- tap left / right half of the book to turn ---------- */
  const stageRef = useRef<HTMLDivElement>(null);

  /** Never hijack a click meant for something interactive. */
  const isInteractive = (el: EventTarget | null) =>
    el instanceof Element &&
    !!el.closest("button, a, input, textarea, select, label, [data-no-flip]");

  const onStageClick = (e: React.MouseEvent) => {
    if (isInteractive(e.target)) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;

    // On a page you're meant to read/scroll, only the outer edges turn,
    // so tapping among the notes never yanks the page away.
    const inScrollable =
      e.target instanceof Element && !!e.target.closest("[data-scrollable]");
    if (inScrollable) {
      const edge = rect.width * 0.14;
      if (x > edge && x < rect.width - edge) return;
    }

    go(x < rect.width * 0.4 ? -1 : 1);
  };

  /** Cursor hints which way you'd turn — mutated directly to avoid re-renders. */
  const onStageMove = (e: React.MouseEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const clear = () => {
      stage.style.cursor = "";
      stage.dataset.side = "";
    };
    if (isInteractive(e.target)) return clear();

    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const inScrollable =
      e.target instanceof Element && !!e.target.closest("[data-scrollable]");
    if (inScrollable) {
      const edge = rect.width * 0.14;
      if (x > edge && x < rect.width - edge) return clear();
    }

    const back = x < rect.width * 0.4;
    const blocked = back ? index === 0 : index === TOTAL - 1;
    stage.style.cursor = blocked ? "default" : "pointer";
    stage.dataset.side = blocked ? "" : back ? "left" : "right";
  };

  const onStageLeave = () => {
    const stage = stageRef.current;
    if (stage) {
      stage.style.cursor = "";
      stage.dataset.side = "";
    }
  };

  const fwd = flip?.dir === 1;
  const baseIndex = flip ? (fwd ? index : flip.from) : index;
  const sheetIndex = flip ? (fwd ? flip.from : index) : index;
  const flipVars = { ["--flip-dur" as string]: `${FLIP_MS}ms` };

  return (
    <>
      <Nav pages={PAGES} current={index} onNavigate={jumpTo} />

      <div className="relative z-10 flex h-full flex-col px-1.5 pt-[46px] pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-16 sm:pb-4">
        <div
          ref={stageRef}
          className="book-stage group/stage relative mx-auto min-h-0 w-full max-w-5xl flex-1"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={onStageClick}
          onMouseMove={onStageMove}
          onMouseLeave={onStageLeave}
        >
          <div className="pointer-events-none absolute inset-x-6 -bottom-1 h-5 rounded-[50%] bg-black/50 blur-xl" />

          {/* ---------------- the page you are reading ---------------- */}
          <div className="page-edges glass absolute inset-0 overflow-hidden rounded-r-2xl rounded-l-md border-white/12 shadow-2xl sm:rounded-r-3xl">
            <PageChrome i={baseIndex}>
              <PageContent key={baseIndex} i={baseIndex} live />
            </PageChrome>

            {/* shadow cast by the sheet passing overhead */}
            {flip && (
              <div
                style={flipVars}
                className="cast-shadow pointer-events-none absolute inset-0 z-40 bg-gradient-to-r from-black/85 via-black/35 to-transparent"
              />
            )}

          </div>

          {/* ---------------- the turning sheet ---------------- */}
          {flip && (
            <div
              style={flipVars}
              className={`sheet absolute inset-0 z-50 ${fwd ? "flip-fwd" : "flip-bwd"}`}
            >
              {/* recto — the printed side */}
              <div className="face glass rounded-r-2xl rounded-l-md border-white/12 shadow-2xl sm:rounded-r-3xl">
                <PageChrome i={sheetIndex}>
                  <PageContent i={sheetIndex} live={false} />
                </PageChrome>
                <div
                  style={flipVars}
                  className="gloss pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.30)_48%,transparent_66%)]"
                />
                <div
                  style={flipVars}
                  className={`pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(90deg,rgba(0,0,0,0.9),rgba(0,0,0,0.55))] ${
                    fwd ? "shade-front" : "shade-front-rev"
                  }`}
                />
              </div>

              {/* verso — the blank reverse of the paper */}
              <div className="face face-back rounded-r-2xl rounded-l-md border border-white/10 bg-[linear-gradient(115deg,#26143a,#1b0d29_55%,#2d1645)] shadow-2xl sm:rounded-r-3xl">
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/50 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-amber-300/25 via-rose-300/20 to-amber-300/25" />
                <div className="flex h-full items-center justify-center">
                  <span className="font-display text-6xl text-amber-300/10 select-none">❦</span>
                </div>
                <div
                  style={flipVars}
                  className="gloss pointer-events-none absolute inset-0 bg-[linear-gradient(255deg,transparent_30%,rgba(255,255,255,0.22)_48%,transparent_66%)]"
                />
                <div
                  style={flipVars}
                  className={`pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0.92),rgba(0,0,0,0.6))] ${
                    fwd ? "shade-back" : "shade-back-rev"
                  }`}
                />
              </div>
            </div>
          )}

          {/* ---- tap-zone hints: a soft glow + chevron on the side you're about to turn ---- */}
          <div
            className={`pointer-events-none absolute inset-0 z-[60] overflow-hidden rounded-r-2xl rounded-l-md transition-opacity duration-200 sm:rounded-r-3xl ${
              flip ? "opacity-0" : ""
            }`}
          >
            {/* turn back */}
            <div className="absolute inset-y-0 left-0 flex w-[40%] items-center justify-start opacity-0 transition-opacity duration-300 group-data-[side=left]/stage:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200/12 to-transparent" />
              <span className="relative ml-3 flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/30 bg-black/30 text-xl text-amber-100 backdrop-blur-sm sm:ml-6">
                ‹
              </span>
            </div>
            {/* turn forward */}
            <div className="absolute inset-y-0 right-0 flex w-[60%] items-center justify-end opacity-0 transition-opacity duration-300 group-data-[side=right]/stage:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-l from-amber-200/12 to-transparent" />
              <span className="relative mr-3 flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/30 bg-black/30 text-xl text-amber-100 backdrop-blur-sm sm:mr-6">
                ›
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- chapter dots ---------------- */}
        <div className="mx-auto mt-1 flex w-full max-w-5xl shrink-0 items-center justify-center sm:mt-3">
          {PAGES.map((p, i) => (
            <button
              key={p.label}
              onClick={() => jumpTo(i)}
              aria-label={p.label}
              title={p.label}
              className="group flex h-8 items-center px-[3px]"
            >
              <span
                className={`block rounded-full transition-all duration-500 ${
                  i === index
                    ? "h-1.5 w-6 bg-gradient-to-r from-amber-300 to-rose-300"
                    : i < index
                      ? "h-1.5 w-1.5 bg-amber-300/45"
                      : "h-1.5 w-1.5 bg-cream/20 group-hover:bg-cream/45"
                }`}
              />
            </button>
          ))}
        </div>

        <p className="hidden shrink-0 text-center text-[0.52rem] tracking-[0.22em] text-cream/25 uppercase min-[380px]:block">
          <span className="sm:hidden">Tap the right side · or swipe</span>
          <span className="hidden sm:inline">Click the right side of the page · or use ← →</span>
        </p>
      </div>
    </>
  );
}
