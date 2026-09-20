"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Memory {
  id: string;
  name: string;
  message: string;
  nice_moment: string | null;
  image_url: string | null;
  created_at: string;
  is_public: boolean;
  is_favorite: boolean;
}

const COLORS = ["#1e293b", "#3b82f6", "#059669", "#7c3aed", "#dc2626", "#d97706", "#0891b2", "#c026d3"];
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return Math.abs(h); };
const color = (n: string) => COLORS[hash(n) % COLORS.length];
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);
const fmt = (d: string) => new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Memory | null>(null);

  const fetchM = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/memories?limit=100");
      if (!r.ok) throw new Error("فشل التحميل");
      const d = await r.json();
      setMemories(d.memories || []);
    } catch { setError("حصل مشكلة، حاول تاني"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchM(); }, [fetchM]);

  const filtered = search.trim()
    ? memories.filter((m) => m.name.includes(search) || m.message.includes(search) || (m.nice_moment && m.nice_moment.includes(search)))
    : memories;

  const pickRandom = () => {
    if (!memories.length) return;
    setSelected(memories[Math.floor(Math.random() * memories.length)]);
  };

  return (
    <main className="min-h-screen bg-[var(--slate-50)]">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[var(--slate-200)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="btn btn-ghost btn-sm">
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرئيسية
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={pickRandom} className="btn btn-amber btn-sm">🎲 فاجئني</button>
            <Link href="/write" className="btn btn-primary btn-sm">✏️ اكتب</Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: "var(--slate-900)" }}>كل الذكريات</h1>
          <p className="text-sm mt-1" style={{ color: "var(--slate-400)" }}>{memories.length} ذكرى</p>
        </div>

        {memories.length > 3 && (
          <div className="mb-6 relative">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--slate-400)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث..." className="input pr-10" />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="spinner" style={{ width: 32, height: 32, borderColor: "var(--slate-200)", borderTopColor: "var(--blue)" }} />
            <p className="text-sm" style={{ color: "var(--slate-400)" }}>جاري التحميل...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-sm mb-3" style={{ color: "var(--red)" }}>{error}</p>
            <button onClick={fetchM} className="btn btn-outline btn-sm">حاول تاني</button>
          </div>
        )}

        {!loading && !error && memories.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[var(--slate-100)]">
              <span className="text-3xl">📖</span>
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--slate-800)" }}>لسه أول صفحة</h2>
            <p className="text-sm mb-5" style={{ color: "var(--slate-400)" }}>كن أول من يكتب ذكرى</p>
            <Link href="/write" className="btn btn-primary">اكتب ذكرتك</Link>
          </div>
        )}

        {!loading && !error && memories.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--slate-400)" }}>مفيش نتائج</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m) => (
              <div key={m.id} className="card card-hover cursor-pointer p-5" onClick={() => setSelected(m)}>
                <div className="text-4xl font-bold leading-none mb-2 select-none" style={{ color: "var(--amber)", opacity: 0.3, fontFamily: "Georgia, serif" }}>&quot;</div>

                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--slate-700)" }}>{m.message}</p>

                {m.nice_moment && (
                  <div className="p-3 rounded-lg mb-3" style={{ background: "var(--amber-light)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--amber-dark)" }}>✨ موقف حلو</p>
                    <p className="text-sm" style={{ color: "var(--slate-700)" }}>{m.nice_moment}</p>
                  </div>
                )}

                {m.image_url && (
                  <img src={m.image_url} alt="" className="w-full h-40 object-cover rounded-lg border border-[var(--slate-100)] mb-4" />
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-[var(--slate-100)]">
                  <span className="text-xs" style={{ color: "var(--slate-400)" }}>{fmt(m.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--slate-100)] hover:bg-[var(--slate-200)] transition-colors z-10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--slate-500)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">❤️</div>
              <div className="text-5xl font-bold mb-1 select-none" style={{ color: "var(--amber)", opacity: 0.2, fontFamily: "Georgia, serif" }}>&quot;</div>
              <p className="text-base leading-relaxed mb-4" style={{ color: "var(--slate-800)" }}>{selected.message}</p>
              {selected.nice_moment && (
                <div className="p-4 rounded-xl mb-4 text-right" style={{ background: "var(--amber-light)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--amber-dark)" }}>✨ موقف حلو حصل</p>
                  <p className="text-sm" style={{ color: "var(--slate-700)" }}>{selected.nice_moment}</p>
                </div>
              )}
              {selected.image_url && (
                <img src={selected.image_url} alt="" className="w-full max-h-56 object-cover rounded-xl mb-5 border border-[var(--slate-100)]" />
              )}
              <div className="flex items-center justify-center pt-4 border-t border-[var(--slate-100)]">
                <span className="text-xs" style={{ color: "var(--slate-400)" }}>{fmt(selected.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
