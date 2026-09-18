"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_MESSAGE = 500;

export default function WritePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [university, setUniversity] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameValid = name.trim().length >= 2;
  const msgValid = message.trim().length >= 10;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((p) => ({ ...p, image: "الصورة لازم تكون JPG أو PNG أو WebP" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "الحجم الأقصى 5 ميجا" }));
      return;
    }
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = "الاسم لازم يكون حرفين على الأقل";
    if (!message.trim() || message.trim().length < 10) e.message = "الرسالة لازم يكون فيها 10 أحرف على الأقل";
    if (message.length > MAX_MESSAGE) e.message = `الرسالة مش ممكن تتجاوز ${MAX_MESSAGE} حرف`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const ur = await fetch("/api/upload", { method: "POST", body: fd });
        if (!ur.ok) throw new Error("فشل رفع الصورة");
        const ud = await ur.json();
        imageUrl = ud.url;
      }
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          university: university.trim() || undefined,
          message: message.trim(),
          image_url: imageUrl || undefined,
          is_public: isPublic,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "فشل الإرسال");
      }
      router.push("/success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "حصل مشكلة، حاول تاني");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--blue-dark)" }}>
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرجوع
          </Link>
          <span className="text-sm font-semibold" style={{ color: "var(--orange-warm)" }}>كلمة جديدة</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "الاسم", done: nameValid },
            { n: 2, label: "رسالتك", done: msgValid },
            { n: 3, label: "اختيارات", done: false },
          ].map((s) => (
            <div key={s.n} className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: s.done ? "var(--success)" : "var(--blue-dark)",
                    color: "var(--white)",
                    boxShadow: s.done ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  }}
                >
                  {s.done ? "✓" : s.n}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: s.done ? "var(--success)" : "var(--text-muted)" }}>{s.label}</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: s.done ? "var(--success)" : "var(--border)" }} />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <label htmlFor="name" className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold" style={{ color: "var(--text-dark)" }}>اسمك</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--orange-light)", color: "var(--orange-warm)" }}>مطلوب</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك..."
              className="input-field"
              autoFocus
            />
            {errors.name && <p className="mt-2 text-sm font-medium flex items-center gap-1" style={{ color: "var(--danger)" }}>⚠️ {errors.name}</p>}
          </div>

          {/* Message */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <label htmlFor="message" className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold" style={{ color: "var(--text-dark)" }}>رسالتك ليا</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--orange-light)", color: "var(--orange-warm)" }}>مطلوب</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب اللي تحب تقوله..."
              rows={4}
              className="input-field resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              {errors.message ? (
                <p className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--danger)" }}>⚠️ {errors.message}</p>
              ) : <span />}
              <span className="text-xs" style={{ color: message.length > MAX_MESSAGE ? "var(--danger)" : "var(--text-light)" }}>
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <p className="text-sm font-bold mb-4" style={{ color: "var(--text-muted)" }}>اختيارات إضافية</p>

            {/* University */}
            <div className="mb-4">
              <label htmlFor="university" className="block text-sm font-medium mb-2" style={{ color: "var(--text-dark)" }}>جامعتك أو كيانك</label>
              <input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="مثلاً: جامعة القاهرة"
                className="input-field"
              />
            </div>

            {/* Image */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dark)" }}>صورة تجمعنا</label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="معاينة" className="w-24 h-24 object-cover rounded-xl" style={{ border: "2px solid var(--border)" }} />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: "var(--danger)" }} aria-label="حذف الصورة">✕</button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:border-opacity-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="var(--text-light)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>اضغط لاختيار صورة</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>JPG، PNG، WebP — حد أقصى 5 ميجا</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
              {errors.image && <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>⚠️ {errors.image}</p>}
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--cream)" }}>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-dark)" }}>رسالتي للجمهور</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {isPublic ? "رسالتك هتظهر للجميع" : "رسالتك هتفضل خاصة بالمسؤول"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`toggle ${isPublic ? "active" : ""}`}
                role="switch"
                aria-checked={isPublic}
                aria-label="إظهار الرسالة للجمهور"
              />
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="p-4 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "var(--danger)" }}>
              ⚠️ {submitError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !nameValid || !msgValid}
            className="btn btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ borderTopColor: "white" }} />
                جاري الإرسال...
              </>
            ) : (
              <>سيب كلمتك في الدفتر ❤️</>
            )}
          </button>

          <p className="text-center text-xs" style={{ color: "var(--text-light)" }}>
            رسالتك هتظهر بعد مراجعتها من المسؤول
          </p>
        </form>
      </div>
    </main>
  );
}
