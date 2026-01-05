import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "hierarchie",
    "hierarchie Sunnite Ottoman.json"
  );

  const data = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(data);

  return NextResponse.json(json);
}
