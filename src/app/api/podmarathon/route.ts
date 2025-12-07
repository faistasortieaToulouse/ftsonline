import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";

const CACHE_FILE = path.join(process.cwd(), "cache_podmarathon.json");
const RSS_URL = "https://feed.ausha.co/BnYn5Uw5W3WO";

export async function GET() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      const data = JSON.parse(raw);
      return NextResponse.json({ data });
    }

    // Si cache inexistant, fetch RSS
    const res = await fetch(RSS_URL);
    if (!res.ok) throw new Error("Impossible de récupérer le flux RSS.");
    const text = await res.text();

    const parsed = await xml2js.parseStringPromise(text);
    const items = parsed.rss.channel[0].item || [];

    const episodes = items.map((item: any) => ({
      titre: item.title[0] || "Sans titre",
      date: item.pubDate[0] || "",
      description: item["content:encoded"]?.[0] || item.description?.[0] || "",
      audioUrl: item.enclosure?.[0]?.$.url || "",
    }));

    // Sauvegarde cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(episodes, null, 2), "utf-8");

    return NextResponse.json({ data: episodes });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ data: [], error: err.message }, { status: 500 });
  }
}
