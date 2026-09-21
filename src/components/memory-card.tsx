"use client";

export interface MemoryCardData {
  id: string;
  name: string;
  message: string;
  nice_moment: string | null;
  image_url: string | null;
  created_at: string;
  show_name: boolean;
  show_nice_moment: boolean;
  show_image: boolean;
}

export type MemoryVariant = "quote" | "text" | "polaroid" | "image";

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const fmtShort = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("ar-EG", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
};

export function MemoryCard({
  m,
  variant = "quote",
  onOpen,
  className = "",
}: {
  m: MemoryCardData;
  variant?: MemoryVariant;
  onOpen?: () => void;
  className?: string;
}) {
  const hasImage = !!m.image_url && m.show_image !== false;
  let v = variant;
  if ((v === "polaroid" || v === "image") && !hasImage) v = "text";

  const showName = m.show_name !== false && !!m.name;
  const showMoment = m.show_nice_moment !== false && !!m.nice_moment;
  const imgAlt = showName ? `صورة من ${m.name}` : "صورة من الذكرى";

  return (
    <article
      className={`m-card m-card-${v} ${onOpen ? "m-card-click" : ""} ${className}`}
      onClick={onOpen}
      aria-label={showName ? `ذكرى من ${m.name}` : "ذكرى"}
    >
      {v === "polaroid" && hasImage && (
        <div className="m-polaroid">
          <img loading="lazy" src={m.image_url || undefined} alt={imgAlt} className="m-pol-img" />
          <div className="m-pol-caption">
            {showName && <span className="m-card-name">{m.name}</span>}
            <span className="m-card-date">{fmtShort(m.created_at)}</span>
          </div>
        </div>
      )}

      {v === "image" && hasImage && (
        <img loading="lazy" src={m.image_url || undefined} alt={imgAlt} className="m-img-top" />
      )}

      {v === "quote" && <div className="m-quote-mark">&rdquo;</div>}

      <p className="m-card-message">{m.message}</p>

      {showMoment && v !== "polaroid" && (
        <div className="m-card-moment">
          <span className="m-moment-tag">&#10024; موقف حلو</span>
          <p>{m.nice_moment}</p>
        </div>
      )}

      {v !== "polaroid" && (
        <div className="m-card-footer">
          {showName && <span className="m-card-name">— {m.name}</span>}
          <span className="m-card-date">{fmtDate(m.created_at)}</span>
        </div>
      )}
    </article>
  );
}