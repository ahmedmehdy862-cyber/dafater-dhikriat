"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [show, setShow] = useState(false);
  const [memCount, setMemCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("memory_count");
    const count = saved ? parseInt(saved, 10) : 12;
    setMemCount(count);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden" dir="rtl">
      <div className="pattern-dots absolute inset-0 pointer-events-none" />
      <div className="blob-blue absolute -top-32 -right-32 w-72 h-72 rounded-full opacity-40" />
      <div className="blob-orange absolute top-40 -left-20 w-56 h-56 rounded-full opacity-30" />
      <div className="blob-blue absolute bottom-20 right-10 w-40 h-40 rounded-full opacity-20" />
      <div className="blob-orange absolute -bottom-16 left-1/3 w-64 h-64 rounded-full opacity-25" />

      <div className="pattern-dots absolute top-60 right-1/4 w-3 h-3 rounded-full bg-orange-warm opacity-60" />
      <div className="pattern-dots absolute top-80 left-16 w-2 h-2 rounded-full bg-blue-medium opacity-50" />
      <div className="pattern-dots absolute bottom-40 right-20 w-2 h-2 rounded-full bg-orange-deep opacity-40" />
      <div className="pattern-dots absolute top-1/3 left-1/2 w-4 h-4 rounded-full bg-orange-warm opacity-30" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div
          className={`transition-all duration-700 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block px-5 py-2 rounded-full bg-orange-light text-orange-deep font-bold text-sm mb-10 shadow-sm border border-orange-warm/20">
            أسر صناع الحياة بالجامعات المصرية
          </span>
        </div>

        <div
          className={`transition-all duration-700 delay-150 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="relative mb-8">
            <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-orange-warm opacity-70" />
            <div className="absolute top-2 -left-6 w-2 h-2 rounded-full bg-blue-medium opacity-60" />
            <div className="absolute -bottom-3 right-8 w-2 h-2 rounded-full bg-orange-deep opacity-50" />

            <div className="w-40 h-40 mx-auto rounded-3xl bg-gradient-to-br from-[var(--blue-dark)] to-[var(--blue-medium)] shadow-2xl shadow-[var(--blue-dark)]/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <svg
                className="w-20 h-20 text-white relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-warm text-white text-xs font-bold rounded-full shadow-lg">
              دفتر الذكريات
            </div>
          </div>
        </div>

        <h1
          className={`text-5xl md:text-6xl font-black leading-tight mb-4 transition-all duration-700 delay-300 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="text-[var(--text-dark)]">دفتر</span>{" "}
          <span className="bg-gradient-to-l from-[var(--orange-warm)] to-[var(--orange-deep)] bg-clip-text text-transparent">
            الذكريات
          </span>
        </h1>

        <p
          className={`text-lg text-[var(--text-muted)] mb-10 transition-all duration-700 delay-[450ms] ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          أحمد مهدي — مسؤول الميديا
        </p>

        <div
          className={`glass rounded-2xl p-6 mb-10 max-w-lg border border-white/20 transition-all duration-700 delay-[600ms] ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-[var(--text-dark)] text-base md:text-lg leading-relaxed font-medium">
            كل ذكرى هنا مش بس حرف، دي
            <span className="text-[var(--orange-warm)] font-bold"> لحظة عشناها مع بعض</span>،
            فيها ضحك ودموع وحلم ابتدي من مكان قريب
          </p>
        </div>

        <div
          className={`flex flex-col sm:flex-row gap-4 mb-8 transition-all duration-700 delay-[750ms] ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <a href="/add" className="btn btn-primary text-lg px-8 py-4 shadow-lg shadow-[var(--blue-dark)]/20">
            اكتب ذكريتك
          </a>
          <a href="/memories" className="btn btn-outline text-lg px-8 py-4">
            شوف الذكريات
          </a>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-[var(--orange-warm)]/20 shadow-sm transition-all duration-700 delay-[900ms] ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold text-[var(--text-dark)]">
            {memCount} ذكرى اتجمعت
          </span>
        </div>

        <footer
          className={`mt-20 pt-8 border-t border-[var(--text-muted)]/10 w-full transition-all duration-700 delay-[1100ms] ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xs text-[var(--text-muted)] opacity-60">
            صُنع بـ ❤️ لصناع الحياة
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        div:hover > div > div:first-child {
          animation: wiggle 0.4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
