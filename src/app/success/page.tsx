"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(true);
      try {
        const n = sessionStorage.getItem("dafater_writer_name");
        if (n) setName(n);
      } catch {
        /* ignore */
      }
    }, 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="mem-page mem-center">
      <div className={`success-card ${show ? "in" : ""}`}>
        <div className="success-heart">&#129525;</div>
        <h1 className="success-title">
          {name ? `شكرًا يا ${name}` : "الذكرى وصلت"} &#128156;
        </h1>
        <p className="success-sub">سِبت جزء صغير من رحلتنا هنا، وهيفضل محفوظ للأبد.</p>
        <p className="success-note">ذكرتك هتظهر في المعرض بعد موافقة المسؤول عليها.</p>
        <div className="success-actions">
          <Link href="/memories" className="btn btn-primary btn-lg">مشاهدة الذكريات</Link>
          <Link href="/write" className="btn btn-outline btn-lg">كتابة ذكرى أخرى</Link>
        </div>
      </div>
    </main>
  );
}