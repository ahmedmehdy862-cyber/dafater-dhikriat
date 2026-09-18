import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "دفتر ذكريات أحمد مهدي — مسؤول الميديا",
  description: "دفتر ذكريات أحمد مهدي مسؤول الميديا — اكتبلي كلمتين تحب أفتكرهم منك",
  icons: { icon: "/favicon.ico" },
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
