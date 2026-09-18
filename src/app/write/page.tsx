"use client";

import { useState, useRef } from "react";
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
  const msgValid = message.trim().length >= 10 && message.length <= MAX_MESSAGE;
  const step1Done = nameValid;
  const step2Done = msgValid;
  const step3Done = step1Done && step2Done;

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
    setErrors((p) => {
      const n = { ...p };
      delete n.image;
      return n;
    });
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
    if (!name.trim() || name.trim().length < 2)
      e.name = "الاسم لازم يكون حرفين على الأقل";
    if (!message.trim() || message.trim().length < 10)
      e.message = "الرسالة لازم يكون فيها 10 أحرف على الأقل";
    if (message.length > MAX_MESSAGE)
      e.message = `الرسالة مش ممكن تتجاوز ${MAX_MESSAGE} حرف`;
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
      setSubmitError(
        err instanceof Error ? err.message : "حصل مشكلة، حاول تاني"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = [
    { n: 1, label: "الاسم", done: step1Done },
    { n: 2, label: "رسالتك", done: step2Done },
    { n: 3, label: "اختيارات", done: step3Done },
  ];

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--cream)" }}
    >
      <div className="pattern-dots absolute inset-0 pointer-events-none opacity-40" />
      <div
        className="blob-blue absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-sm pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="blob-blue absolute bottom-20 -left-16 w-56 h-56 rounded-full opacity-20 blur-sm pointer-events-none"
        aria-hidden="true"
      />

      <header
        className="sticky top-0 z-30 glass border-b"
        style={{ borderColor: "rgba(15,43,70,0.08)" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-70 active:scale-95"
            style={{ color: "var(--blue-dark)" }}
          >
            <svg
              className="w-4 h-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
            الرجوع
          </Link>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--orange-warm)" }}
          >
            كلمة جديدة
          </span>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="flex items-center gap-1 sm:gap-3 mb-8 sm:mb-10" aria-label="خطوات الإدخال">
          {steps.map((s, i) => (
            <div key={s.n} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div className="w-full flex items-center gap-2">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
                    style={{
                      background: s.done ? "var(--success)" : "var(--blue-dark)",
                      color: "white",
                      boxShadow: s.done
                        ? "0 2px 12px rgba(5,150,105,0.4)"
                        : "0 1px 4px rgba(15,43,70,0.15)",
                    }}
                  >
                    {s.done ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      s.n
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold hidden sm:inline whitespace-nowrap"
                    style={{
                      color: s.done ? "var(--success)" : "var(--text-muted, #6b7280)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
              <div
                className="h-1 w-full rounded-full mt-2 transition-all duration-500"
                style={{
                  background: s.done ? "var(--success)" : "rgba(15,43,70,0.1)",
                }}
              />
            </div>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <section
            className="card p-4 sm:p-6 anim-fade-up"
            style={{ animationDelay: "0.05s", animationFillMode: "backwards" }}
          >
            <label htmlFor="name" className="flex items-center gap-2 mb-3">
              <span
                className="text-base font-bold"
                style={{ color: "var(--blue-dark)" }}
              >
                اسمك
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--orange-light)",
                  color: "var(--orange-warm)",
                }}
              >
                مطلوب
              </span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك..."
              className="input"
              autoFocus
              autoComplete="name"
            />
            {errors.name && (
              <p
                className="mt-2 text-sm font-medium flex items-center gap-1"
                style={{ color: "var(--danger)" }}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </section>

          <section
            className="card p-4 sm:p-6 anim-fade-up"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <label htmlFor="message" className="flex items-center gap-2 mb-3">
              <span
                className="text-base font-bold"
                style={{ color: "var(--blue-dark)" }}
              >
                رسالتك ليا
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--orange-light)",
                  color: "var(--orange-warm)",
                }}
              >
                مطلوب
              </span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب اللي تحب تقوله..."
              rows={4}
              className="input resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              {errors.message ? (
                <p
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: "var(--danger)" }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                  {errors.message}
                </p>
              ) : (
                <span />
              )}
              <span
                className="text-xs font-medium tabular-nums"
                style={{
                  color:
                    message.length > MAX_MESSAGE
                      ? "var(--danger)"
                      : "var(--text-light, #9ca3af)",
                }}
              >
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </section>

          <section
            className="card p-4 sm:p-6 anim-fade-up"
            style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
          >
            <p
              className="text-base font-bold mb-5"
              style={{ color: "var(--blue-dark)" }}
            >
              اختيارات إضافية
            </p>

            <div className="mb-5">
              <label
                htmlFor="university"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--blue-dark)" }}
              >
                جامعتك أو كيانك
              </label>
              <input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="مثلاً: جامعة القاهرة"
                className="input"
                autoComplete="organization"
              />
            </div>

            <div className="mb-5">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--blue-dark)" }}
              >
                صورة تجمعنا
              </label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl"
                    style={{
                      border: "2px solid var(--border, #e5e7eb)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold transition-transform hover:scale-110 active:scale-95"
                    style={{ background: "var(--danger)" }}
                    aria-label="حذف الصورة"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-[var(--blue-medium,#1a5276)] hover:bg-[var(--orange-light,#fdf2dc)]/50 active:scale-[0.98]"
                  style={{ borderColor: "var(--border, #d1d5db)" }}
                >
                  <svg
                    className="w-10 h-10 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="var(--text-light, #9ca3af)"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted, #6b7280)" }}
                  >
                    اضغط لاختيار صورة
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-light, #9ca3af)" }}
                  >
                    JPG، PNG، WebP — حد أقصى 5 ميجا
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              {errors.image && (
                <p
                  className="mt-2 text-sm font-medium flex items-center gap-1"
                  style={{ color: "var(--danger)" }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                  {errors.image}
                </p>
              )}
            </div>

            <div
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl"
              style={{ background: "var(--cream)" }}
            >
              <div className="min-w-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--blue-dark)" }}
                >
                  رسالتي للجمهور
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted, #6b7280)" }}
                >
                  {isPublic
                    ? "رسالتك هتظهر للجميع"
                    : "رسالتك هتفضل خاصة بالمسؤول"}
                </p>
              </div>
              <button
                type="button"
                className={`toggle-wrap ${isPublic ? "on" : ""}`}
                onClick={() => setIsPublic(!isPublic)}
                role="switch"
                aria-checked={isPublic}
                aria-label="إظهار الرسالة للجمهور"
              />
            </div>
          </section>

          {submitError && (
            <div
              className="p-4 rounded-xl text-sm font-medium flex items-center gap-2 anim-fade-up"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "var(--danger)",
              }}
              role="alert"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !nameValid || !msgValid}
            className="btn btn-primary btn-lg w-full disabled:opacity-40 disabled:cursor-not-allowed anim-fade-up flex items-center justify-center gap-2"
            style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
                جاري الإرسال...
              </>
            ) : (
              "سيب كلمتك في الدفتر ❤️"
            )}
          </button>

          <p
            className="text-center text-xs pb-4"
            style={{ color: "var(--text-light, #9ca3af)" }}
          >
            رسالتك هتظهر بعد مراجعتها من المسؤول
          </p>
        </form>
      </div>
    </main>
  );
}
