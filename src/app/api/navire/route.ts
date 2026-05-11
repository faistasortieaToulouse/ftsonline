import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "technologie", "navire.json");
    const fileContent = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de lecture des données" }, { status: 500 });
  }
}
