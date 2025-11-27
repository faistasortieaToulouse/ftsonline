import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "podcasts-cache.json");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Cache absent — lance /api/podcasts/update-cache" },
        { status: 404 }
      );
    }

    const episodes = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    return NextResponse.json({ data: episodes }, { status: 200 });
  } catch (err) {
    console.error("Erreur API podcasts", err);
    return NextResponse.json(
      { error: "Erreur interne API podcasts" },
      { status: 500 }
    );
  }
}
