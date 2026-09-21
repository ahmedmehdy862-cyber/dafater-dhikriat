"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MemoryCard, type MemoryCardData, type MemoryVariant } from "@/components/memory-card";

const COLORS = ["#1e293b", "#3b82f6", "#059669", "#7c3aed", "#dc2626", "#d97706", "#0891b2", "#c026d3"];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
};

const colorFor = (name: string) => COLORS[hash(name) % COLORS.length];

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
};

function variantFor(m: MemoryCardData): MemoryVariant {
  const kinds: MemoryVariant[] = ["quote", "text", "polaroid", "image"];
  let k = kinds[hash(m.id) % kinds.length];
  const hasImg = !!m.image_url && m.show_image !== false;
  if ((k === "polaroid" || k === "image") && !hasImg) k = "text";
  return k;
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MemoryCardData | null>(null);

  const loadMemories = useCallback(async (showSpinner?: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      const r = await fetch("/api/memories?limit=100");
      if (!r.ok) throw new Error("fail");
      const d = await r.json();
      setMemories(d.memories || []);
    } catch {
      setError("حصلت مشكلة، حاول تاني");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/memories?limit=100");
        if (!r.ok) throw new Error("fail");
        const d = await r.json();
        if (!cancelled) setMemories(d.memories || []);
      } catch {
        if (!cancelled) setError("حصلت مشكلة، حاول تاني");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return memories;
    return memories.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q) ||
        (m.nice_moment || "").toLowerCase().includes(q)
    );
  }, [memories, search]);

  const stats = useMemo(() => {
    const people = new Set(memories.map((m) => m.name.trim()).filter(Boolean)).size;
    const last = memories.length ? memories[0].created_at : null;
    return { total: memories.length, people, last };
  }, [memories]);

  function openRandom(scope: MemoryCardData[] = filtered) {
    if (!scope.length) return;
    setSelected(scope[Math.floor(Math.random() * scope.length)]);
  }

  if (loading) {
    return (
      <main className="mem-page mem-center">
        <div className="book-loader" />
        <p className="mem-loading-text">جاري فتح الدفتر...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mem-page mem-center">
        <p className="wiz-error">{error}</p>
        <button onClick={() => loadMemories(true)} className="btn btn-outline">حاول تاني</button>
      </main>
    );
  }

  return (
    <main className="mem-page">
      <header className="mem-nav">
        <div className="mem-nav-inner">
          <Link href="/" className="wiz-nav-link">
            <svg className="rtl-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرئيسية
          </Link>
          <Link href="/write" className="btn btn-primary btn-sm">اكتب ذكريتك &#129525;</Link>
        </div>
      </header>

      <section className="mem-hero">
        <span className="mem-eyebrow">دفتر الذكريات</span>
        <h1 className="mem-title">
          كل كلمة هنا...
          <br />
          جزء من الحكاية.
        </h1>
        {memories.length > 0 && (
          <div className="mem-stats">
            <span className="mem-stat-chip">
              <b>{stats.total}</b> ذكرى
            </span>
            <span className="mem-stat-chip">
              <b>{stats.people}</b> مساهم
            </span>
            {stats.last && (
              <span className="mem-stat-chip mem-stat-last">آخر ذكرى: {fmtDate(stats.last)}</span>
            )}
          </div>
        )}

        <div className="mem-actions">
          <button
            onClick={() => openRandom()}
            disabled={!filtered.length}
            className="btn btn-amber btn-lg mem-random"
          >
            افتح ذكرى عشوائية 🎲
          </button>
          <label className="mem-search">
            <svg className="mem-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الذكريات..."
              className="mem-search-input"
            />
          </label>
        </div>
      </section>

      {memories.length === 0 ? (
        <section className="mem-empty">
          <div className="mem-empty-paper">&#127873;</div>
          <h2 className="mem-empty-title">لسه أول صفحة في الدفتر فاضية...</h2>
          <p className="mem-empty-sub">يمكن تكون أنت أول حد يسيب فيها ذكرى.</p>
          <Link href="/write" className="btn btn-primary btn-lg">اكتب أول ذكرى</Link>
        </section>
      ) : filtered.length === 0 ? (
        <section className="mem-empty">
          <p className="mem-empty-sub">مفيش نتائج تنطبق على بحثك.</p>
          <button onClick={() => setSearch("")} className="btn btn-outline">امسح البحث</button>
        </section>
      ) : (
        <section className="mem-grid">
          {filtered.map((m) => (
            <MemoryCard
              key={m.id}
              m={m}
              variant={variantFor(m)}
              onOpen={() => setSelected(m)}
            />
          ))}
        </section>
      )}

      {selected && (
        <div className="mem-modal" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className="mem-modal-backdrop" />
          <div className="mem-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="mem-close" onClick={() => setSelected(null)} aria-label="إغلاق">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mem-dialog-scroll">
              {selected.image_url && selected.show_image !== false && (
                <img src={selected.image_url} alt={selected.show_name ? `صورة من ${selected.name}` : "صورة من الذكرى"} className="mem-dialog-img" />
              )}

              <div className="mem-dialog-body">
                <div className="mem-dialog-quote">&rdquo;</div>
                <p className="mem-dialog-message">{selected.message}</p>

                {selected.nice_moment && selected.show_nice_moment !== false && (
                  <div className="m-card-moment">
                    <span className="m-moment-tag">&#10024; موقف حلو</span>
                    <p>{selected.nice_moment}</p>
                  </div>
                )}

                <div className="mem-dialog-footer">
                  {selected.show_name && selected.name && (
                    <span className="mem-dialog-name" style={{ color: colorFor(selected.name) || undefined }}>
                      — {selected.name}
                    </span>
                  )}
                  <span className="mem-dialog-date">{fmtDate(selected.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="mem-dialog-actions">
              <button onClick={() => openRandom()} className="btn btn-amber btn-sm">ذكرى تانية 🎲</button>
              <Link href="/write" className="btn btn-primary btn-sm">سيب ذكريتك 🤍</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}