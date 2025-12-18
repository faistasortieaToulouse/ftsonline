// src/app/api/comdt/route.ts
import { NextResponse } from "next/server";

const RSS_URL = "https://www.comdt.org/events/feed/?post_type=tribe_events";

export const revalidate = 3600;

function extract(tag: string, block: string): string {
  const match = block.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
  );
  return match ? match[1].trim() : "";
}

// 🔹 Conversion date RSS → ISO
function parseDate(dateStr: string): string | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export async function GET() {
  try {
    const res = await fetch(RSS_URL, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `COMDT RSS fetch failed (${res.status})` },
        { status: 502 }
      );
    }

    const xml = await res.text();

    // 🔹 Extraction brute des <item>
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = items
      .map((item) => {
        const title = extract("title", item);
        const link = extract("link", item);
        const description =
          extract("content:encoded", item) || extract("description", item);
        const pubDate = extract("pubDate", item);

        const dateIso = parseDate(pubDate);
        if (!dateIso) return null;

        return {
          id: link || title,
          title,
          description,
          link,
          date: dateIso,
          source: "COMDT",
        };
      })
      // 🔹 Garder uniquement aujourd’hui et futur
      .filter((ev): ev is NonNullable<typeof ev> => {
        const d = new Date(ev.date);
        return d >= today;
      });

    return NextResponse.json({
      total: records.length,
      events: records,
    });
  } catch (err) {
    console.error("COMDT RSS error:", err);
    return NextResponse.json(
      { total: 0, events: [], error: "Internal Server Error (COMDT RSS)" },
      { status: 500 }
    );
  }
}
