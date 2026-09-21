import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "دفتر ذكريات أحمد مهدي — مسؤول الميديا",
    template: "%s — دفتر الذكريات",
  },
  description:
    "دفتر ذكريات شخصي — اكتب ذكرى أو لحظة حلوة تفضل محفوظة، واستكشف الذكريات اللي شاركوها الناس هنا.",
  keywords: ["ذكريات", "دفتر ذكريات", "لحظات", "حكاية", "أحمد مهدي"],
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "دفتر ذكريات أحمد مهدي",
    description: "كل كلمة هنا جزء من الحكاية — سيب ذكريتك أو افتح واحدة عشوائية.",
    type: "website",
    url: "https://dafater-dhikriat.vercel.app",
    siteName: "دفتر الذكريات",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
