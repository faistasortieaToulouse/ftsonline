import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  try {
    const file = path.join(process.cwd(), "cache", "meetup-sortie.json");
    const raw = await readFile(file, "utf8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "No cache available" }, { status: 500 });
  }
}
