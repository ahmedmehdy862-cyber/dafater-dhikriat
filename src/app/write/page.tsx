"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MemoryCard, type MemoryCardData } from "@/components/memory-card";

const MIN = 30;
const DRAFT_KEY = "dafater_draft_v1";

type Step = "welcome" | "name" | "message" | "moment" | "image" | "preview";

const STEPS: { key: Step; label: string }[] = [
  { key: "name", label: "الاسم" },
  { key: "message", label: "الذكرى" },
  { key: "moment", label: "الموقف" },
  { key: "image", label: "الصورة" },
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load-error"));
    };
    img.src = url;
  });
}

function fileToDataURL(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], `memory-${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
}

async function compressImage(f: File): Promise<File> {
  if (f.type === "image/gif" || f.size <= 400 * 1024) return f;
  const img = await loadImage(f);
  const MAX = 1280;
  let { width, height } = img;
  if (width > MAX || height > MAX) {
    const r = Math.min(MAX / width, MAX / height);
    width = Math.round(width * r);
    height = Math.round(height * r);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return f;
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.86));
  if (!blob) return f;
  return new File([blob], f.name.replace(/\.[^.]+$/i, "") + ".jpg", { type: "image/jpeg" });
}

export default function WritePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [moment, setMoment] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draftFound, setDraftFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imgError, setImgError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  const nameOk = name.trim().length >= 2;
  const msgOk = message.trim().length >= MIN;

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const d = JSON.parse(raw);
        if (d && (d.name?.trim() || d.message?.trim() || d.moment?.trim())) {
          setDraftFound(true);
        }
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step === "welcome") return;
    try {
      const img = imagePreview && imagePreview.length < 2_500_000 ? imagePreview : null;
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ name, message, moment, isPublic, image: img })
      );
    } catch {
      /* ignore quota errors */
    }
  }, [name, message, moment, isPublic, imagePreview, step]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (step === "name") nameRef.current?.focus();
      if (step === "message") msgRef.current?.focus();
    }, 120);
    return () => clearTimeout(t);
  }, [step]);

  function resumeDraft() {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      setName(d.name || "");
      setMessage(d.message || "");
      setMoment(d.moment || "");
      setIsPublic(d.isPublic !== false);
      if (d.image) setImagePreview(d.image);
      setDraftFound(false);
      setStep(d.message?.trim() ? "message" : "name");
    } catch {
      setDraftFound(false);
      setStep("name");
    }
  }

  function startFresh() {
    localStorage.removeItem(DRAFT_KEY);
    setDraftFound(false);
    setName("");
    setMessage("");
    setMoment("");
    setImageFile(null);
    setImagePreview(null);
    setIsPublic(true);
    setStep("name");
  }

  async function handleFile(f: File) {
    setImgError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)) {
      setImgError("الصورة لازم تكون JPG أو PNG أو WebP");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setImgError("الحجم الأقصى للصورة 5 ميجا");
      return;
    }
    try {
      const compressed = await compressImage(f);
      const preview = await fileToDataURL(compressed);
      setImageFile(compressed);
      setImagePreview(preview);
    } catch {
      setImgError("حصلت مشكلة في قراءة الصورة");
    }
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    handleFile(f);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    setImgError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function nextFromName() {
    if (!nameOk) return;
    setSubmitError("");
    setStep("message");
  }

  function nextFromMessage() {
    if (!msgOk) return;
    setSubmitError("");
    setStep("moment");
  }

  function nextFromMoment() {
    setSubmitError("");
    setStep("image");
  }

  function nextFromImage() {
    setSubmitError("");
    setStep("preview");
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      let imageUrl = "";
      let payloadFile = imageFile;
      if (!payloadFile && imagePreview) payloadFile = await dataUrlToFile(imagePreview);
      if (payloadFile) {
        const fd = new FormData();
        fd.append("file", payloadFile);
        const ur = await fetch("/api/upload", { method: "POST", body: fd });
        if (!ur.ok) throw new Error("upload-failed");
        imageUrl = (await ur.json()).url;
      }
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          nice_moment: moment.trim() || undefined,
          image_url: imageUrl || undefined,
          is_public: isPublic,
        }),
      });
      if (!res.ok) throw new Error("submit-failed");
      localStorage.removeItem(DRAFT_KEY);
      sessionStorage.setItem("dafater_writer_name", name.trim());
      router.push("/success");
    } catch {
      setSubmitError("حصلت مشكلة بسيطة أثناء حفظ الذكرى. جرّب مرة تانية، واللي كتبته لسه موجود.");
      setSubmitting(false);
    }
  }

  const previewMemory: MemoryCardData = {
    id: "preview",
    name,
    message,
    nice_moment: moment.trim() || null,
    image_url: imagePreview || null,
    created_at: new Date().toISOString(),
    show_name: true,
    show_nice_moment: true,
    show_image: true,
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <main className="wiz-page">
      <header className="wiz-nav">
        <div className="wiz-nav-inner">
          <Link href="/" className="wiz-nav-link">
            <svg className="rtl-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            الرئيسية
          </Link>
          <Link href="/memories" className="wiz-nav-link">مشاهدة الذكريات &#128317;</Link>
        </div>
      </header>

      <div className="wiz-wrap">
        {step === "welcome" && (
          <div className="wiz-card wiz-center anim-wiz-in" key="welcome">
            <div className="wiz-heart">&#128158;</div>
            <h1 className="wiz-title">عندك ذكرى حابب تسيبها؟</h1>
            <p className="wiz-sub">
              يمكن تكون كلمة صغيرة...<br />
              لكنها بالنسبة لحد تاني هتفضل ذكرى كبيرة.
            </p>

            {draftFound && (
              <div className="wiz-draft">
                <p className="wiz-draft-title">لقيّنا ذكرى بدأت تكتبها...</p>
                <p className="wiz-draft-sub">تحب تكملها؟</p>
                <div className="wiz-draft-actions">
                  <button onClick={resumeDraft} className="btn btn-primary">كمّل الكتابة</button>
                  <button onClick={startFresh} className="btn btn-outline">ابدأ من جديد</button>
                </div>
              </div>
            )}

            <button onClick={() => setStep("name")} className="btn btn-primary btn-lg wiz-cta">
              ابدأ كتابة الذكرى
            </button>
          </div>
        )}

        {step !== "welcome" && (
          <div className="wiz-progress" aria-hidden>
            {STEPS.map((s, i) => (
              <div key={s.key} className={`wiz-prog-seg ${i <= stepIndex ? "done" : ""}`} />
            ))}
          </div>
        )}

        {/* Step: name */}
        {step === "name" && (
          <div className="wiz-card anim-wiz-in" key="name">
            <p className="wiz-step-label">الخطوة ١ من ٤</p>
            <label htmlFor="wiz-name" className="wiz-label">نبدأ باسمك؟</label>
            <input
              id="wiz-name"
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك"
              className="input wiz-input"
              autoComplete="name"
            />
            <p className="wiz-helper">الاسم اللي تحب يظهر مع ذكريتك.</p>
            {!nameOk && name.length > 0 && (
              <p className="wiz-error">الاسم لازم يكون حرفين على الأقل</p>
            )}
            <div className="wiz-btn-row">
              <button onClick={() => setStep("welcome")} className="btn btn-ghost">رجوع</button>
              <button
                onClick={nextFromName}
                disabled={!nameOk}
                className={`btn btn-primary ${nameOk ? "" : "wiz-disabled"}`}
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step: message */}
        {step === "message" && (
          <div className="wiz-card anim-wiz-in" key="message">
            <p className="wiz-step-label">الخطوة ٢ من ٤</p>
            <label htmlFor="wiz-msg" className="wiz-label">إيه الذكرى اللي حابب تسيبها؟</label>
            <textarea
              id="wiz-msg"
              ref={msgRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={"اكتب براحتك...\nموقف، كلمة، شخص، أو حتى حاجة صغيرة عمرك ما نسيتها."}
              rows={7}
              className="input wiz-textarea"
            />
            <div className="wiz-counter-row">
              <span className={`wiz-counter ${msgOk ? "ok" : ""}`}>
                {message.length} حرف{!msgOk && ` — محتاج ${MIN - message.length} تاني`}
              </span>
            </div>
            <div className="wiz-btn-row">
              <button onClick={() => setStep("name")} className="btn btn-ghost">رجوع</button>
              <button
                onClick={nextFromMessage}
                disabled={!msgOk}
                className={`btn btn-primary ${msgOk ? "" : "wiz-disabled"}`}
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step: moment */}
        {step === "moment" && (
          <div className="wiz-card anim-wiz-in" key="moment">
            <p className="wiz-step-label">الخطوة ٣ من ٤ — اختياري</p>
            <label htmlFor="wiz-moment" className="wiz-label">معاك موقف حلو حابب تحكيه؟</label>
            <textarea
              id="wiz-moment"
              value={moment}
              onChange={(e) => setMoment(e.target.value)}
              placeholder="موقف صغير حصل وكنت حابب يكون محفوظ..."
              rows={4}
              className="input wiz-textarea"
            />
            <p className="wiz-helper">حاجة اختيارية خالص — لو مش فاكر حاجة عادي جدًا.</p>
            <div className="wiz-btn-row">
              <button onClick={() => setStep("message")} className="btn btn-ghost">رجوع</button>
              {moment.trim() ? (
                <button onClick={nextFromMoment} className="btn btn-primary">التالى</button>
              ) : (
                <button onClick={nextFromMoment} className="btn btn-outline">تخطي</button>
              )}
            </div>
          </div>
        )}

        {/* Step: image */}
        {step === "image" && (
          <div className="wiz-card anim-wiz-in" key="image">
            <p className="wiz-step-label">الخطوة ٤ من ٤ — اختياري</p>
            <label className="wiz-label">عندك صورة تحب تحفظها مع الذكرى؟</label>

            {imagePreview ? (
              <div className="wiz-img-prev">
                <img src={imagePreview} alt="معاينة الصورة" className="wiz-img" />
                <button onClick={removeImage} className="wiz-img-remove" aria-label="حذف الصورة">
                  ✕
                </button>
              </div>
            ) : (
              <div
                className={`wiz-drop ${dragging ? "drag" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                role="button"
                aria-label="اختيار صورة"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b19a78" strokeWidth="1.2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <p className="wiz-drop-title">اضغط لاختيار صورة</p>
                <p className="wiz-drop-sub">أو اسحبها هنا على الكمبيوتر</p>
                <p className="wiz-drop-note">JPG · PNG · WebP — حتى ٥ ميجا</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onImage}
              className="hidden"
            />
            {imgError && <p className="wiz-error">{imgError}</p>}

            <div className="wiz-btn-row wiz-btns-split">
              <div className="wiz-btns-left">
                <button onClick={() => setStep("moment")} className="btn btn-ghost">رجوع</button>
                <button onClick={nextFromImage} className="btn btn-outline">تخطي</button>
              </div>
              <button onClick={nextFromImage} className="btn btn-primary">التالي</button>
            </div>
          </div>
        )}

        {/* Step: preview */}
        {step === "preview" && (
          <div className="anim-wiz-in" key="preview">
            <div className="wiz-card wiz-preview-head">
              <h2 className="wiz-title wiz-title-sm">دي الذكرى اللي هتفضل</h2>
              <p className="wiz-sub wiz-sub-sm">شكلها في معرض الذكريات هيكون قريب من كده بالظبط.</p>
            </div>

            <div className="wiz-preview-paper">
              <MemoryCard m={previewMemory} variant="quote" />
            </div>

            {!nameOk || !msgOk ? (
              <div className="wiz-card">
                <p className="wiz-error">لاحظ إن فيه بيانات ناقصة</p>
                <div className="wiz-btn-row">
                  <button onClick={() => setStep("message")} className="btn btn-primary">راجع الذكرى</button>
                </div>
              </div>
            ) : (
              <div className="wiz-card">
                <p className="wiz-thanks">
                  &#129525; شكرًا ليك {name.trim() ? `يا ${name.trim()}` : "من القلب"} — اللي كتبته هيفضل محفوظ هنا.
                </p>
                <div className="wiz-vis-row">
                  <div>
                    <p className="wiz-vis-title">رسالتي للجمهور</p>
                    <p className="wiz-vis-sub">{isPublic ? "هتظهر في معرض الذكريات" : "هتفضل في الدفتر بس"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`toggle-wrap ${isPublic ? "on" : ""}`}
                    role="switch"
                    aria-checked={isPublic}
                    aria-label="رسالتي للجمهور"
                  />
                </div>

                {submitError && (
                  <div className="wiz-submit-error" role="alert">
                    {submitError}
                  </div>
                )}

                <div className="wiz-btn-row">
                  <button onClick={() => setStep("image")} className="btn btn-ghost">تعديل الذكرى</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn btn-primary btn-lg wiz-save"
                  >
                    {submitting ? "بنحفظ الذكرى..." : "حفظ الذكرية 🤍"}
                  </button>
                </div>
                <p className="wiz-note">ذكرتك هتظهر بعد موافقة المسؤول عليها.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {submitting && (
        <div className="wiz-overlay">
          <div className="spinner spinner-dark" />
          <p>بنحفظ الذكرى...</p>
        </div>
      )}
    </main>
  );
}