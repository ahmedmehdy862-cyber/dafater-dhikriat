"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--cream)" }}
    >
      <div
        className={`transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{
          direction: "rtl",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="blob-blue absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="blob-orange absolute -bottom-32 -right-32 w-72 h-72 rounded-full opacity-30 blur-3xl"
          aria-hidden="true"
        />
        <div className="pattern-dots absolute inset-0 opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-6">
          <div
            className="rounded-full flex items-center justify-center shadow-2xl"
            style={{
              width: 100,
              height: 100,
              backgroundColor: "var(--success, #059669)",
              boxShadow: "0 20px 60px rgba(5, 150, 105, 0.35)",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="text-center" dir="rtl">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                animation: "fadeUp 0.8s ease-out 0.3s both",
                fontFamily: "var(--font-heading, 'Noto Kufi Arabic', sans-serif)",
              }}
            >
              شكراً من القلب ❤️
            </h1>
            <p
              className="text-lg md:text-xl mb-2"
              style={{ color: "#555" }}
            >
              ذكرتك اتحفظت بنجاح في كتاب الذكريات
            </p>
            <p
              className="text-base md:text-lg"
              style={{ color: "#888" }}
            >
              رح نحتفظ فيها للأبد
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4" dir="rtl">
            <a href="/" className="btn btn-primary">
              الرئيسية
            </a>
            <a href="/memories" className="btn btn-outline">
              شوف الذكريات
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
