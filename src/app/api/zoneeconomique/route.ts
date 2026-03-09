import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mondecategories",
      "zoneeconomique.json"
    );

    const file = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(file);

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lecture zones économiques" },
      { status: 500 }
    );
  }
}
