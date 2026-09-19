"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX = 500;

export default function WritePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [university, setUniversity] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const nameOk = name.trim().length >= 2;
  const msgOk = message.trim().length >= 10 && message.length <= MAX;

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setErrors((p) => ({ ...p, image: "الصورة لازم تكون JPG أو PNG أو WebP" }));
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "الحجم الأقصى 5 ميجا" }));
      return;
    }
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = "الاسم لازم يكون حرفين على الأقل";
    if (!message.trim() || message.trim().length < 10) e.message = "الرسالة لازم يكون فيها 10 أحرف على الأقل";
    if (message.length > MAX) e.message = `الرسالة مش ممكن تتجاوز ${MAX} حرف`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const ur = await fetch("/api/upload", { method: "POST", body: fd });
        if (!ur.ok) throw new Error("فشل رفع الصورة");
        imageUrl = (await ur.json()).url;
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
      if (!res.ok) throw new Error((await res.json()).error || "فشل الإرسال");
      router.push("/success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "حصل مشكلة، حاول تاني");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--slate-50)]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[var(--slate-200)]">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="btn btn-ghost btn-sm">
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرئيسية
          </Link>
          <span className="text-sm font-semibold" style={{ color: "var(--slate-500)" }}>كلمة جديدة</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className="h-1.5 rounded-full transition-all duration-500" style={{
                background: (s === 1 && nameOk) || (s === 2 && msgOk) || (s === 3)
                  ? "var(--blue)" : "var(--slate-200)"
              }} />
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div className="card p-5">
            <label htmlFor="name" className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold" style={{ color: "var(--slate-800)" }}>اسمك</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--amber-light)", color: "var(--amber-dark)" }}>مطلوب</span>
            </label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="اكتب اسمك..." className="input" autoFocus />
            {errors.name && <p className="mt-2 text-xs font-medium" style={{ color: "var(--red)" }}>{errors.name}</p>}
          </div>

          {/* Message */}
          <div className="card p-5">
            <label htmlFor="message" className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold" style={{ color: "var(--slate-800)" }}>رسالتك</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--amber-light)", color: "var(--amber-dark)" }}>مطلوب</span>
            </label>
            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب اللي تحب تقوله..." rows={4} className="input resize-none" />
            <div className="flex justify-between items-center mt-2">
              {errors.message ? <p className="text-xs font-medium" style={{ color: "var(--red)" }}>{errors.message}</p> : <span />}
              <span className="text-xs" style={{ color: message.length > MAX ? "var(--red)" : "var(--slate-400)" }}>
                {message.length}/{MAX}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="card p-5">
            <p className="text-sm font-bold mb-4" style={{ color: "var(--slate-500)" }}>اختيارات إضافية</p>

            <div className="mb-4">
              <label htmlFor="university" className="block text-sm font-medium mb-1.5" style={{ color: "var(--slate-700)" }}>جامعتك أو كيانك</label>
              <input id="university" type="text" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="مثلاً: جامعة القاهرة" className="input" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--slate-700)" }}>صورة تجمعنا</label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="" className="w-24 h-24 object-cover rounded-lg border border-[var(--slate-200)]" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white bg-[var(--red)]" aria-label="حذف">✕</button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-[var(--slate-200)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--slate-300)] transition-colors">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="var(--slate-300)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm" style={{ color: "var(--slate-500)" }}>اضغط لاختيار صورة</p>
                  <p className="text-xs mt-1" style={{ color: "var(--slate-400)" }}>JPG، PNG، WebP — حد أقصى 5 ميجا</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onImage} className="hidden" />
              {errors.image && <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>{errors.image}</p>}
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--slate-50)]">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--slate-700)" }}>رسالتي للجمهور</p>
                <p className="text-xs" style={{ color: "var(--slate-400)" }}>{isPublic ? "هتظهر للجميع" : "هتفضل خاصة"}</p>
              </div>
              <button type="button" onClick={() => setIsPublic(!isPublic)} className={`toggle-wrap ${isPublic ? "on" : ""}`} role="switch" aria-checked={isPublic} />
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="p-3 rounded-lg text-sm font-medium" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "var(--red)" }}>
              {submitError}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting || !nameOk || !msgOk} className="btn btn-primary btn-lg w-full disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? <><div className="spinner" /> جاري الإرسال...</> : "سيب كلمتك في الدفتر ❤️"}
          </button>

          <p className="text-center text-xs" style={{ color: "var(--slate-400)" }}>رسالتك هتظهر بعد مراجعتها من المسؤول</p>
        </form>
      </div>
    </main>
  );
}
