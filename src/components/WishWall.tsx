import { useEffect, useRef, useState } from "react";
import { fireConfetti } from "../lib/confetti";
import { supabase } from "../lib/supabase";

type Wish = {
  name: string;
  text: string;
  id: string;
  ownerId?: string;
  font?: string;
  color?: string;
};
type DeletedWish = Wish & { deletedAt: string };

const KEY = "teachers-day-wishes";
const OWNER_KEY = "teachers-day-owner-id";
const AUDIT_KEY = "teachers-day-deleted-wishes";
const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];
const TONES = [
  "from-amber-200/95 to-amber-100/85",
  "from-rose-200/95 to-rose-100/85",
  "from-violet-200/95 to-violet-100/85",
  "from-emerald-200/95 to-emerald-100/85",
  "from-sky-200/95 to-sky-100/85",
];
const FONT_OPTIONS = [
  { value: "hand", label: "Handwritten", className: "font-hand" },
  { value: "display", label: "Elegant", className: "font-display" },
  { value: "sans", label: "Clean", className: "font-sans" },
];
const TEXT_COLORS = [
  { value: "#2b1440", label: "Plum" },
  { value: "#7f1d1d", label: "Ruby" },
  { value: "#14532d", label: "Forest" },
  { value: "#164e63", label: "Ocean" },
  { value: "rainbow", label: "Rainbow glow" },
];

function getOwnerId() {
  try {
    const saved = localStorage.getItem(OWNER_KEY);
    if (saved) return saved;
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    localStorage.setItem(OWNER_KEY, id);
    return id;
  } catch {
    return "temporary-owner";
  }
}

export default function WishWall() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [ownerId] = useState(getOwnerId);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editText, setEditText] = useState("");
  const [editFont, setEditFont] = useState("hand");
  const [editColor, setEditColor] = useState("#2b1440");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false); // compose panel (mobile-friendly)
  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (supabase) {
        let { data, error } = await supabase
          .from("wishes")
          .select("id, owner_id, name, comment, font, color")
          .is("deleted_at", null)
          .order("created_at", { ascending: false });
        if (!error && active) {
          const localRaw = localStorage.getItem(KEY);
          const localWishes = localRaw ? (JSON.parse(localRaw) as Wish[]) : [];
          const serverIds = new Set((data ?? []).map((wish) => wish.id));
          const oldWishes = localWishes.filter(
            (wish) =>
              !wish.id.startsWith("seed-") &&
              wish.ownerId === ownerId &&
              !serverIds.has(wish.id),
          );

          if (oldWishes.length) {
            await supabase.from("wishes").upsert(
              oldWishes.map((wish) => ({
                id: wish.id,
                owner_id: wish.ownerId || ownerId,
                name: wish.name,
                comment: wish.text,
              })),
              { onConflict: "id", ignoreDuplicates: true },
            );
            const refreshed = await supabase
              .from("wishes")
                .select("id, owner_id, name, comment, font, color")
              .is("deleted_at", null)
              .order("created_at", { ascending: false });
            if (!refreshed.error) data = refreshed.data;
          }

          const sharedWishes = (data ?? []).map((wish) => ({
            id: wish.id,
            ownerId: wish.owner_id,
            name: wish.name,
            text: wish.comment,
                        font: wish.font ?? "hand",
                        color: wish.color ?? "#2b1440",
          }));
          setWishes(sharedWishes);
          localStorage.setItem(KEY, JSON.stringify(sharedWishes));
          return;
        }
      }

      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Wish[];
          const realWishes = saved.filter((wish) => !wish.id.startsWith("seed-"));
          if (active) setWishes(realWishes);
          localStorage.setItem(KEY, JSON.stringify(realWishes));
          return;
        }
      } catch {
        /* ignore */
      }
      if (active) setWishes([]);
    };

    void load();
    const channel = supabase?.channel("wishes-live").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "wishes" },
      () => void load(),
    ).subscribe();
    const refresh = window.setInterval(() => void load(), 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      window.clearInterval(refresh);
      document.removeEventListener("visibilitychange", onVisible);
      if (channel) void supabase?.removeChannel(channel);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      taRef.current?.focus({ preventScroll: true });
      taRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const persist = (next: Wish[]) => {
    setWishes(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const wish = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      ownerId,
      name: name.trim() || "A student",
      text: text.trim(),
      font: "hand",
      color: "#2b1440",
    };
    if (supabase) {
      const { error } = await supabase.from("wishes").insert({
        id: wish.id,
        owner_id: wish.ownerId,
        name: wish.name,
        comment: wish.text,
        font: wish.font,
        color: wish.color,
      });
      if (error) {
        persist([wish, ...wishes]);
        return;
      }
      setWishes((current) => [wish, ...current]);
    } else {
      persist([wish, ...wishes]);
    }
    setText("");
    setOpen(false);
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    fireConfetti(window.innerWidth / 2, window.innerHeight * 0.55, 70);
  };

  const remove = async (id: string) => {
    const wish = wishes.find((item) => item.id === id && item.ownerId === ownerId);
    if (!wish) return;
    setStatus("");

    if (supabase) {
      const { data: deleted, error } = await supabase.rpc("delete_wish", {
        wish_id: id,
        wish_owner_id: ownerId,
      });
      if (error || deleted !== true) {
        setStatus("Delete is not enabled yet. Please run the latest Supabase schema.");
        return;
      }
      const remaining = wishes.filter((item) => item.id !== id);
      persist(remaining);
      return;
    }

    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      const deleted = raw ? (JSON.parse(raw) as DeletedWish[]) : [];
      localStorage.setItem(
        AUDIT_KEY,
        JSON.stringify([...deleted, { ...wish, deletedAt: new Date().toISOString() }]),
      );
    } catch {
      /* ignore */
    }

    persist(wishes.filter((item) => item.id !== id));
  };

  const startEdit = (wish: Wish) => {
    setEditingId(wish.id);
    setEditName(wish.name);
    setEditText(wish.text);
    setEditFont(wish.font || "hand");
    setEditColor(wish.color || "#2b1440");
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    const nextName = editName.trim() || "A student";
    const nextText = editText.trim();
    if (supabase) {
      const { error } = await supabase
        .from("wishes")
        .update({ name: nextName, comment: nextText, font: editFont, color: editColor })
        .eq("id", id)
        .eq("owner_id", ownerId);
      if (error) return;
    }
    persist(
      wishes.map((wish) =>
        wish.id === id && wish.ownerId === ownerId
          ? { ...wish, name: nextName, text: nextText, font: editFont, color: editColor }
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
          <form
            onSubmit={submit}
            className="wish-composer glass rounded-2xl p-2.5 sm:p-3"
            onFocus={(e) => {
              if (window.innerWidth <= 640) {
                e.target.scrollIntoView({ block: "center", behavior: "smooth" });
              }
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              enterKeyHint="next"
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
              enterKeyHint="done"
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
              // Only the browser that created a wish can manage it.
              (() => {
                const canManage = w.ownerId === ownerId;
                return (
              <div
                key={w.id}
                className={`group relative break-inside-avoid rounded-xl bg-gradient-to-br p-3 pt-5 text-plum shadow-lg transition-transform duration-300 sm:hover:rotate-0 sm:hover:scale-[1.02] ${TONES[i % TONES.length]} ${TILT[i % TILT.length]}`}
              >
                <div className="absolute -top-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1">
                  <span className="text-sm drop-shadow">📌</span>
                  {canManage && (
                    <div className="flex gap-1 text-[0.55rem] font-semibold uppercase">
                      <button
                        onClick={() => startEdit(w)}
                        aria-label="Edit wish"
                        className="rounded-full bg-white/50 px-1.5 py-0.5 text-plum shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(w.id)}
                        aria-label="Delete wish"
                        className="rounded-full bg-white/50 px-1.5 py-0.5 text-plum shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-[0.6rem] font-semibold uppercase text-plum/60">
                        Font
                        <select
                          value={editFont}
                          onChange={(e) => setEditFont(e.target.value)}
                          className="ml-1 rounded-md bg-white/35 px-1.5 py-1 text-xs text-plum outline-none"
                        >
                          {FONT_OPTIONS.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span className="text-[0.6rem] font-semibold uppercase text-plum/60">Color</span>
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          title={color.label}
                          aria-label={`${color.label} text`}
                          onClick={() => setEditColor(color.value)}
                          className={`h-5 w-5 rounded-full border-2 ${editColor === color.value ? "border-plum" : "border-white/70"} ${color.value === "rainbow" ? "wish-rainbow-swatch" : ""}`}
                          style={color.value === "rainbow" ? undefined : { backgroundColor: color.value }}
                        />
                      ))}
                    </div>
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
                    <p
                      className={`${FONT_OPTIONS.find((font) => font.value === w.font)?.className || "font-hand"} ${w.color === "rainbow" ? "wish-rainbow" : ""} text-[0.95rem] leading-snug break-words hyphens-auto sm:text-lg`}
                      style={w.color === "rainbow" ? undefined : { color: w.color || "#2b1440" }}
                    >
                      {w.text}
                    </p>
                    <p className="mt-2 text-[0.5rem] font-semibold tracking-[0.16em] text-plum/60 uppercase">
                      — {w.name}
                    </p>
                  </>
                )}
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>

      <p className="shrink-0 pt-1 text-center text-[0.5rem] tracking-[0.2em] text-cream/25 uppercase">
        {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} pinned · saved on this device
      </p>
      {status && <p className="shrink-0 text-center text-[0.6rem] text-rose-200">{status}</p>}
    </div>
  );
}
