import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Row = { id: string; name: string; comment: string; created_at: string; deleted_at: string | null };

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("wishes")
      .select("id, name, comment, created_at, deleted_at")
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else setRows(data ?? []);
  };

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user.email ?? null);
      if (data.session) void load();
    });
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const { data, error: signInError } = await supabase!.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    else {
      setUser(data.user.email ?? null);
      void load();
    }
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUser(null);
    setRows([]);
  };

  const editWish = async (row: Row) => {
    const nextComment = window.prompt("Edit this wish", row.comment);
    if (!nextComment?.trim()) return;
    const { error: editError } = await supabase?.rpc("admin_edit_wish", {
      wish_id: row.id,
      next_name: row.name,
      next_comment: nextComment.trim(),
    }) ?? { error: new Error("Supabase is unavailable") };
    if (editError) setError(editError.message);
    else void load();
  };

  const deleteWish = async (id: string) => {
    if (!window.confirm("Delete this wish permanently?")) return;
    const { error: deleteError } = await supabase?.rpc("admin_delete_wish", { wish_id: id }) ?? { error: new Error("Supabase is unavailable") };
    if (deleteError) setError(deleteError.message);
    else void load();
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#14081f] p-4 text-cream">
        <form onSubmit={signIn} className="glass w-full max-w-sm rounded-3xl p-6">
          <h1 className="font-display text-3xl">Admin dashboard</h1>
          <p className="mt-1 text-sm text-cream/60">Sign in with an approved Supabase account.</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="mt-5 w-full rounded-lg bg-white/10 p-3 outline-none" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className="mt-2 w-full rounded-lg bg-white/10 p-3 outline-none" />
          <button className="mt-4 w-full rounded-full bg-amber-300 px-4 py-3 font-semibold text-plum">Sign in</button>
          {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#14081f] p-4 text-cream sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div><p className="text-xs uppercase tracking-widest text-amber-300">Private area</p><h1 className="font-display text-4xl">Wish archive</h1></div>
          <button onClick={signOut} className="rounded-full border border-white/15 px-4 py-2 text-sm">Sign out</button>
        </div>
        <p className="mt-2 text-sm text-cream/60">Signed in as {user}</p>
        {error && <p className="mt-3 rounded-xl bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}
        <div className="mt-6 space-y-3">
          {rows.map((row) => <article key={row.id} className="rounded-2xl bg-white/10 p-4"><p className="font-semibold text-amber-200">{row.name}</p><p className="mt-1">{row.comment}</p><p className="mt-2 text-xs text-cream/45">{new Date(row.created_at).toLocaleString()}</p><div className="mt-3 flex gap-2"><button onClick={() => void editWish(row)} className="rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-plum">Edit</button><button onClick={() => void deleteWish(row.id)} className="rounded-full bg-rose-300/20 px-3 py-1 text-xs font-semibold text-rose-100">Delete</button></div></article>)}
          {!rows.length && <p className="text-cream/60">No wishes found.</p>}
        </div>
      </div>
    </main>
  );
}
