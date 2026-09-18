"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_MESSAGE = 500;

export default function WritePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "الصورة لازم تكون JPG أو PNG أو WebP",
      }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "حجم الصورة مش م يزيد عن 5 ميجا",
      }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "الاسم لازم يكون حرفين على الأقل";
    }
    if (name.trim().length > 100) {
      newErrors.name = "الاسم طويل أوي";
    }
    if (!message.trim() || message.trim().length < 10) {
      newErrors.message = "الرسالة لازم يكون فيها 10 أحرف على الأقل";
    }
    if (message.length > MAX_MESSAGE) {
      newErrors.message = `الرسالة مش ممكن تتجاوز ${MAX_MESSAGE} حرف`;
    }
    if (!consent) {
      newErrors.consent = "لازم توافق على عرض رسالتك في الدفتر";
    }

    // Sanitize - check for HTML/JS
    const dangerousPattern = /<[^>]*>|javascript:|on\w+\s*=/i;
    if (dangerousPattern.test(message) || dangerousPattern.test(name)) {
      newErrors.message = "الرسالة فيها محتوى غير مسموح بيه";
    }

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

      // Upload image if exists
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(uploadData.error || "فشل رفع الصورة");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Submit memory
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          university: university.trim() || undefined,
          message: message.trim(),
          image_url: imageUrl || undefined,
          consent_to_publish: consent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل إرسال الرسالة");
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

  return (
    <main className="min-h-screen paper-bg">
      {/* Header */}
      <div className="bg-[var(--blue-dark)] text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 text-sm"
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
            الرجوع للرئيسية
          </Link>
          <h1 className="text-2xl font-bold">اكتب ذكريتك</h1>
          <p className="text-white/70 mt-1">
            كلمتين منك يفضلوا في الدفتر ❤️
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-[var(--text-dark)] mb-2"
            >
              اسمك <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك هنا"
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[var(--gray-200)] focus:border-[var(--orange-warm)] focus:outline-none transition-colors text-[var(--text-dark)] placeholder:text-[var(--gray-400)]"
              autoComplete="name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* University */}
          <div>
            <label
              htmlFor="university"
              className="block text-sm font-semibold text-[var(--text-dark)] mb-2"
            >
              جامعتك أو كيانك{" "}
              <span className="text-[var(--gray-400)] font-normal">
                (اختياري)
              </span>
            </label>
            <input
              id="university"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="مثلاً: جامعة القاهرة"
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[var(--gray-200)] focus:border-[var(--orange-warm)] focus:outline-none transition-colors text-[var(--text-dark)] placeholder:text-[var(--gray-400)]"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-[var(--text-dark)] mb-2"
            >
              كلمتين منك ليا ❤️ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب اللي تحب تقوله..."
              rows={5}
              maxLength={MAX_MESSAGE + 10}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[var(--gray-200)] focus:border-[var(--orange-warm)] focus:outline-none transition-colors text-[var(--text-dark)] placeholder:text-[var(--gray-400)] resize-none notebook-lines"
            />
            <div className="flex justify-between mt-1">
              {errors.message ? (
                <p className="text-sm text-red-500">{errors.message}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ${
                  message.length > MAX_MESSAGE
                    ? "text-red-500"
                    : "text-[var(--gray-400)]"
                }`}
              >
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-dark)] mb-2">
              صورة تجمعنا؟{" "}
              <span className="text-[var(--gray-400)] font-normal">
                (اختيارية)
              </span>
            </label>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="الصورة المختارة"
                  className="w-40 h-40 object-cover rounded-xl border-2 border-[var(--gray-200)]"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-md"
                  aria-label="حذف الصورة"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[var(--gray-300)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--orange-warm)] hover:bg-[var(--orange-warm)] hover:bg-opacity-5 transition-all"
              >
                <svg
                  className="w-10 h-10 mx-auto text-[var(--gray-400)] mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <p className="text-sm text-[var(--gray-500)]">
                 اضغط هنا لاختيار صورة
                </p>
                <p className="text-xs text-[var(--gray-400)] mt-1">
                  JPG، PNG، WebP — حد أقصى 5 ميجا
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-500">{errors.image}</p>
            )}
          </div>

          {/* Consent */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-[var(--gray-300)] text-[var(--blue-dark)] focus:ring-[var(--orange-warm)] accent-[var(--blue-dark)]"
              />
              <span className="text-sm text-[var(--gray-600)] group-hover:text-[var(--text-dark)] transition-colors">
                أوافق على عرض رسالتي في دفتر الذكريات للزوار الآخرين
              </span>
            </label>
            {errors.consent && (
              <p className="mt-1 text-sm text-red-500">{errors.consent}</p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-[var(--blue-dark)] text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-[var(--blue-light)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ borderTopColor: "white" }} />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <span>سيب كلمتك في الدفتر</span>
                <span>❤️</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
