"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const avatarColors = [
  "#e89b2d",
  "#059669",
  "#0f2b46",
  "#e74c3c",
  "#8e44ad",
  "#2980b9",
  "#16a085",
  "#d35400",
  "#27ae60",
  "#c0392b",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name.substring(0, 2);
}

function getColorByName(name: string): string {
  return avatarColors[hashCode(name) % avatarColors.length];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MemoriesPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);

  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    if (!loading && memories.length > 0) {
      memories.forEach((_, i) => {
        setTimeout(() => {
          setVisibleCards((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * 80);
      });
    }
  }, [loading, memories]);

  async function fetchMemories() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/memories?limit=100");
      if (!res.ok) throw new Error("Failed to load memories");
      const data = await res.json();
      setMemories(Array.isArray(data) ? data : data.memories || []);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const filteredMemories = useMemo(() => {
    if (!search.trim()) return memories;
    const q = search.trim().toLowerCase();
    return memories.filter(
      (m) =>
        m.message.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q)
    );
  }, [memories, search]);

  const showSearch = memories.length > 3;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cream)" }}>
        <div className="blob-blue blob-orange" />
        <div className="pattern-dots" />
        <div className="text-center z-10 relative">
          <div className="spinner mx-auto mb-4" style={{ width: 48, height: 48 }} />
          <p style={{ color: "var(--blue-dark)", fontFamily: "var(--font-body)" }}>
            جاري تحميل الذكريات...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cream)" }}>
        <div className="blob-blue blob-orange" />
        <div className="pattern-dots" />
        <div className="text-center z-10 relative">
          <div className="text-6xl mb-4">😵</div>
          <p style={{ color: "var(--blue-dark)", fontFamily: "var(--font-body)" }} className="text-lg mb-4">
            {error}
          </p>
          <button onClick={fetchMemories} className="btn btn-primary">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--cream)" }}>
      <div className="blob-blue" />
      <div className="blob-orange" />
      <div className="pattern-dots" />

      <header
        className="glass sticky top-0 z-40"
        style={{
          borderBottom: "1px solid rgba(15,43,70,0.08)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="btn btn-ghost text-sm"
            style={{ color: "var(--blue-dark)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            الرئيسية
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/random")}
              className="btn btn-accent text-sm"
            >
              فاجئني
            </button>
            <button
              onClick={() => router.push("/write")}
              className="btn btn-primary text-sm"
            >
              اكتب
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: "var(--blue-dark)", fontFamily: "var(--font-heading)" }}
          >
            كل الذكريات
          </h1>
          <p style={{ color: "var(--orange-warm)" }} className="text-lg">
            {memories.length} ذكرى محفوظة
          </p>
        </div>

        {showSearch && (
          <div className="max-w-md mx-auto mb-10 relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--blue-dark)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="input w-full"
              placeholder="ابحث في الذكريات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40, paddingRight: 44 }}
            />
          </div>
        )}

        {memories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📖</div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--blue-dark)", fontFamily: "var(--font-heading)" }}
            >
              لسه أول صفحة
            </h2>
            <p style={{ color: "var(--blue-dark)", opacity: 0.6 }} className="mb-6">
              كن أول من يكتب ذكرى في هذا الكتاب
            </p>
            <Link href="/write" className="btn btn-primary">
              اكتب ذكرتك الأولى
            </Link>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--blue-dark)", fontFamily: "var(--font-heading)" }}
            >
              لا توجد نتائج
            </h2>
            <p style={{ color: "var(--blue-dark)", opacity: 0.6 }}>
              جرّب كلمات مختلفة
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMemories.map((memory, i) => (
              <div
                key={memory.id}
                className="card card-hover cursor-pointer"
                style={{
                  opacity: visibleCards[i] ? 1 : 0,
                  transform: visibleCards[i] ? "translateY(0)" : "translateY(24px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
                onClick={() => setSelectedMemory(memory)}
              >
                <div className="relative p-6">
                  <div
                    className="absolute top-3 left-4 text-7xl font-bold leading-none select-none pointer-events-none"
                    style={{ color: "var(--orange-warm)", opacity: 0.15, fontFamily: "Georgia, serif" }}
                  >
                    "
                  </div>
                  <p
                    className="text-lg leading-relaxed mb-4 relative z-10"
                    style={{ color: "var(--blue-dark)", fontFamily: "var(--font-body)" }}
                  >
                    {memory.message}
                  </p>
                  {memory.image_url && (
                    <img
                      src={memory.image_url}
                      alt=""
                      className="w-full rounded-xl border-2 mb-4 object-cover"
                      style={{
                        borderColor: "rgba(15,43,70,0.08)",
                        maxHeight: 240,
                      }}
                    />
                  )}
                  <div
                    className="flex items-center gap-3 pt-3"
                    style={{ borderTop: "1px solid rgba(15,43,70,0.08)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: getColorByName(memory.name) }}
                    >
                      {getInitials(memory.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--blue-dark)" }}
                      >
                        {memory.name}
                      </p>
                      {memory.university && (
                        <p className="text-xs truncate" style={{ color: "var(--blue-dark)", opacity: 0.5 }}>
                          {memory.university}
                        </p>
                      )}
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "var(--blue-dark)", opacity: 0.4 }}>
                      {formatDate(memory.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(15,43,70,0.6)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setSelectedMemory(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{ backgroundColor: "var(--cream)", color: "var(--blue-dark)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">❤️</div>
              <div
                className="text-6xl font-bold mb-2 leading-none"
                style={{ color: "var(--orange-warm)", opacity: 0.2, fontFamily: "Georgia, serif" }}
              >
                "
              </div>
              <p
                className="text-xl leading-relaxed mb-6"
                style={{ color: "var(--blue-dark)", fontFamily: "var(--font-body)" }}
              >
                {selectedMemory.message}
              </p>
              {selectedMemory.image_url && (
                <img
                  src={selectedMemory.image_url}
                  alt=""
                  className="w-full rounded-xl border-2 mb-6 object-cover"
                  style={{ borderColor: "rgba(15,43,70,0.08)" }}
                />
              )}
              <div
                className="flex items-center justify-center gap-3 pt-6"
                style={{ borderTop: "1px solid rgba(15,43,70,0.08)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: getColorByName(selectedMemory.name) }}
                >
                  {getInitials(selectedMemory.name)}
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: "var(--blue-dark)" }}>
                    {selectedMemory.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--blue-dark)", opacity: 0.5 }}>
                    {selectedMemory.university && `${selectedMemory.university} · `}
                    {formatDate(selectedMemory.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
