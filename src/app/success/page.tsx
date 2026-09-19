"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  return (
    <main className="min-h-screen bg-[var(--slate-50)] flex items-center justify-center px-5">
      <div className={`text-center max-w-sm transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--green)]" style={{ boxShadow: "0 8px 32px rgba(34,197,94,0.25)" }}>
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ color: "var(--slate-900)" }}>شكراً من القلب ❤️</h1>
        <p className="text-sm mb-1" style={{ color: "var(--slate-500)" }}>ذكرتك اتحفظت بنجاح</p>
        <p className="text-sm mb-8" style={{ color: "var(--slate-400)" }}>رح نحتفظ فيها للأبد</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">الرئيسية</Link>
          <Link href="/memories" className="btn btn-outline">شوف الذكريات</Link>
        </div>
      </div>
    </main>
  );
}
