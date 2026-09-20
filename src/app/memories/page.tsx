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
  show_name: boolean;
  show_nice_moment: boolean;
  show_image: boolean;
  is_public: boolean;
  is_favorite: boolean;
}

const fmt = (d: string) => new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
const fmtShort = (d: string) => new Date(d).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [showCover, setShowCover] = useState(true);

  const fetchM = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/memories?limit=100");
      if (!r.ok) throw new Error("فشل التحميل");
      const d = await r.json();
      setMemories(d.memories || []);
    } catch {
      setError("حصل مشكلة، حاول تاني");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchM();
  }, [fetchM]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showCover) {
        if (e.key === "Enter" || e.key === " ") openNotebook();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (flipping) return;
        if (e.key === "ArrowRight" && current > 0) goPrev();
        if (e.key === "ArrowLeft" && current < memories.length - 1) goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const openNotebook = () => {
    setShowCover(false);
    setCurrent(0);
  };

  const goNext = () => {
    if (current >= memories.length - 1 || flipping) return;
    setFlipping("next");
    setTimeout(() => {
      setCurrent((p) => p + 1);
      setFlipping(null);
    }, 500);
  };

  const goPrev = () => {
    if (current <= 0 || flipping) return;
    setFlipping("prev");
    setTimeout(() => {
      setCurrent((p) => p - 1);
      setFlipping(null);
    }, 500);
  };

  if (loading) {
    return (
      <div className="notebook-bg flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="book-loader" />
          <p style={{ color: "#8b7355", fontFamily: "Georgia, serif" }}>جاري فتح الدفتر...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notebook-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: "#8b7355" }}>{error}</p>
          <button onClick={fetchM} className="btn btn-outline">حاول تاني</button>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="notebook-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#5c4a3a", fontFamily: "Georgia, serif" }}>
            الدفتر فاضي
          </h2>
          <p className="text-sm mb-6" style={{ color: "#8b7355" }}>كن أول من يكتب ذكرى في هذا الدفتر</p>
          <Link href="/write" className="btn btn-primary btn-lg">اكتب ذكرتك</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-bg min-h-screen overflow-hidden">
      {showCover ? (
        <div className="cover-container">
          <div className="cover">
            <div className="cover-decoration cover-decoration-1" />
            <div className="cover-decoration cover-decoration-2" />
            <div className="cover-binding" />

            <div className="cover-content">
              <div className="cover-ornament">&#10053;</div>
              <h1 className="cover-title">دفتر الذكريات</h1>
              <div className="cover-line" />
              <p className="cover-subtitle">
                {memories.length === 1
                  ? "ذكرى واحدة جميلة"
                  : `${memories.length} ذكرى جميلة`}
              </p>
              <div className="cover-ornament">&#10053;</div>

              <button onClick={openNotebook} className="btn btn-lg cover-btn">
                افتح الدفتر
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top nav */}
          <div className="sticky top-0 z-40 notebook-nav">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="btn btn-ghost btn-sm" style={{ color: "#5c4a3a" }}>
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                الرئيسية
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCover(true)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "#5c4a3a" }}
                >
                  📖 الغلاف
                </button>
                <Link href="/write" className="btn btn-primary btn-sm">✏️ اكتب</Link>
              </div>
            </div>
          </div>

          {/* Book area */}
          <div className="book-area">
            {/* Page shadow */}
            <div className="book-shadow" />

            {/* The notebook */}
            <div className="notebook">
              <div className="notebook-spine" />

              {/* Previous page (visible behind) */}
              <div className={`page page-back ${flipping === "next" ? "flip-out" : ""}`}>
                {current > 0 && (
                  <div className="page-content" key={`prev-${current}`}>
                    <PageContent m={memories[current - 1]} />
                  </div>
                )}
              </div>

              {/* Current page */}
              <div className={`page page-front ${flipping === "next" ? "flip-in-next" : flipping === "prev" ? "flip-in-prev" : ""}`}>
                <div className="page-content" key={`curr-${current}`}>
                  <div className="page-header">
                    <span className="page-number">{current + 1} / {memories.length}</span>
                    <span className="page-date">{fmt(memories[current].created_at)}</span>
                  </div>
                  <PageContent m={memories[current]} />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="nav-buttons">
              <button
                onClick={goPrev}
                disabled={current <= 0 || !!flipping}
                className="nav-btn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <div className="page-dots">
                {memories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (flipping || i === current) return;
                      setFlipping(i > current ? "next" : "prev");
                      setTimeout(() => {
                        setCurrent(i);
                        setFlipping(null);
                      }, 500);
                    }}
                    className={`page-dot ${i === current ? "active" : ""}`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={current >= memories.length - 1 || !!flipping}
                className="nav-btn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>

            {/* Page corners */}
            <div className="page-corner page-corner-right" onClick={goNext} />
          </div>
        </>
      )}
    </div>
  );
}

function PageContent({ m }: { m: Memory }) {
  return (
    <div className="page-text">
      {m.show_name && (
        <p className="page-author" style={{ fontFamily: "Georgia, serif" }}>
          ~ {m.name} ~
        </p>
      )}

      <div className="page-quote">&ldquo;</div>

      <p className="page-message">{m.message}</p>

      {m.nice_moment && m.show_nice_moment && (
        <div className="page-moment">
          <p className="page-moment-label">&#10024; موقف حلو</p>
          <p className="page-moment-text">{m.nice_moment}</p>
        </div>
      )}

      {m.image_url && m.show_image && (
        <img
          src={m.image_url}
          alt=""
          className="page-image"
        />
      )}

      <div className="page-footer">
        <span className="page-line" />
      </div>
    </div>
  );
}
