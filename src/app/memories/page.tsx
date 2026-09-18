"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Memory {
  id: string;
  name: string;
  university: string | null;
  message: string;
  image_url: string | null;
  created_at: string;
  is_public: boolean;
  is_favorite: boolean;
}

const AVATAR_COLORS = ["#123B5D", "#E9A23B", "#2d6a4f", "#7b2cbf", "#e63946", "#457b9d", "#f4a261", "#264653"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/memories?limit=100");
      if (!res.ok) throw new Error("فشل التحميل");
      const data = await res.json();
      setMemories(data.memories || []);
    } catch {
      setError("حصل مشكلة، حاول تاني");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  const filtered = memories.filter((m) =>
    !searchQuery || m.name.includes(searchQuery) || m.message.includes(searchQuery)
  );

  function pickRandom() {
    if (memories.length === 0) return;
    setSelectedMemory(memories[Math.floor(Math.random() * memories.length)]);
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--cream)" }}>
      <style jsx>{`
        @keyframes cardEnter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--blue-dark)" }}>
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرئيسية
          </Link>
          <div className="flex items-center gap-3">
            {memories.length > 0 && (
              <button onClick={pickRandom} className="btn btn-accent text-sm px-4 py-2">
                🎲 فاجئني
              </button>
            )}
            <Link href="/write" className="btn btn-primary text-sm px-4 py-2">
              ✏️ اكتب
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ color: "var(--text-dark)" }}>كل الذكريات</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{memories.length} ذكرى اتجمعت في الدفتر</p>
        </div>

        {/* Search */}
        {memories.length > 3 && (
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-light)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو المحتوى..."
                className="input-field pr-11"
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>جاري تحميل الذكريات...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">😵</div>
            <p className="text-sm mb-4" style={{ color: "var(--danger)" }}>{error}</p>
            <button onClick={fetchMemories} className="btn btn-secondary">حاول تاني</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && memories.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "var(--blue-light)" }}>
              <span className="text-3xl">📖</span>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>لسه أول صفحة</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>مستنيين كلمتك تكون البداية</p>
            <Link href="/write" className="btn btn-primary">اكتب ذكريتك الآن</Link>
          </div>
        )}

        {/* Memory Cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m, i) => (
              <div
                key={m.id}
                className="card card-interactive p-5 cursor-pointer"
                style={{ animation: `cardEnter 0.4s ease forwards`, animationDelay: `${i * 0.05}s`, opacity: 0 }}
                onClick={() => setSelectedMemory(m)}
              >
                {/* Quote mark */}
                <div className="text-3xl font-bold mb-2 leading-none select-none" style={{ color: "var(--orange-warm)", opacity: 0.3, fontFamily: "Georgia, serif" }}>&quot;</div>

                {/* Message */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-dark)", lineHeight: 1.8 }}>
                  {m.message}
                </p>

                {/* Image */}
                {m.image_url && (
                  <div className="mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-light)" }}>
                    <img src={m.image_url} alt={`صورة من ${m.name}`} className="w-full h-40 object-cover" />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: getAvatarColor(m.name) }}
                    >
                      {getInitials(m.name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--text-dark)" }}>{m.name}</p>
                      {m.university && (
                        <p className="text-xs" style={{ color: "var(--text-light)" }}>{m.university}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-light)" }}>{formatDate(m.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && memories.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>مفيش نتائج للبحث</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ animation: "overlayIn 0.2s ease" }}
          onClick={() => setSelectedMemory(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6"
            style={{ background: "var(--white)", boxShadow: "var(--shadow-2xl)", animation: "modalIn 0.3s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "var(--cream)" }}
              aria-label="إغلاق"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Heart */}
            <div className="text-center mb-4">
              <span className="text-3xl">❤️</span>
            </div>

            {/* Quote */}
            <div className="text-4xl font-bold text-center mb-2 select-none" style={{ color: "var(--orange-warm)", opacity: 0.2, fontFamily: "Georgia, serif" }}>&quot;</div>

            {/* Message */}
            <p className="text-base leading-loose text-center mb-6" style={{ color: "var(--text-dark)", lineHeight: 2 }}>
              {selectedMemory.message}
            </p>

            {/* Image */}
            {selectedMemory.image_url && (
              <div className="mb-6 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-light)" }}>
                <img src={selectedMemory.image_url} alt={`صورة من ${selectedMemory.name}`} className="w-full max-h-64 object-cover" />
              </div>
            )}

            {/* Author */}
            <div className="flex items-center justify-center gap-3 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: getAvatarColor(selectedMemory.name) }}
              >
                {getInitials(selectedMemory.name)}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: "var(--text-dark)" }}>{selectedMemory.name}</p>
                {selectedMemory.university && (
                  <p className="text-xs" style={{ color: "var(--text-light)" }}>{selectedMemory.university}</p>
                )}
              </div>
              <span className="text-xs mr-auto" style={{ color: "var(--text-light)" }}>{formatDate(selectedMemory.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
