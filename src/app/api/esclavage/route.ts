import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mondecategories",
      "esclavage.json"
    );

    const file = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(file);

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur chargement esclavage" },
      { status: 500 }
    );
  }
}
