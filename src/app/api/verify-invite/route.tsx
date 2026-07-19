import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();
  const supabase = createClient();

  const { data } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (!data) {
    return NextResponse.json({ valid: false });
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return NextResponse.json({ valid: false });
  }

  // Zwiększ licznik użyć
  await supabase
    .from("invite_codes")
    .update({ used_count: data.used_count + 1 })
    .eq("id", data.id);

  return NextResponse.json({ valid: true });
}