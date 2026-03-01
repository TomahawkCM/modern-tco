import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSplitPersonSchema } from "@/server/schemas/splits";
import { listSplitPersons, createSplitPerson } from "@/server/splits";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const persons = await listSplitPersons(supabase, user.id);
    return NextResponse.json(persons);
  } catch {
    return NextResponse.json({ error: "Failed to fetch split persons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSplitPersonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const person = await createSplitPerson(supabase, user.id, parsed.data);
    return NextResponse.json(person, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create split person" }, { status: 500 });
  }
}
