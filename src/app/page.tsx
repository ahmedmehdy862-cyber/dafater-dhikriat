"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setShow(true), 50);
    fetch("/api/memories?count=true")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[var(--slate-50)]">
      <div className="max-w-2xl mx-auto px-5 py-16 md:py-24 flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`mb-8 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--navy)", boxShadow: "0 8px 32px rgba(30,41,59,0.2)" }}
          >
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div
          className={`mb-3 transition-all duration-500 delay-100 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: "var(--slate-900)" }}>
            دفتر الذكريات
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className={`text-base md:text-lg mb-8 transition-all duration-500 delay-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ color: "var(--slate-500)" }}
        >
          أحمد مهدي — مسؤول الميديا
        </p>

        {/* Description */}
        <div
          className={`mb-10 transition-all duration-500 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <p className="text-sm md:text-base leading-relaxed max-w-md" style={{ color: "var(--slate-500)" }}>
            كل ذكرى هنا مش بس حرف، دي{" "}
            <span className="font-semibold" style={{ color: "var(--slate-800)" }}>لحظة عشناها مع بعض</span>.
            اكتبلي كلمتين تحب أفتكرهم منك.
          </p>
        </div>

        {/* Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-10 transition-all duration-500 delay-[400ms] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Link href="/write" className="btn btn-primary btn-lg w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            اكتب ذكريتك
          </Link>
          <Link href="/memories" className="btn btn-outline btn-lg w-full sm:w-auto">
            شوف الذكريات
          </Link>
        </div>

        {/* Count */}
        {count > 0 && (
          <div
            className={`transition-all duration-500 delay-[500ms] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-sm" style={{ color: "var(--slate-400)" }}>
              <span className="font-semibold" style={{ color: "var(--slate-600)" }}>{count}</span> ذكرى اتجمعت لحد دلوقتي
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className={`mt-20 transition-all duration-500 delay-[600ms] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <p className="text-xs" style={{ color: "var(--slate-400)" }}>صُنع بـ ❤️</p>
        </div>
      </div>
    </main>
  );
}
