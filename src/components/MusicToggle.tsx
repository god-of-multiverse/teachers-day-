import { useEffect, useRef, useState } from "react";
import { CanonPlayer } from "../lib/music";

export default function MusicToggle() {
  const [on, setOn] = useState(false);
  const playerRef = useRef<CanonPlayer | null>(null);

  useEffect(() => {
    if (!playerRef.current) playerRef.current = new CanonPlayer();
    const p = playerRef.current;
    if (on) void p.play();
    else p.pause();
  }, [on]);

  useEffect(() => () => playerRef.current?.dispose(), []);

  return (
    <div className="flex items-center gap-2">
      {/* now-playing pill — desktop only, the nav is tight on phones */}
      <div
        className={`glass hidden items-center gap-2 overflow-hidden rounded-full py-1.5 transition-all duration-500 lg:flex ${
          on ? "max-w-[230px] px-3 opacity-100" : "max-w-0 px-0 opacity-0"
        }`}
      >
        <span className="flex h-4 items-end gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-amber-300"
              style={{
                height: `${6 + ((i * 5) % 11)}px`,
                animation: `floaty ${0.9 + i * 0.18}s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </span>
        <span className="text-[0.6rem] tracking-[0.18em] whitespace-nowrap text-cream/75 uppercase">
          Canon in D · for Ma'am
        </span>
      </div>

      <button
        onClick={() => setOn((v) => !v)}
        className="glass relative flex h-10 w-10 items-center justify-center rounded-full text-base shadow-lg transition-transform active:scale-95 sm:hover:scale-110"
        aria-label={on ? "Pause music" : "Play music"}
        title={on ? "Pause the piano" : "Play a gentle piano melody"}
      >
        <span>{on ? "⏸" : "🎹"}</span>
        {on && (
          <span className="absolute inset-0 animate-ping rounded-full border border-amber-300/40" />
        )}
      </button>
    </div>
  );
}
