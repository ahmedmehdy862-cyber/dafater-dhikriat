"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [memoryCount, setMemoryCount] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    fetch("/api/memories?count=true")
      .then((r) => r.json())
      .then((d) => setMemoryCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "var(--cream)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, var(--blue-dark), transparent)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, var(--orange-warm), transparent)" }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--blue-dark), var(--blue-medium))" }}>
                <span className="text-white text-lg">📖</span>
              </div>
              <span className="font-bold text-lg" style={{ color: "var(--blue-dark)" }}>الدفتر</span>
            </div>
            <Link href="/admin/login" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
              المسؤول
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full text-center">
            {/* Icon */}
            <div
              className="mb-8 transition-all duration-700"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)" }}
            >
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--blue-dark), var(--blue-medium))" }}>
                <span className="text-3xl">📖</span>
              </div>
            </div>

            {/* Title */}
            <div
              className="mb-6 transition-all duration-700 delay-100"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color: "var(--text-dark)", lineHeight: 1.2 }}>
                دفتر ذكريات
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-16" style={{ background: "var(--orange-warm)", opacity: 0.3 }} />
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--orange-warm)" }} />
                <div className="h-px w-16" style={{ background: "var(--orange-warm)", opacity: 0.3 }} />
              </div>
              <p className="text-lg font-semibold" style={{ color: "var(--orange-warm)" }}>
                أحمد مهدي — مسؤول الميديا
              </p>
            </div>

            {/* Description */}
            <div
              className="mb-10 transition-all duration-700 delay-200"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
            >
              <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
                يمكن الأيام تتغير… لكن بعض الكلمات بتفضل.
                <br />
                <span className="font-semibold" style={{ color: "var(--text-dark)" }}>اكتبلي كلمتين تحب أفتكرهم منك ❤️</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10 transition-all duration-700 delay-300"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
            >
              <Link href="/write" className="btn btn-primary text-base px-8 py-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                اكتب ذكريتك
              </Link>
              <Link href="/memories" className="btn btn-secondary text-base px-8 py-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                شوف الذكريات
              </Link>
            </div>

            {/* Stats */}
            {memoryCount !== null && memoryCount > 0 && (
              <div
                className="transition-all duration-700 delay-500"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
              >
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full" style={{ background: "var(--white)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-xs)" }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-dark)" }}>{memoryCount} ذكرى</span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>اتجمعت لحد دلوقتي</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-6 text-center">
          <p className="text-xs" style={{ color: "var(--text-light)" }}>
            دفتر ذكريات — أسر صناع الحياة بالجامعات المصرية
          </p>
        </footer>
      </div>
    </main>
  );
}
