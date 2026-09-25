import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function ensureBucket() {
  const { error } = await supabaseAdmin.storage.createBucket("backups", {
    public: false,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) throw error;
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await ensureBucket();

    const all: unknown[] = [];
    let from = 0;
    for (;;) {
      const { data, error } = await supabaseAdmin
        .from("memories")
        .select("*")
        .order("created_at", { ascending: true })
        .range(from, from + 999);
      if (error) throw error;
      all.push(...(data || []));
      if (!data || data.length < 1000) break;
      from += 1000;
    }

    const payload = JSON.stringify(
      {
        backed_up_at: new Date().toISOString(),
        count: all.length,
        memories: all,
      },
      null,
      2
    );

    const date = new Date().toISOString().slice(0, 10);
    const path = `memories-${date}.json`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("backups")
      .upload(path, payload, { contentType: "application/json", upsert: true });
    if (upErr) throw upErr;

    // keep last 30 daily backups
    const { data: files } = await supabaseAdmin.storage
      .from("backups")
      .list("", { limit: 100 });
    const olds = (files || [])
      .filter((f) => f.name.startsWith("memories-") && f.name !== path)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (olds.length > 29) {
      await supabaseAdmin.storage
        .from("backups")
        .remove(olds.slice(0, olds.length - 29).map((f) => f.name));
    }

    return NextResponse.json({ ok: true, count: all.length, path });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "backup failed" },
      { status: 500 }
    );
  }
}
