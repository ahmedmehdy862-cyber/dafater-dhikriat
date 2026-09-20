"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        return;
      }
      localStorage.setItem("admin_token", data.token);
      router.push("/admin");
    } catch {
      setError("حصل مشكلة، حاول تاني");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--slate-50)] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "var(--navy)" }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--slate-900)" }}>لوحة تحكم المسؤول</h1>
          <p className="text-sm mt-1" style={{ color: "var(--slate-400)" }}>سجل دخولك للوصول للوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--slate-700)" }}>البريد الإلكتروني</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="input" autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--slate-700)" }}>كلمة المرور</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" autoComplete="current-password" required />
          </div>
          {error && <div className="p-3 rounded-lg text-sm text-center" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "var(--red)" }}>{error}</div>}
          <button type="submit" disabled={isLoading} className="btn btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">
            {isLoading ? <><div className="spinner" /> جاري تسجيل الدخول...</> : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </main>
  );
}
