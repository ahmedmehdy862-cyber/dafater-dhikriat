import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [email] = decoded.split(":");
    return email === process.env.ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { data: memories, error } = await supabaseAdmin
      .from("memories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats
    const total = memories?.length || 0;
    const approved = memories?.filter((m) => m.status === "approved").length || 0;
    const pending = memories?.filter((m) => m.status === "pending").length || 0;
    const rejected = memories?.filter((m) => m.status === "rejected").length || 0;
    const hidden = memories?.filter((m) => m.status === "hidden").length || 0;
    const universities = new Set(
      memories?.filter((m) => m.university).map((m) => m.university)
    ).size;

    return NextResponse.json({
      memories,
      stats: { total, approved, pending, rejected, hidden, universities },
    });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
