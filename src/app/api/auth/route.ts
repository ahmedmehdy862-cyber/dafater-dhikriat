import { NextRequest, NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin-auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(clientKey(request, "login"), 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "محاولات كتير. استنى شوية وحاول تاني." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "إعدادات المسؤول غير مكتملة" },
        { status: 500 }
      );
    }

    if (email === adminEmail && password === adminPassword) {
      const token = createAdminToken(email);

      const response = NextResponse.json({ success: true, token });

      // Set httpOnly cookie for security
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "بريد إلكتروني أو كلمة مرور غير صحيحة" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
