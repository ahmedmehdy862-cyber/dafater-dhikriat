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
    <main className="min-h-screen paper-bg flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--blue-dark)] mb-2">
            لوحة تحكم المسؤول
          </h1>
          <p className="text-sm text-[var(--gray-500)]">
            سجل دخولك للوصول للوحة التحكم
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[var(--text-dark)] mb-2"
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[var(--gray-100)] border-2 border-transparent focus:border-[var(--orange-warm)] focus:bg-white focus:outline-none transition-colors text-[var(--text-dark)]"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[var(--text-dark)] mb-2"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[var(--gray-100)] border-2 border-transparent focus:border-[var(--orange-warm)] focus:bg-white focus:outline-none transition-colors text-[var(--text-dark)]"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[var(--blue-dark)] text-white font-semibold hover:bg-[var(--blue-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ borderTopColor: "white" }} />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
