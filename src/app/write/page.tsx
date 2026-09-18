"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_MESSAGE = 500;

export default function WritePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [step, setStep] = useState(1);
  const [nameFocused, setNameFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const nameComplete = name.trim().length >= 2;
  const messageComplete = message.trim().length >= 10;

  useEffect(() => {
    if (nameComplete && step === 1) {
      const t = setTimeout(() => setStep(2), 400);
      return () => clearTimeout(t);
    }
  }, [nameComplete, step]);

  useEffect(() => {
    if (messageComplete && step === 2) {
      const t = setTimeout(() => setStep(3), 400);
      return () => clearTimeout(t);
    }
  }, [messageComplete, step]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "الصورة لازم تكون JPG أو PNG أو WebP" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "حجم الصورة مش م يزيد عن 5 ميجا" }));
      return;
    }
    setErrors((prev) => { const n = { ...prev }; delete n.image; return n; });
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
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = "الاسم لازم يكون حرفين على الأقل";
    if (!message.trim() || message.trim().length < 10) newErrors.message = "الرسالة لازم يكون فيها 10 أحرف على الأقل";
    if (message.length > MAX_MESSAGE) newErrors.message = `الرسالة مش ممكن تتجاوز ${MAX_MESSAGE} حرف`;
    const dangerousPattern = /<[^>]*>|javascript:|on\w+\s*=/i;
    if (dangerousPattern.test(message) || dangerousPattern.test(name)) newErrors.message = "الرسالة فيها محتوى غير مسموح بيه";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          const d = await uploadRes.json();
          throw new Error(d.error || "فشل رفع الصورة");
        }
        const d = await uploadRes.json();
        imageUrl = d.url;
      }
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          university: university.trim() || undefined,
          message: message.trim(),
          image_url: imageUrl || undefined,
          consent_to_publish: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "فشل إرسال الرسالة");
      }
      router.push("/success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "حصل مشكلة، حاول تاني");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #FFF8ED 0%, #f5edd8 100%)" }}>
      <style jsx>{`
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes typing { from { width: 0; } to { width: 100%; } }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: "rgba(255,248,237,0.9)", borderColor: "rgba(18,59,93,0.08)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: "var(--blue-dark)" }}>
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرجوع
          </Link>
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                style={{
                  background: step >= s ? "var(--orange-warm)" : "rgba(18,59,93,0.1)",
                  transform: step === s ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Name */}
          <div
            className="transition-all duration-500"
            style={{ opacity: step >= 1 ? 1 : 0.3, transform: step >= 1 ? "translateY(0)" : "translateY(10px)" }}
          >
            <div className="rounded-3xl p-6 transition-all duration-300" style={{
              background: "white",
              boxShadow: nameFocused ? "0 8px 40px rgba(18,59,93,0.12)" : "0 2px 12px rgba(0,0,0,0.04)",
              border: `2px solid ${nameFocused ? "var(--orange-warm)" : "rgba(0,0,0,0.04)"}`,
            }}>
              <label htmlFor="name" className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: nameComplete ? "#22c55e" : "var(--blue-dark)" }}>
                  {nameComplete ? "✓" : "1"}
                </span>
                <span className="text-base font-bold" style={{ color: "var(--blue-dark)" }}>اسمك</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(233,162,59,0.1)", color: "var(--orange-warm)" }}>مطلوب</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="اكتب اسمك هنا..."
                className="w-full text-lg px-4 py-3 rounded-xl outline-none transition-colors"
                style={{ background: "var(--cream)", color: "var(--text-dark)" }}
                autoComplete="name"
                autoFocus
              />
              {errors.name && <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><span>⚠️</span> {errors.name}</p>}
            </div>
          </div>

          {/* Step 2: Message */}
          {step >= 2 && (
            <div
              className="transition-all duration-500"
              style={{ animation: "slideDown 0.5s ease forwards" }}
            >
              <div className="rounded-3xl p-6 transition-all duration-300" style={{
                background: "white",
                boxShadow: messageFocused ? "0 8px 40px rgba(18,59,93,0.12)" : "0 2px 12px rgba(0,0,0,0.04)",
                border: `2px solid ${messageFocused ? "var(--orange-warm)" : "rgba(0,0,0,0.04)"}`,
              }}>
                <label htmlFor="message" className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: messageComplete ? "#22c55e" : "var(--blue-dark)" }}>
                    {messageComplete ? "✓" : "2"}
                  </span>
                  <span className="text-base font-bold" style={{ color: "var(--blue-dark)" }}>كلمتين منك ليا</span>
                  <span className="text-xl">❤️</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(233,162,59,0.1)", color: "var(--orange-warm)" }}>مطلوب</span>
                </label>
                <textarea
                  ref={messageRef}
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setMessageFocused(true)}
                  onBlur={() => setMessageFocused(false)}
                  placeholder="اكتب اللي تحب تقوله..."
                  rows={4}
                  maxLength={MAX_MESSAGE + 10}
                  className="w-full text-lg px-4 py-3 rounded-xl outline-none transition-colors resize-none"
                  style={{ background: "var(--cream)", color: "var(--text-dark)" }}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.message ? (
                    <p className="text-sm text-red-500 flex items-center gap-1"><span>⚠️</span> {errors.message}</p>
                  ) : <span />}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(18,59,93,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((message.length / MAX_MESSAGE) * 100, 100)}%`,
                          background: message.length > MAX_MESSAGE ? "#ef4444" : message.length > MAX_MESSAGE * 0.8 ? "var(--orange-warm)" : "#22c55e",
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: message.length > MAX_MESSAGE ? "#ef4444" : "#aaa" }}>
                      {message.length}/{MAX_MESSAGE}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Extras */}
          {step >= 3 && (
            <div
              className="transition-all duration-500"
              style={{ animation: "slideDown 0.5s ease forwards" }}
            >
              <div className="rounded-3xl p-6" style={{
                background: "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                border: "2px solid rgba(0,0,0,0.04)",
              }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "var(--blue-dark)" }}>3</span>
                  <span className="text-base font-bold" style={{ color: "var(--blue-dark)" }}>حاجات اختيارية</span>
                </div>

                {/* University */}
                <div className="mb-5">
                  <label htmlFor="university" className="block text-sm font-semibold mb-2" style={{ color: "var(--text-dark)" }}>
                    جامعتك أو كيانك
                  </label>
                  <input
                    id="university"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="مثلاً: جامعة القاهرة"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                    style={{ background: "var(--cream)", color: "var(--text-dark)" }}
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-dark)" }}>
                    صورة تجمعنا؟
                  </label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="الصورة المختارة" className="w-32 h-32 object-cover rounded-xl" style={{ border: "2px solid rgba(0,0,0,0.06)" }} />
                      <button type="button" onClick={removeImage} className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg" aria-label="حذف الصورة">✕</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:scale-[1.01]"
                      style={{ borderColor: "rgba(18,59,93,0.12)", background: "rgba(233,162,59,0.02)" }}
                    >
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: "rgba(233,162,59,0.1)" }}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--orange-warm)" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <p className="text-sm" style={{ color: "#888" }}>اضغط لاختيار صورة</p>
                      <p className="text-xs mt-1" style={{ color: "#bbb" }}>JPG، PNG، WebP — حد أقصى 5 ميجا</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} className="hidden" />
                  {errors.image && <p className="mt-1 text-sm text-red-500">⚠️ {errors.image}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="p-4 rounded-2xl text-sm flex items-center gap-2" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
              <span>⚠️</span> {submitError}
            </div>
          )}

          {/* Submit button */}
          {step >= 3 && (
            <div style={{ animation: "slideDown 0.5s ease forwards" }}>
              <button
                type="submit"
                disabled={isSubmitting || !nameComplete || !messageComplete}
                className="w-full py-5 rounded-2xl text-white text-lg font-bold shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-0.5"
                style={{
                  background: isSubmitting || !nameComplete || !messageComplete
                    ? "#ccc"
                    : "linear-gradient(135deg, var(--blue-dark), #1a5a8a)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <span>سيب كلمتك في الدفتر</span>
                    <span style={{ animation: "pulse 2s infinite" }}>❤️</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs mt-3" style={{ color: "#bbb" }}>
                رسالتك هتظهر بعد مراجعتها من المسؤول
              </p>
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
