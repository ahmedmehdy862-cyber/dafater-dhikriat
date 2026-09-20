import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Count only
    if (searchParams.get("count") === "true") {
      const { count } = await supabaseAdmin
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");
      return NextResponse.json({ count: count ?? 0 });
    }

    // Random memory
    if (searchParams.get("random") === "true") {
      const { data } = await supabaseAdmin
        .from("memories")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!data || data.length === 0) {
        return NextResponse.json({ memory: null });
      }

      const idx = Math.floor(Math.random() * data.length);
      return NextResponse.json({ memory: data[idx] });
    }

    // List memories (approved only, or all for admin fallback)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;
    const showAll = searchParams.get("all") === "true";

    let query = supabaseAdmin
      .from("memories")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (!showAll) {
      query = query.eq("status", "approved");
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      memories: data,
      total: count ?? 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nice_moment, message, image_url, is_public } = body;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "الاسم لازم يكون حرفين على الأقل" },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: "الرسالة لازم يكون فيها 10 أحرف على الأقل" },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: "الرسالة مش ممكن تتجاوز 500 حرف" },
        { status: 400 }
      );
    }

    // Sanitize input
    const dangerousPattern = /<[^>]*>|javascript:|on\w+\s*=/i;
    if (dangerousPattern.test(message) || dangerousPattern.test(name)) {
      return NextResponse.json(
        { error: "الرسالة فيها محتوى غير مسموح بيه" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("memories")
      .insert({
        name: name.trim(),
        message: message.trim(),
        image_url: image_url || null,
        is_public: is_public !== false,
        consent_to_publish: true,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
