import { useEffect, useRef, useState } from "react";
import { fireConfetti } from "../lib/confetti";

type Wish = { name: string; text: string; id: string };

const KEY = "teachers-day-wishes";
const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];
const TONES = [
  "from-amber-200/95 to-amber-100/85",
  "from-rose-200/95 to-rose-100/85",
  "from-violet-200/95 to-violet-100/85",
  "from-emerald-200/95 to-emerald-100/85",
  "from-sky-200/95 to-sky-100/85",
];

export default function WishWall() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editText, setEditText] = useState("");
  const [open, setOpen] = useState(false); // compose panel (mobile-friendly)
  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Wish[];
        const realWishes = saved.filter((wish) => !wish.id.startsWith("seed-"));
        setWishes(realWishes);
        localStorage.setItem(KEY, JSON.stringify(realWishes));
        return;
      }
    } catch {
      /* ignore */
    }
    setWishes([]);
  }, []);

  const persist = (next: Wish[]) => {
    setWishes(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    persist([
      {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        name: name.trim() || "A student",
        text: text.trim(),
      },
      ...wishes,
    ]);
    setText("");
    setOpen(false);
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    fireConfetti(window.innerWidth / 2, window.innerHeight * 0.55, 70);
  };

  const remove = (id: string) => persist(wishes.filter((w) => w.id !== id));

  const startEdit = (wish: Wish) => {
    setEditingId(wish.id);
    setEditName(wish.name);
    setEditText(wish.text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    persist(
      wishes.map((wish) =>
        wish.id === id
          ? { ...wish, name: editName.trim() || "A student", text: editText.trim() }
          : wish,
      ),
    );
    setEditingId(null);
  };

  /** textarea grows with the message — flexible, never a fixed box */
  const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  return (
    <div className="flex h-full flex-col px-3 pt-3 pb-1 sm:px-8 sm:pt-4">
      {/* ---------- compact header ---------- */}
      <div className="shrink-0 text-center">
        <div className="mb-1 flex items-center justify-center gap-2.5">
          <span className="gold-line h-px w-6 sm:w-12" />
          <span className="text-[0.5rem] tracking-[0.28em] text-amber-300/90 uppercase sm:text-[0.6rem]">
            Add your voice
          </span>
          <span className="gold-line h-px w-6 sm:w-12" />
        </div>
        <h2 className="font-display text-[clamp(1.4rem,6vw,1.9rem)] leading-tight font-light text-cream sm:text-3xl">
          The Wishing Wall
        </h2>
      </div>

      {/* ---------- compose ---------- */}
      <div className="mt-2.5 shrink-0 sm:mt-3">
        {!open ? (
          <button
            onClick={() => {
              setOpen(true);
              setTimeout(() => taRef.current?.focus(), 60);
            }}
            className="glass flex w-full items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-[0.8rem] text-cream/55 transition active:scale-[0.99] sm:hover:border-amber-300/40"
          >
            <span className="text-base">✍️</span>
            Write a wish for Ma'am…
            <span className="ml-auto rounded-full bg-amber-300/20 px-2.5 py-1 text-[0.6rem] font-semibold tracking-wider text-amber-200 uppercase">
              Add
            </span>
          </button>
        ) : (
          <form onSubmit={submit} className="glass rounded-2xl p-2.5 sm:p-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={28}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[0.8rem] text-cream placeholder-cream/35 outline-none focus:border-amber-300/60"
            />
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                autoGrow(e.target);
              }}
              placeholder="Write your wish for Ma'am…"
              rows={2}
              maxLength={220}
              className="mt-2 w-full resize-none overflow-y-auto rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[0.8rem] leading-relaxed text-cream placeholder-cream/35 outline-none focus:border-amber-300/60"
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[0.55rem] tracking-widest text-cream/40 uppercase">
                {220 - text.length} left
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-full px-3 py-2 text-[0.7rem] tracking-wider text-cream/55 uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="rounded-full bg-gradient-to-r from-amber-300 to-rose-200 px-4 py-2 text-[0.7rem] font-semibold tracking-wider text-plum uppercase transition active:scale-95 disabled:opacity-40"
              >
                Pin it 📌
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ---------- the wall: flexes to fill whatever height is left ---------- */}
      <div
        ref={listRef}
        data-scrollable
        className="page-scroll mt-2.5 min-h-0 flex-1 sm:mt-3"
      >
        {wishes.length === 0 ? (
          <p className="py-10 text-center text-[0.8rem] text-cream/40">
            No wishes yet — be the first to pin one. 💛
          </p>
        ) : (
          <div className="columns-2 gap-2.5 pb-2 sm:columns-3 sm:gap-3 lg:columns-4 [&>*]:mb-2.5 sm:[&>*]:mb-3">
            {wishes.map((w, i) => (
              <div
                key={w.id}
                className={`group relative break-inside-avoid rounded-xl bg-gradient-to-br p-3 pt-5 text-plum shadow-lg transition-transform duration-300 sm:hover:rotate-0 sm:hover:scale-[1.02] ${TONES[i % TONES.length]} ${TILT[i % TILT.length]}`}
              >
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-sm drop-shadow">
                  📌
                </span>
                {editingId === w.id ? (
                  <div className="space-y-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={28}
                      aria-label="Edit name"
                      className="w-full rounded-md border border-plum/20 bg-white/30 px-2 py-1 text-xs text-plum outline-none"
                    />
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={220}
                      aria-label="Edit wish"
                      className="w-full resize-none rounded-md border border-plum/20 bg-white/30 px-2 py-1 text-sm leading-snug text-plum outline-none"
                      rows={4}
                    />
                    <div className="flex justify-end gap-1.5 text-[0.6rem] font-semibold uppercase">
                      <button onClick={() => setEditingId(null)} className="rounded-full px-2 py-1 text-plum/60">
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(w.id)}
                        disabled={!editText.trim()}
                        className="rounded-full bg-plum/15 px-2 py-1 text-plum disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-hand text-[0.95rem] leading-snug break-words hyphens-auto sm:text-lg">
                      {w.text}
                    </p>
                    <p className="mt-2 text-[0.5rem] font-semibold tracking-[0.16em] text-plum/60 uppercase">
                      — {w.name}
                    </p>
                    <div className="mt-2 flex justify-end gap-1.5 text-[0.6rem] font-semibold uppercase">
                      <button
                        onClick={() => startEdit(w)}
                        aria-label="Edit wish"
                        className="rounded-full bg-plum/10 px-2 py-1 text-plum/65 transition hover:bg-plum/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(w.id)}
                        aria-label="Delete wish"
                        className="rounded-full bg-plum/10 px-2 py-1 text-plum/65 transition hover:bg-plum/20"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="shrink-0 pt-1 text-center text-[0.5rem] tracking-[0.2em] text-cream/25 uppercase">
        {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} pinned · saved on this device
      </p>
    </div>
  );
}
