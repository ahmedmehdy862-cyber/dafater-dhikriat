"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
      <div
        className="text-center max-w-md transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)" }}
      >
        {/* Success icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--success), #34d399)", boxShadow: "0 8px 24px rgba(16,185,129,0.3)" }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ color: "var(--text-dark)" }}>
          شكراً من القلب ❤️
        </h1>

        {/* Description */}
        <p className="text-base mb-2" style={{ color: "var(--text-muted)" }}>
          كلمتك اتبعتت وهتتضاف للدفتر بعد مراجعتها.
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-light)" }}>
          كل ذكرى بتفرق. وذكراك دي هتفضل معايا.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">الرئيسية</Link>
          <Link href="/memories" className="btn btn-secondary">شوف الذكريات</Link>
        </div>
      </div>
    </main>
  );
}
