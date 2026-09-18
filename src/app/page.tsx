"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [show, setShow] = useState(false);
  const [memCount, setMemCount] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch("/api/memories?count=true")
      .then((r) => r.json())
      .then((d) => setMemCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(160deg, #fefaf3 0%, #f8f0e0 40%, #fefaf3 100%)" }}>
      {/* Animated background blobs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--blue-dark), transparent 70%)",
          top: "-10%",
          right: "-5%",
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: "transform 0.8s ease-out",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--orange-warm), transparent 70%)",
          bottom: "5%",
          left: "-8%",
          transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
          transition: "transform 0.8s ease-out",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--teal), transparent 70%)",
          top: "40%",
          left: "30%",
          transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
          transition: "transform 0.8s ease-out",
        }}
      />

      {/* Dot pattern */}
      <div className="pattern-dots absolute inset-0 pointer-events-none opacity-60" />

      {/* Floating decorative elements */}
      <div className="absolute top-[15%] right-[10%] w-3 h-3 rounded-full bg-[var(--orange-warm)] opacity-40" style={{ animation: "float 6s ease-in-out infinite" }} />
      <div className="absolute top-[25%] left-[15%] w-2 h-2 rounded-full bg-[var(--blue-medium)] opacity-30" style={{ animation: "float 8s ease-in-out infinite 1s" }} />
      <div className="absolute bottom-[20%] right-[20%] w-4 h-4 rounded-full bg-[var(--orange-warm)] opacity-20" style={{ animation: "float 7s ease-in-out infinite 2s" }} />
      <div className="absolute bottom-[30%] left-[25%] w-2 h-2 rounded-full bg-[var(--blue-dark)] opacity-25" style={{ animation: "float 9s ease-in-out infinite 0.5s" }} />
      <div className="absolute top-[60%] right-[5%] w-3 h-3 rounded-full bg-[var(--purple)] opacity-15" style={{ animation: "float 5s ease-in-out infinite 1.5s" }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-12">
        {/* Top badge */}
        <div
          className={`mb-10 transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full" style={{ background: "rgba(232,155,45,0.08)", border: "1px solid rgba(232,155,45,0.15)" }}>
            <div className="w-2 h-2 rounded-full bg-[var(--orange-warm)] animate-pulse" />
            <span className="text-sm font-semibold" style={{ color: "var(--orange-deep)" }}>دفتر الذكريات</span>
          </div>
        </div>

        {/* Book icon with glow */}
        <div
          className={`mb-8 transition-all duration-1000 ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-90"}`}
        >
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 rounded-3xl scale-110 opacity-30" style={{ background: "radial-gradient(circle, var(--blue-dark), transparent 70%)", filter: "blur(30px)" }} />
            {/* Book */}
            <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-3xl flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--blue-dark), var(--blue-medium))", boxShadow: "0 20px 60px rgba(15,43,70,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <svg className="w-14 h-14 md:w-16 md:h-16 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Corner accents */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--orange-warm)] opacity-80" />
              <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-white opacity-30" />
            </div>
            {/* Shadow */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full opacity-15" style={{ background: "var(--blue-dark)", filter: "blur(8px)" }} />
          </div>
        </div>

        {/* Title */}
        <div
          className={`text-center mb-4 transition-all duration-700 delay-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight">
            <span style={{ color: "var(--text-dark)" }}>دفتر</span>
            <br />
            <span className="bg-gradient-to-l from-[var(--orange-warm)] via-[var(--orange-deep)] to-[var(--rose)] bg-clip-text text-transparent">
              الذكريات
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className={`text-base md:text-lg mb-8 transition-all duration-700 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ color: "var(--text-muted)" }}
        >
          أحمد مهدي — مسؤول الميديا
        </p>

        {/* Quote card */}
        <div
          className={`mb-10 w-full max-w-lg transition-all duration-700 delay-[400ms] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
            {/* Quote marks */}
            <div className="absolute top-2 right-4 text-6xl font-bold leading-none select-none" style={{ color: "var(--orange-warm)", opacity: 0.1, fontFamily: "Georgia, serif" }}>&quot;</div>
            <div className="absolute bottom-2 left-4 text-6xl font-bold leading-none select-none rotate-180" style={{ color: "var(--orange-warm)", opacity: 0.1, fontFamily: "Georgia, serif" }}>&quot;</div>

            <p className="text-base md:text-lg leading-relaxed font-medium text-center relative z-10" style={{ color: "var(--text-dark)" }}>
              كل ذكرى هنا مش بس حرف، دي{" "}
              <span className="font-bold" style={{ color: "var(--orange-warm)" }}>لحظة عشناها مع بعض</span>
              ، فيها ضحك ودموع وحلم ابتدي من مكان قريب
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto transition-all duration-700 delay-[500ms] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Link href="/write" className="btn btn-primary text-lg px-10 py-4 w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            اكتب ذكريتك
          </Link>
          <Link href="/memories" className="btn btn-outline text-lg px-10 py-4 w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            شوف الذكريات
          </Link>
        </div>

        {/* Memory count */}
        {memCount > 0 && (
          <div
            className={`transition-all duration-700 delay-[600ms] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full" style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold" style={{ color: "var(--text-dark)" }}>{memCount}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>ذكرى اتجمعت لحد دلوقتي</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className={`mt-16 transition-all duration-700 delay-[800ms] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <p className="text-xs" style={{ color: "var(--text-light)" }}>صُنع بـ ❤️</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </main>
  );
}
