"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen paper-bg flex flex-col items-center justify-center px-4 py-8">
      <div
        className={`max-w-lg w-full text-center transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Success icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 border-2 border-green-200">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--blue-dark)] mb-4">
          وصلتني كلمتك ❤️
        </h1>

        {/* Message */}
        <p className="text-lg text-[var(--gray-600)] mb-2 leading-relaxed">
          يمكن تكون كلمتين بس…
        </p>
        <p className="text-lg text-[var(--gray-600)] mb-8 leading-relaxed">
          لكن أكيد هتفضل في مكانها.
        </p>

        {/* Heart divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-[var(--orange-warm)] opacity-30" />
          <span className="text-[var(--orange-warm)] text-xl">❤️</span>
          <div className="h-px w-16 bg-[var(--orange-warm)] opacity-30" />
        </div>

        {/* Info */}
        <p className="text-sm text-[var(--gray-500)] mb-8">
          الرسالة هتظهر بعد مراجعتها من المسؤول
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/memories"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--blue-dark)] text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-[var(--blue-light)] transition-all duration-300 hover:-translate-y-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            اقرأ الذكريات
          </Link>

          <Link
            href="/write"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[var(--blue-dark)] text-lg font-semibold shadow-md hover:shadow-lg border-2 border-[var(--blue-dark)] border-opacity-10 transition-all duration-300 hover:-translate-y-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            اكتب رسالة تانية
          </Link>
        </div>
      </div>
    </main>
  );
}
