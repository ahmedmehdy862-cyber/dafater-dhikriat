"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [memoryCount, setMemoryCount] = useState<number | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
    ];
    fetchMemoryCount();
    return () => timers.forEach(clearTimeout);
  }, []);

  async function fetchMemoryCount() {
    try {
      const res = await fetch("/api/memories?count=true");
      if (res.ok) {
        const data = await res.json();
        setMemoryCount(data.count ?? 0);
      }
    } catch {}
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FFF8ED 0%, #f5edd8 50%, #FFF8ED 100%)" }}>
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 rounded-full opacity-[0.04] animate-pulse" style={{ background: "var(--blue-dark)" }} />
        <div className="absolute bottom-[15%] left-[8%] w-48 h-48 rounded-full opacity-[0.05]" style={{ background: "var(--orange-warm)", animation: "float 6s ease-in-out infinite" }} />
        <div className="absolute top-[60%] right-[15%] w-32 h-32 rounded-full opacity-[0.03]" style={{ background: "var(--blue-dark)", animation: "float 8s ease-in-out infinite reverse" }} />
        {/* Floating letters */}
        <div className="absolute top-[20%] left-[15%] text-6xl opacity-[0.04] select-none" style={{ animation: "float 7s ease-in-out infinite", fontFamily: "Georgia, serif" }}>ذ</div>
        <div className="absolute top-[40%] right-[10%] text-5xl opacity-[0.03] select-none" style={{ animation: "float 9s ease-in-out infinite reverse", fontFamily: "Georgia, serif" }}>ك</div>
        <div className="absolute bottom-[25%] left-[20%] text-7xl opacity-[0.03] select-none" style={{ animation: "float 6s ease-in-out infinite", fontFamily: "Georgia, serif" }}>ر</div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes bookOpen {
          0% { transform: perspective(800px) rotateY(-30deg) scale(0.8); opacity: 0; }
          100% { transform: perspective(800px) rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes paperFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
      `}</style>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Book animation */}
        <div
          className="mb-8 transition-all duration-1000"
          style={{
            animation: phase >= 1 ? "bookOpen 1s ease-out forwards" : "none",
            opacity: phase >= 1 ? 1 : 0,
          }}
        >
          <div className="relative">
            {/* Book shadow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 rounded-full opacity-20" style={{ background: "var(--blue-dark)", filter: "blur(12px)" }} />
            {/* Book body */}
            <div className="relative w-36 h-44 mx-auto rounded-r-lg rounded-l-sm shadow-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, var(--blue-dark), #1a4f7a)" }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-y-0 left-0 w-[2px] opacity-20" style={{ background: "var(--orange-warm)" }} />
                <div className="text-center px-4" style={{ animation: "paperFloat 4s ease-in-out infinite" }}>
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: "rgba(233, 162, 59, 0.2)" }}>
                    <span className="text-2xl">📖</span>
                  </div>
                  <div className="w-16 h-1 mx-auto rounded-full opacity-30" style={{ background: "var(--orange-warm)" }} />
                </div>
              </div>
              {/* Page edges */}
              <div className="absolute top-2 right-2 bottom-2 w-1 rounded-full opacity-10" style={{ background: "white" }} />
              <div className="absolute top-3 right-3 bottom-3 w-1 rounded-full opacity-5" style={{ background: "white" }} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          className="text-center mb-6 transition-all duration-700"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-3 leading-tight" style={{ color: "var(--blue-dark)" }}>
            دفتر ذكريات
          </h1>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: "var(--orange-warm)", opacity: 0.4 }} />
            <span className="text-xl" style={{ animation: "heartBeat 2s ease-in-out infinite" }}>❤️</span>
            <div className="h-px w-12" style={{ background: "var(--orange-warm)", opacity: 0.4 }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--orange-warm)" }}>
            أحمد مهدي — مسؤول الميديا
          </p>
        </div>

        {/* Quote */}
        <div
          className="text-center mb-10 max-w-md transition-all duration-700 delay-200"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-lg leading-relaxed" style={{ color: "#666" }}>
            يمكن الأيام تتغير، والمسؤوليات تخلص…
            <br />
            لكن بعض الكلمات بتفضل.
          </p>
        </div>

        {/* CTA text */}
        <div
          className="text-center mb-8 transition-all duration-700 delay-300"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-base mb-8" style={{ color: "#888" }}>
            اكتبلي كلمتين تحب أفتكرهم منك ❤️
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/write"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-white text-lg font-bold shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--blue-dark), #1a5a8a)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #1a5a8a, var(--blue-dark))" }} />
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span className="relative z-10">اكتب ذكريتك</span>
            </Link>

            <Link
              href="/memories"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2"
              style={{ color: "var(--blue-dark)", borderColor: "rgba(18,59,93,0.15)", background: "white" }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <span>افتح دفتر الذكريات</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {memoryCount !== null && memoryCount > 0 && (
          <div
            className="transition-all duration-700 delay-500"
            style={{
              opacity: phase >= 3 ? 1 : 0,
              transform: phase >= 3 ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: "rgba(233,162,59,0.08)", border: "1px solid rgba(233,162,59,0.15)" }}>
              <span className="text-2xl font-bold" style={{ color: "var(--orange-warm)" }}>{memoryCount}</span>
              <span className="text-sm" style={{ color: "#888" }}>ذكرى اتجمعت في الدفتر لحد دلوقتي</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-xs" style={{ color: "#bbb" }}>
          دفتر ذكريات — أسر صناع الحياة بالجامعات المصرية
        </p>
      </div>
    </main>
  );
}
