"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [memoryCount, setMemoryCount] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchMemoryCount();
  }, []);

  async function fetchMemoryCount() {
    try {
      const res = await fetch("/api/memories?count=true");
      if (res.ok) {
        const data = await res.json();
        setMemoryCount(data.count ?? 0);
      }
    } catch {
      // silently fail
    }
  }

  return (
    <main className="min-h-screen paper-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[var(--orange-warm)] opacity-5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[var(--blue-dark)] opacity-5 blur-3xl" />

      <div
        className={`max-w-lg w-full text-center transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Book icon */}
        <div className="mb-8">
          <div className="inline-block relative">
            <div className="w-24 h-28 mx-auto rounded-lg bg-[var(--blue-dark)] shadow-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full notebook-lines" />
              </div>
              <svg
                className="w-12 h-12 text-[var(--orange-warm)] relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-24 h-28 rounded-lg bg-[var(--blue-dark)] opacity-20 -z-10 rotate-3" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--blue-dark)] mb-4 leading-tight">
          دفتر ذكريات أحمد مهدي
        </h1>

        <p className="text-base text-[var(--gray-500)] mb-4">
          مسؤول الميديا — أسر صناع الحياة بالجامعات المصرية
        </p>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[var(--gray-600)] mb-2 leading-relaxed">
          يمكن الأيام تتغير، والمسؤوليات تخلص…
        </p>
        <p className="text-lg md:text-xl text-[var(--gray-600)] mb-6 leading-relaxed">
          لكن بعض الكلمات بتفضل.
        </p>

        {/* Heart divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-[var(--orange-warm)] opacity-30" />
          <span className="text-[var(--orange-warm)] text-xl">❤️</span>
          <div className="h-px w-16 bg-[var(--orange-warm)] opacity-30" />
        </div>

        {/* Call to action */}
        <p className="text-base text-[var(--gray-500)] mb-8">
          اكتبلي كلمتين تحب أفتكرهم منك ❤️
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/write"
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            اكتب ذكريتك
          </Link>

          <Link
            href="/memories"
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
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            افتح دفتر الذكريات
          </Link>
        </div>

        {/* Memory count */}
        {memoryCount !== null && memoryCount > 0 && (
          <div className="animate-fade-in">
            <p className="text-sm text-[var(--gray-400)]">
              <span className="text-[var(--orange-warm)] font-bold text-lg">
                {memoryCount}
              </span>{" "}
              ذكرى اتجمعت في الدفتر لحد دلوقتي
            </p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="absolute bottom-6 text-center">
        <p className="text-xs text-[var(--gray-400)]">
          دفتر ذكريات — أسر صناع الحياة بالجامعات المصرية
        </p>
      </div>
    </main>
  );
}
