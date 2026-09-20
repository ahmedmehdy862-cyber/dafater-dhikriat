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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white text-xl md:text-2xl font-bold">لوحة التحكم</h1>
            <span
              className="text-sm px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
            >
              {memories.length} ذكرى
            </span>
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: "white" }}>
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "الإجمالي", value: stats.total, border: "#0f172a", bg: "#f1f5f9", color: "#0f172a" },
            { label: "قيد المراجعة", value: stats.pending, border: "#f59e0b", bg: "#fefce8", color: "#92400e" },
            { label: "مقبول", value: stats.approved, border: "#22c55e", bg: "#f0fdf4", color: "#065f46" },
            { label: "مخفي", value: stats.hidden, border: "#94a3b8", bg: "#f8fafc", color: "#475569" },
          ].map((s) => (
            <div
              key={s.label}
              className="card p-5"
              style={{ background: s.bg, borderRight: `4px solid ${s.border}` }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-sm" style={{ color: s.color, opacity: 0.7 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
          <div className="flex flex-col gap-4">
            {filtered.map((m) => {
              const statusInfo = STATUS_MAP[m.status] || STATUS_MAP.pending;
              return (
                <div
                  key={m.id}
                  className="card p-5 flex flex-col md:flex-row gap-4"
                  style={{ borderRight: `4px solid ${statusInfo.color}` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: statusInfo.bg, color: statusInfo.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: statusInfo.color }}
                        />
                        {statusInfo.label}
                      </span>
                      <span className="text-xs" style={{ color: "#94a3b8" }}>
                        {new Date(m.created_at).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    <h3 className="font-bold text-base mb-1" style={{ color: "#0f172a" }}>
                      {m.name}
                    </h3>

                    <p
                      className="text-sm mb-1"
                      style={{
                        color: "#475569",
                        lineHeight: "1.6",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {m.message}
                    </p>

                    {m.nice_moment && (
                      <p
                        className="text-xs p-2 rounded-lg mb-1"
                        style={{
                          background: "#f1f5f9",
                          color: "#64748b",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {m.nice_moment}
                      </p>
                    )}

                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt={m.name}
                        className="w-16 h-16 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>

                  <div
                    className="flex flex-col md:flex-row items-start md:items-center gap-3"
                    style={{ minWidth: "280px" }}
                  >
                    <div className="flex flex-wrap gap-3">
                      <label className="toggle-wrap flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
                        <span>الاسم</span>
                        <button
                          onClick={() => updateField(m.id, "show_name", !m.show_name)}
                          disabled={actionLoading === m.id}
                          className={`toggle-wrap ${m.show_name ? "on" : ""}`}
                          style={{
                            width: "36px",
                            height: "20px",
                            borderRadius: "10px",
                            background: m.show_name ? "#22c55e" : "#cbd5e1",
                            position: "relative",
                            transition: "background 0.2s",
                            cursor: "pointer",
                            border: "none",
                            padding: 0,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: m.show_name ? "18px" : "2px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "white",
                              transition: "right 0.2s",
                            }}
                          />
                        </button>
                      </label>

                      <label className="toggle-wrap flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
                        <span>الموقف</span>
                        <button
                          onClick={() => updateField(m.id, "show_nice_moment", !m.show_nice_moment)}
                          disabled={actionLoading === m.id}
                          className={`toggle-wrap ${m.show_nice_moment ? "on" : ""}`}
                          style={{
                            width: "36px",
                            height: "20px",
                            borderRadius: "10px",
                            background: m.show_nice_moment ? "#22c55e" : "#cbd5e1",
                            position: "relative",
                            transition: "background 0.2s",
                            cursor: "pointer",
                            border: "none",
                            padding: 0,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: m.show_nice_moment ? "18px" : "2px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "white",
                              transition: "right 0.2s",
                            }}
                          />
                        </button>
                      </label>

                      <label className="toggle-wrap flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
                        <span>الصورة</span>
                        <button
                          onClick={() => updateField(m.id, "show_image", !m.show_image)}
                          disabled={actionLoading === m.id}
                          className={`toggle-wrap ${m.show_image ? "on" : ""}`}
                          style={{
                            width: "36px",
                            height: "20px",
                            borderRadius: "10px",
                            background: m.show_image ? "#22c55e" : "#cbd5e1",
                            position: "relative",
                            transition: "background 0.2s",
                            cursor: "pointer",
                            border: "none",
                            padding: 0,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: m.show_image ? "18px" : "2px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "white",
                              transition: "right 0.2s",
                            }}
                          />
                        </button>
                      </label>
                    </div>

                    <div className="flex gap-2">
                      {m.status === "pending" && (
                        <button
                          onClick={() => updateStatus(m.id, "approved")}
                          disabled={actionLoading === m.id}
                          className="btn btn-sm"
                          style={{ background: "#22c55e", color: "white" }}
                        >
                          {actionLoading === m.id ? "..." : "قبول"}
                        </button>
                      )}
                      {m.status === "approved" && (
                        <button
                          onClick={() => updateStatus(m.id, "hidden")}
                          disabled={actionLoading === m.id}
                          className="btn btn-sm"
                          style={{ background: "#94a3b8", color: "white" }}
                        >
                          {actionLoading === m.id ? "..." : "إخفاء"}
                        </button>
                      )}
                      <button
                        onClick={() => deleteMemory(m.id)}
                        disabled={actionLoading === m.id}
                        className="btn btn-sm btn-outline"
                        style={{ color: "#ef4444", borderColor: "#ef4444" }}
                      >
                        {actionLoading === m.id ? "..." : "حذف"}
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
