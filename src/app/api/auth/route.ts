import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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
      // Generate a simple token (in production, use JWT or session)
      const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");

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
