import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = verifyAdminToken(getTokenFromRequest(request));
    const { id } = await params;
    let query = supabaseAdmin.from("memories").select("*").eq("id", id);
    if (!isAdmin) query = query.eq("status", "approved");
    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json(
        { error: "الذكرى مش موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({ memory: data });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminToken(getTokenFromRequest(request))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, is_favorite, show_name, show_nice_moment, show_image } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (typeof is_favorite === "boolean") updateData.is_favorite = is_favorite;
    if (typeof show_name === "boolean") updateData.show_name = show_name;
    if (typeof show_nice_moment === "boolean") updateData.show_nice_moment = show_nice_moment;
    if (typeof show_image === "boolean") updateData.show_image = show_image;

    const { data, error } = await supabaseAdmin
      .from("memories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: data });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminToken(getTokenFromRequest(request))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    // Get the memory first to delete image if exists
    const { data: memory } = await supabaseAdmin
      .from("memories")
      .select("image_url")
      .eq("id", id)
      .single();

    // Delete image from storage if exists
    if (memory?.image_url) {
      const urlParts = memory.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabaseAdmin.storage
        .from("memory-images")
        .remove([fileName]);
    }

    // Delete the memory
    const { error } = await supabaseAdmin
      .from("memories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
