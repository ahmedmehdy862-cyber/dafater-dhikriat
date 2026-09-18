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
  is_favorite: boolean;
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [randomMemory, setRandomMemory] = useState<Memory | null>(null);
  const [showRandom, setShowRandom] = useState(false);
  const [randomAnimating, setRandomAnimating] = useState(false);

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/memories");
      if (!res.ok) throw new Error("فشل تحميل الذكريات");
      const data = await res.json();
      setMemories(data.memories || []);
    } catch {
      setError("حصل مشكلة في تحميل الذكريات، حاول تاني");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  function showRandomHandler() {
    if (memories.length === 0) return;
    setRandomAnimating(true);
    const idx = Math.floor(Math.random() * memories.length);
    setRandomMemory(memories[idx]);
    setShowRandom(true);
  }

  function closeRandom() {
    setRandomAnimating(true);
    setTimeout(() => {
      setShowRandom(false);
      setRandomMemory(null);
      setRandomAnimating(false);
    }, 200);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return parts[0].substring(0, 2);
  }

  const avatarColors = [
    "#123B5D", "#E9A23B", "#1a5a8a", "#c7842a",
    "#2d6a8f", "#d4943b", "#0f2e47", "#b8842e",
  ];

  function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }

  return (
    <main className="min-h-screen paper-bg" style={{ background: "linear-gradient(180deg, var(--cream) 0%, var(--cream-dark) 100%)" }}>
      <style jsx>{`
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.2); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.1); }
        }
      `}</style>

      {/* Sticky Header */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: "rgba(255,248,237,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(18,59,93,0.08)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--blue-dark)" }}
          >
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرئيسية
          </Link>
          <h1 className="text-lg font-bold" style={{ color: "var(--blue-dark)" }}>
            دفتر الذكريات
          </h1>
          <Link
            href="/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "var(--orange-warm)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            اكتب
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        {!loading && !error && memories.length > 0 && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--blue-dark)" }}>
              الكلمات اللي اتكتبت من القلب
            </h2>
            <p className="text-sm" style={{ color: "var(--gray-500)" }}>
              {memories.length} ذكرى في الدفتر ❤️
            </p>
          </div>
        )}

        {/* Random memory button */}
        {!loading && !error && memories.length > 0 && (
          <div className="text-center mb-8 animate-fade-in">
            <button
              onClick={showRandomHandler}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--orange-warm), #d8922e)",
              }}
            >
              <span style={{ animation: "heartPulse 2s ease-in-out infinite" }}>❤️</span>
              <span>فاجئني بذكرى</span>
            </button>
          </div>
        )}

        {/* Random memory modal */}
        {showRandom && randomMemory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              animation: "overlayIn 0.2s ease",
              opacity: randomAnimating ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
            onClick={closeRandom}
          >
            <div
              className="relative max-w-md w-full rounded-3xl shadow-2xl p-8 animate-page-flip"
              style={{
                background: "linear-gradient(180deg, var(--cream) 0%, #fdf5e6 100%)",
                backgroundImage: `
                  radial-gradient(circle at 25px 25px, rgba(18, 59, 93, 0.02) 2%, transparent 0%),
                  radial-gradient(circle at 75px 75px, rgba(18, 59, 93, 0.02) 2%, transparent 0%),
                  linear-gradient(180deg, var(--cream) 0%, #fdf5e6 100%)
                `,
                backgroundSize: "100px 100px, 100px 100px, 100% 100%",
                border: "1px solid rgba(18,59,93,0.06)",
                animation: randomAnimating
                  ? "none"
                  : "modalIn 0.3s ease forwards",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeRandom}
                className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: "rgba(18,59,93,0.08)",
                  color: "var(--gray-500)",
                }}
                aria-label="إغلاق"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Heart decoration */}
              <div className="text-center mb-5">
                <span
                  className="inline-block text-5xl"
                  style={{ animation: "floatHeart 3s ease-in-out infinite" }}
                >
                  ❤️
                </span>
              </div>

              {/* Quote decoration */}
              <div
                className="text-center mb-1"
                style={{ color: "var(--orange-warm)", fontSize: "48px", lineHeight: "1", opacity: 0.4, fontFamily: "Georgia, serif" }}
              >
                &ldquo;
              </div>

              {/* Message */}
              <blockquote
                className="text-center text-lg leading-relaxed mb-6"
                style={{ color: "var(--text-dark)", fontFamily: "Georgia, serif" }}
              >
                {randomMemory.message}
              </blockquote>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-px flex-1" style={{ background: "rgba(18,59,93,0.08)" }} />
                <span className="text-xs" style={{ color: "var(--gray-400)" }}>✦</span>
                <div className="h-px flex-1" style={{ background: "rgba(18,59,93,0.08)" }} />
              </div>

              {/* Author */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: getAvatarColor(randomMemory.name) }}
                  >
                    {getInitials(randomMemory.name)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--blue-dark)" }}>
                      {randomMemory.name}
                    </p>
                    {randomMemory.university && (
                      <p className="text-xs" style={{ color: "var(--gray-500)" }}>
                        {randomMemory.university}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--gray-400)" }}>
                  {formatDate(randomMemory.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-5" style={{ width: "32px", height: "32px", borderWidth: "4px" }} />
            <p className="text-sm font-medium" style={{ color: "var(--gray-500)" }}>
              جاري تحميل الذكريات...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-20">
            <div
              className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-5"
              style={{ background: "rgba(220,38,38,0.08)" }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-base font-medium mb-2" style={{ color: "var(--text-dark)" }}>
              {error}
            </p>
            <button
              onClick={fetchMemories}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "var(--blue-dark)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              حاول تاني
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && memories.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="mb-8">
              <div
                className="inline-block w-28 h-36 rounded-xl flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, var(--blue-dark), #1a4f7a)",
                  boxShadow: "0 20px 40px rgba(18,59,93,0.2)",
                  animation: "bookFloat 4s ease-in-out infinite",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-y-0 left-0 w-[2px] opacity-20" style={{ background: "var(--orange-warm)" }} />
                  <div className="text-center px-4">
                    <svg className="w-10 h-10 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <div className="w-12 h-0.5 mx-auto rounded-full opacity-30" style={{ background: "var(--orange-warm)" }} />
                  </div>
                </div>
                <div className="absolute top-2 right-2 bottom-2 w-1 rounded-full opacity-10" style={{ background: "white" }} />
              </div>
            </div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--blue-dark)" }}
            >
              لسه أول صفحة…
            </h2>
            <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: "var(--gray-500)" }}>
              مستنيين كلمتك تكون البداية
            </p>
            <Link
              href="/write"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ background: "linear-gradient(135deg, var(--blue-dark), #1a5a8a)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              اكتب أول ذكرى
            </Link>
          </div>
        )}

        {/* Memories grid */}
        {!loading && !error && memories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {memories.map((memory, idx) => (
              <div
                key={memory.id}
                className="rounded-2xl p-6 card-hover animate-fade-in"
                style={{
                  background: "white",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(18,59,93,0.06)",
                  animationDelay: `${idx * 0.08}s`,
                }}
              >
                {/* Quote mark */}
                <div
                  className="mb-3 select-none"
                  style={{
                    color: "var(--orange-warm)",
                    fontSize: "36px",
                    lineHeight: "1",
                    opacity: 0.35,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  &ldquo;
                </div>

                {/* Message */}
                <p
                  className="leading-relaxed mb-4 text-[15px]"
                  style={{ color: "var(--text-dark)" }}
                >
                  {memory.message}
                </p>

                {/* Image */}
                {memory.image_url && (
                  <div className="mb-4">
                    <img
                      src={memory.image_url}
                      alt={`صورة من ${memory.name}`}
                      className="w-full h-48 object-cover rounded-xl"
                      style={{ border: "1px solid rgba(0,0,0,0.04)" }}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Author footer */}
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: "1px solid rgba(18,59,93,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: getAvatarColor(memory.name) }}
                    >
                      {getInitials(memory.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--blue-dark)" }}>
                        {memory.name}
                      </p>
                      {memory.university && (
                        <p className="text-xs" style={{ color: "var(--gray-500)" }}>
                          {memory.university}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {memory.is_favorite && (
                      <span style={{ animation: "heartPulse 2s ease-in-out infinite", fontSize: "14px" }}>
                        ❤️
                      </span>
                    )}
                    <p className="text-xs" style={{ color: "var(--gray-400)" }}>
                      {formatDate(memory.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
