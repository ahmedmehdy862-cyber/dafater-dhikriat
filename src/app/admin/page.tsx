"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Memory {
  id: number;
  name: string;
  university: string;
  message: string;
  image_url: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  consent_to_publish: boolean;
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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "مقبول", color: "bg-green-100 text-green-800" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
  hidden: { label: "مخفي", color: "bg-gray-100 text-gray-800" },
};

export default function AdminPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const getHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  }, []);

  const fetchMemories = useCallback(async () => {
    try {
      const headers = getHeaders();
      let res = await fetch("/api/admin/memories", { headers });
      if (!res.ok) res = await fetch("/api/memories?all=true");
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
  }, [getHeaders, router]);

  const computeStats = (list: Memory[]) => {
    const universities = new Set(list.map((m) => m.university).filter(Boolean));
    setStats({
      total: list.length,
      approved: list.filter((m) => m.status === "approved").length,
      pending: list.filter((m) => m.status === "pending").length,
      rejected: list.filter((m) => m.status === "rejected").length,
      hidden: list.filter((m) => m.status === "hidden").length,
      universities: universities.size,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchMemories();
  }, [fetchMemories, router]);

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const headers = { ...getHeaders(), "Content-Type": "application/json" };
      await fetch(`/api/admin/memories/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      setMemories((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, status: status as Memory["status"] } : m));
        computeStats(updated);
        return updated;
      });
    } catch {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFavorite = async (id: number) => {
    setActionLoading(id);
    try {
      const headers = { ...getHeaders(), "Content-Type": "application/json" };
      const mem = memories.find((m) => m.id === id);
      await fetch(`/api/admin/memories/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_favorite: !mem?.is_favorite }),
      });
      setMemories((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, is_favorite: !m.is_favorite } : m));
        computeStats(updated);
        return updated;
      });
    } catch {
      alert("حدث خطأ");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMemory = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/memories/${id}`, { method: "DELETE", headers: getHeaders() });
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

  const exportCSV = () => {
    const headers = ["الاسم", "الجامعة", "الرسالة", "الحالة", "التاريخ"];
    const rows = filtered.map((m) => [
      m.name,
      m.university,
      `"${m.message.replace(/"/g, '""')}"`,
      STATUS_MAP[m.status]?.label || m.status,
      new Date(m.created_at).toLocaleDateString("ar-EG"),
    ]);
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "memories.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const filtered = memories.filter((m) => {
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q || m.name.toLowerCase().includes(q) || m.university.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream, #FFF8ED)" }}>
        <div className="text-xl" style={{ color: "var(--blue-dark, #123B5D)" }}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cream, #FFF8ED)", direction: "rtl" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 shadow-sm" style={{ background: "var(--blue-dark, #123B5D)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-xl md:text-2xl font-bold">لوحة التحكم</h1>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--orange-warm, #E9A23B)" }}
            >
              تصدير CSV
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: "الكل", value: stats.total, bg: "white" },
              { label: "قيد المراجعة", value: stats.pending, bg: "#FEF3C7" },
              { label: "مقبول", value: stats.approved, bg: "#D1FAE5" },
              { label: "مرفوض", value: stats.rejected, bg: "#FEE2E2" },
              { label: "الجامعات", value: stats.universities, bg: "#E0E7FF" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4 shadow-sm text-center" style={{ background: s.bg }}>
                <div className="text-2xl font-bold" style={{ color: "var(--blue-dark, #123B5D)" }}>
                  {s.value}
                </div>
                <div className="text-sm opacity-70" style={{ color: "var(--blue-dark, #123B5D)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="بحث بالاسم أو الجامعة أو الرسالة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition"
            style={{ borderColor: "var(--blue-dark, #123B5D)", color: "var(--blue-dark, #123B5D)" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none"
            style={{ borderColor: "var(--blue-dark, #123B5D)", color: "var(--blue-dark, #123B5D)" }}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="hidden">مخفي</option>
          </select>
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-xl opacity-60" style={{ color: "var(--blue-dark, #123B5D)" }}>
            لسه مفيش رسائل
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "var(--blue-dark, #123B5D)" }}>
                  <tr>
                    <th className="px-4 py-3 text-right text-white font-medium">الصورة</th>
                    <th className="px-4 py-3 text-right text-white font-medium">الاسم</th>
                    <th className="px-4 py-3 text-right text-white font-medium">الجامعة</th>
                    <th className="px-4 py-3 text-right text-white font-medium">الرسالة</th>
                    <th className="px-4 py-3 text-right text-white font-medium">الحالة</th>
                    <th className="px-4 py-3 text-right text-white font-medium">التاريخ</th>
                    <th className="px-4 py-3 text-center text-white font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        {m.image_url && (
                          <img
                            src={m.image_url}
                            alt={m.name}
                            className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80"
                            onClick={() => setPreviewImage(m.image_url)}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--blue-dark, #123B5D)" }}>
                        {m.name}
                        {m.is_favorite && <span className="mr-1 text-xs">⭐</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.university}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{m.message}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[m.status]?.color}`}>
                          {STATUS_MAP[m.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(m.created_at).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {m.status !== "approved" && (
                            <button
                              onClick={() => updateStatus(m.id, "approved")}
                              disabled={actionLoading === m.id}
                              className="px-2 py-1 rounded text-xs bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                            >
                              قبول
                            </button>
                          )}
                          {m.status !== "rejected" && (
                            <button
                              onClick={() => updateStatus(m.id, "rejected")}
                              disabled={actionLoading === m.id}
                              className="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              رفض
                            </button>
                          )}
                          {m.status !== "hidden" && (
                            <button
                              onClick={() => updateStatus(m.id, "hidden")}
                              disabled={actionLoading === m.id}
                              className="px-2 py-1 rounded text-xs bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50"
                            >
                              إخفاء
                            </button>
                          )}
                          <button
                            onClick={() => toggleFavorite(m.id)}
                            disabled={actionLoading === m.id}
                            className="px-2 py-1 rounded text-xs hover:opacity-80 disabled:opacity-50"
                            style={{ background: m.is_favorite ? "#FEF3C7" : "#F3F4F6" }}
                          >
                            {m.is_favorite ? "⭐" : "☆"}
                          </button>
                          <button
                            onClick={() => deleteMemory(m.id)}
                            disabled={actionLoading === m.id}
                            className="px-2 py-1 rounded text-xs bg-gray-700 text-white hover:bg-black disabled:opacity-50"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((m) => (
                <div key={m.id} className="p-4">
                  <div className="flex gap-3">
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt={m.name}
                        className="w-14 h-14 rounded-lg object-cover cursor-pointer flex-shrink-0"
                        onClick={() => setPreviewImage(m.image_url)}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate" style={{ color: "var(--blue-dark, #123B5D)" }}>
                          {m.name}
                        </span>
                        {m.is_favorite && <span className="text-xs">⭐</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_MAP[m.status]?.color}`}>
                          {STATUS_MAP[m.status]?.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.university}</div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">{m.message}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 justify-end">
                    {m.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(m.id, "approved")}
                        disabled={actionLoading === m.id}
                        className="px-2.5 py-1 rounded text-xs bg-green-500 text-white"
                      >
                        قبول
                      </button>
                    )}
                    {m.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(m.id, "rejected")}
                        disabled={actionLoading === m.id}
                        className="px-2.5 py-1 rounded text-xs bg-red-500 text-white"
                      >
                        رفض
                      </button>
                    )}
                    {m.status !== "hidden" && (
                      <button
                        onClick={() => updateStatus(m.id, "hidden")}
                        disabled={actionLoading === m.id}
                        className="px-2.5 py-1 rounded text-xs bg-gray-400 text-white"
                      >
                        إخفاء
                      </button>
                    )}
                    <button
                      onClick={() => toggleFavorite(m.id)}
                      disabled={actionLoading === m.id}
                      className="px-2.5 py-1 rounded text-xs"
                      style={{ background: m.is_favorite ? "#FEF3C7" : "#F3F4F6" }}
                    >
                      {m.is_favorite ? "⭐" : "☆"}
                    </button>
                    <button
                      onClick={() => deleteMemory(m.id)}
                      disabled={actionLoading === m.id}
                      className="px-2.5 py-1 rounded text-xs bg-gray-700 text-white"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="معاينة" className="w-full rounded-2xl shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-white text-gray-700 shadow-lg flex items-center justify-center text-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
