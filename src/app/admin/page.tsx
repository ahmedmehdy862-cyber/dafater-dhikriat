"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Memory {
  id: string;
  name: string;
  message: string;
  nice_moment: string | null;
  image_url: string | null;
  status: "pending" | "approved" | "rejected" | "hidden";
  is_public: boolean;
  is_favorite: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  hidden: number;
  universities: number;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "قيد المراجعة", bg: "#fef3c7", text: "#92400e" },
  approved: { label: "مقبول", bg: "#d1fae5", text: "#065f46" },
  rejected: { label: "مرفوض", bg: "#fee2e2", text: "#991b1b" },
  hidden: { label: "مخفي", bg: "#f1f5f9", text: "#475569" },
};

const FILTER_TABS: { key: string; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "approved", label: "مقبول" },
  { key: "rejected", label: "مرفوض" },
];

export default function AdminPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getToken = useCallback(() => {
    return localStorage.getItem("admin_token");
  }, []);

  const computeStats = useCallback((list: Memory[]) => {
    setStats({
      total: list.length,
      approved: list.filter((m) => m.status === "approved").length,
      pending: list.filter((m) => m.status === "pending").length,
      rejected: list.filter((m) => m.status === "rejected").length,
      hidden: list.filter((m) => m.status === "hidden").length,
      universities: 0,
    });
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
      computeStats(list);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [getToken, computeStats, router]);

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

      setMemories((prev) => {
        const updated = prev.map((m) =>
          m.id === id ? { ...m, status: status as Memory["status"] } : m
        );
        computeStats(updated);
        return updated;
      });
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

      setMemories((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        computeStats(updated);
        return updated;
      });
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-xl md:text-2xl font-bold">لوحة التحكم</h1>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: "white" }}>
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "الإجمالي", value: stats.total, bg: "#e2e8f0", color: "#0f172a" },
              { label: "قيد المراجعة", value: stats.pending, bg: "#fef3c7", color: "#92400e" },
              { label: "مقبول", value: stats.approved, bg: "#d1fae5", color: "#065f46" },
              { label: "مرفوض", value: stats.rejected, bg: "#fee2e2", color: "#991b1b" },
            ].map((s) => (
              <div
                key={s.label}
                className="card p-4 text-center"
                style={{ background: s.bg, color: s.color }}
              >
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => {
              const statusInfo = STATUS_MAP[m.status] || STATUS_MAP.pending;
              return (
                <div key={m.id} className="card card-hover p-4">
                  {m.image_url && (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base" style={{ color: "#0f172a" }}>
                      {m.name}
                    </h3>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: statusInfo.bg, color: statusInfo.text }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-sm mb-2" style={{ color: "#475569", lineHeight: "1.6" }}>
                    {m.message}
                  </p>

                  {m.nice_moment && (
                    <p
                      className="text-xs mb-2 p-2 rounded-lg"
                      style={{ background: "#f1f5f9", color: "#64748b" }}
                    >
                      {m.nice_moment}
                    </p>
                  )}

                  <div className="text-xs mb-3" style={{ color: "#94a3b8" }}>
                    {new Date(m.created_at).toLocaleDateString("ar-EG")}
                  </div>

                  <div className="flex gap-2">
                    {m.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(m.id, "approved")}
                        disabled={actionLoading === m.id}
                        className="btn btn-sm flex-1"
                        style={{ background: "#22c55e", color: "white" }}
                      >
                        {actionLoading === m.id ? "..." : "قبول"}
                      </button>
                    )}
                    {m.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(m.id, "rejected")}
                        disabled={actionLoading === m.id}
                        className="btn btn-sm flex-1"
                        style={{ background: "#ef4444", color: "white" }}
                      >
                        {actionLoading === m.id ? "..." : "رفض"}
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
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
