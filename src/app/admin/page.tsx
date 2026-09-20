"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Memory {
  id: string;
  name: string;
  message: string;
  nice_moment: string | null;
  image_url: string | null;
  status: string;
  show_name: boolean;
  show_nice_moment: boolean;
  show_image: boolean;
  is_public: boolean;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "قيد المراجعة", color: "#92400e", bg: "#fef3c7" },
  approved: { label: "مقبول", color: "#065f46", bg: "#d1fae5" },
  hidden: { label: "مخفي", color: "#475569", bg: "#f1f5f9" },
};

const FILTER_TABS = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "approved", label: "مقبول" },
  { key: "hidden", label: "مخفي" },
];

function Toggle({ checked, on, disabled }: { checked: boolean; on: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={on}
      disabled={disabled}
      style={{
        width: "40px",
        height: "22px",
        borderRadius: "11px",
        background: checked ? "#22c55e" : "#cbd5e1",
        position: "relative",
        transition: "background 0.2s",
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        padding: 0,
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          right: checked ? "21px" : "3px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "white",
          transition: "right 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getToken = useCallback(() => {
    return localStorage.getItem("admin_token");
  }, []);

  const fetchMemories = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/admin/memories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const list: Memory[] = Array.isArray(data) ? data : data.memories || [];
      setMemories(list);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchMemories();
  }, [fetchMemories, getToken, router]);

  const updateStatus = async (id: string, status: string) => {
    const token = getToken();
    if (!token) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to update");

      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    } catch {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setActionLoading(null);
    }
  };

  const updateField = async (id: string, field: string, value: boolean) => {
    const token = getToken();
    if (!token) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to update");

      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
      );
    } catch {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMemory = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    const token = getToken();
    if (!token) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to delete");

      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const filtered =
    activeFilter === "all"
      ? memories
      : memories.filter((m) => m.status === activeFilter);

  const stats = {
    total: memories.length,
    pending: memories.filter((m) => m.status === "pending").length,
    approved: memories.filter((m) => m.status === "approved").length,
    hidden: memories.filter((m) => m.status === "hidden").length,
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8fafc", fontFamily: "Inter, Cairo, sans-serif" }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "#f8fafc", fontFamily: "Inter, Cairo, sans-serif", direction: "rtl" }}
    >
      <header
        className="sticky top-0 z-30"
        style={{ background: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-lg sm:text-2xl font-bold">لوحة التحكم</h1>
            <span
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
            >
              {memories.length} ذكرى
            </span>
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: "white" }}>
            خروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: "الإجمالي", value: stats.total, border: "#0f172a", bg: "#f1f5f9", color: "#0f172a" },
            { label: "قيد المراجعة", value: stats.pending, border: "#f59e0b", bg: "#fefce8", color: "#92400e" },
            { label: "مقبول", value: stats.approved, border: "#22c55e", bg: "#f0fdf4", color: "#065f46" },
            { label: "مخفي", value: stats.hidden, border: "#94a3b8", bg: "#f8fafc", color: "#475569" },
          ].map((s) => (
            <div
              key={s.label}
              className="card p-3 sm:p-5"
              style={{ background: s.bg, borderRight: `4px solid ${s.border}` }}
            >
              <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs sm:text-sm" style={{ color: s.color, opacity: 0.7 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`btn btn-sm whitespace-nowrap ${
                activeFilter === tab.key ? "btn-primary" : "btn-outline"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center" style={{ color: "#64748b" }}>
            لا توجد ذكريات حالياً
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {filtered.map((m) => {
              const statusInfo = STATUS_MAP[m.status] || STATUS_MAP.pending;
              const isBusy = actionLoading === m.id;
              return (
                <div
                  key={m.id}
                  className="card p-4 sm:p-5"
                  style={{ borderRight: `4px solid ${statusInfo.color}` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
                      style={{ background: statusInfo.bg, color: statusInfo.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: statusInfo.color }} />
                      {statusInfo.label}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "#94a3b8" }}>
                      {new Date(m.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base mb-2" style={{ color: "#0f172a" }}>
                    {m.name}
                  </h3>

                  <p className="text-sm mb-2 leading-relaxed" style={{ color: "#475569" }}>
                    {m.message}
                  </p>

                  {m.nice_moment && (
                    <div
                      className="text-xs p-3 rounded-lg mb-3"
                      style={{ background: "#f1f5f9", color: "#64748b" }}
                    >
                      {m.nice_moment}
                    </div>
                  )}

                  {m.image_url && (
                    <img src={m.image_url} alt={m.name} className="w-20 h-20 object-cover rounded-lg mb-3" />
                  )}

                  <div
                    className="flex flex-col gap-3 pt-3 border-t"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-xs font-medium" style={{ color: "#64748b" }}>
                        إظهار:
                      </span>
                      {[
                        { label: "الاسم", field: "show_name", val: m.show_name },
                        { label: "الموقف", field: "show_nice_moment", val: m.show_nice_moment },
                        { label: "الصورة", field: "show_image", val: m.show_image },
                      ].map((t) => (
                        <label
                          key={t.field}
                          className="flex items-center gap-2 text-xs select-none"
                          style={{ color: "#475569" }}
                        >
                          <Toggle
                            checked={t.val}
                            on={() => updateField(m.id, t.field, !t.val)}
                            disabled={isBusy}
                          />
                          <span>{t.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {m.status === "pending" && (
                        <button
                          onClick={() => updateStatus(m.id, "approved")}
                          disabled={isBusy}
                          className="btn btn-sm"
                          style={{ background: "#22c55e", color: "white" }}
                        >
                          {isBusy ? "..." : "قبول"}
                        </button>
                      )}
                      {m.status === "approved" && (
                        <button
                          onClick={() => updateStatus(m.id, "hidden")}
                          disabled={isBusy}
                          className="btn btn-sm"
                          style={{ background: "#94a3b8", color: "white" }}
                        >
                          {isBusy ? "..." : "إخفاء"}
                        </button>
                      )}
                      {m.status === "hidden" && (
                        <button
                          onClick={() => updateStatus(m.id, "approved")}
                          disabled={isBusy}
                          className="btn btn-sm"
                          style={{ background: "#22c55e", color: "white" }}
                        >
                          {isBusy ? "..." : "إظهار"}
                        </button>
                      )}
                      <button
                        onClick={() => deleteMemory(m.id)}
                        disabled={isBusy}
                        className="btn btn-sm btn-outline"
                        style={{ color: "#ef4444", borderColor: "#ef4444" }}
                      >
                        {isBusy ? "..." : "حذف"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
