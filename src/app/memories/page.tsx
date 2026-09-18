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
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [randomMemory, setRandomMemory] = useState<Memory | null>(null);
  const [showRandom, setShowRandom] = useState(false);

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
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
    const idx = Math.floor(Math.random() * memories.length);
    setRandomMemory(memories[idx]);
    setShowRandom(true);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <main className="min-h-screen paper-bg">
      {/* Header */}
      <div className="bg-[var(--blue-dark)] text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 text-sm"
          >
            <svg
              className="w-4 h-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
            الرجوع للرئيسية
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">دفتر الذكريات</h1>
          <p className="text-white/70 mt-1">
            الكلمات اللي اتكتبت من القلب ❤️
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Random memory button */}
        {memories.length > 0 && (
          <div className="text-center mb-8">
            <button
              onClick={showRandomHandler}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--orange-warm)] text-white font-semibold shadow-md hover:shadow-lg hover:bg-[#d8922e] transition-all duration-300"
            >
              <span>فاجئني بذكرى</span>
              <span>❤️</span>
            </button>
          </div>
        )}

        {/* Random memory modal */}
        {showRandom && randomMemory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowRandom(false)}
          >
            <div
              className="bg-[var(--cream)] rounded-2xl shadow-2xl max-w-md w-full p-8 animate-page-flip relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRandom(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[var(--gray-200)] flex items-center justify-center text-[var(--gray-500)] hover:bg-[var(--gray-300)] transition-colors"
                aria-label="إغلاق"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-4xl">❤️</span>
              </div>

              <blockquote className="text-lg text-[var(--text-dark)] leading-relaxed mb-6 text-center italic">
                &ldquo;{randomMemory.message}&rdquo;
              </blockquote>

              <div className="text-center">
                <p className="font-semibold text-[var(--blue-dark)]">
                  {randomMemory.name}
                </p>
                {randomMemory.university && (
                  <p className="text-sm text-[var(--gray-500)]">
                    {randomMemory.university}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-4" />
            <p className="text-[var(--gray-500)]">جاري تحميل الذكريات...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchMemories}
              className="px-6 py-2 rounded-xl bg-[var(--blue-dark)] text-white hover:bg-[var(--blue-light)] transition-colors"
            >
              حاول تاني
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && memories.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="inline-block w-20 h-24 rounded-lg bg-[var(--blue-dark)] opacity-10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-[var(--blue-dark)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-[var(--blue-dark)] mb-2">
              لسه أول صفحة…
            </h2>
            <p className="text-[var(--gray-500)] mb-6">
              مستنيين كلمتك تكون البداية.
            </p>
            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--blue-dark)] text-white font-semibold hover:bg-[var(--blue-light)] transition-colors"
            >
              اكتب أول ذكرى
            </Link>
          </div>
        )}

        {/* Memories grid */}
        {!loading && !error && memories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memories.map((memory, idx) => (
              <div
                key={memory.id}
                className="bg-white rounded-2xl shadow-md border border-[var(--gray-200)] p-6 card-hover animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Quote mark */}
                <div className="text-[var(--orange-warm)] text-3xl font-bold mb-2 opacity-50">
                  &ldquo;
                </div>

                {/* Message */}
                <p className="text-[var(--text-dark)] leading-relaxed mb-4 text-[15px]">
                  {memory.message}
                </p>

                {/* Image */}
                {memory.image_url && (
                  <div className="mb-4">
                    <img
                      src={memory.image_url}
                      alt={`صورة من ${memory.name}`}
                      className="w-full h-48 object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--gray-100)]">
                  <div>
                    <p className="font-semibold text-[var(--blue-dark)] text-sm">
                      {memory.name}
                    </p>
                    {memory.university && (
                      <p className="text-xs text-[var(--gray-500)]">
                        {memory.university}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-[var(--gray-400)]">
                    {formatDate(memory.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
