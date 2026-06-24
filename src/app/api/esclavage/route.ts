import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Cette ligne force Next.js / Vercel à inclure le dossier data dans le bundle
export const config = {
  unstable_includeFiles: ["data/mondecategories/esclavage.json"],
};

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
