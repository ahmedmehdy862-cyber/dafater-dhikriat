import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(getTokenFromRequest(request))) {
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
    const universities = 0;

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
