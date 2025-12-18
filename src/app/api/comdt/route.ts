import { NextResponse } from "next/server";

const RSS_URL = "https://www.comdt.org/events/feed/?post_type=tribe_events";

export async function GET() {
  try {
    const res = await fetch(RSS_URL, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `RSS fetch failed (${res.status})` },
        { status: 502 }
      );
    }

    const xml = await res.text();

    // Extraction brute des <item>
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    const records = items.map((item) => {
      const get = (tag: string) => {
        const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return m ? m[1].trim() : "";
      };

      const title = get("title");
      const link = get("link");
      const description =
        get("content:encoded") || get("description");
      const pubDate = get("pubDate");

      return {
        id: link,
        title,
        description,
        link,
        date: pubDate,
        source: "COMDT",
      };
    });

    return NextResponse.json({ records });
  } catch (err) {
    console.error("COMDT RSS error:", err);
    return NextResponse.json(
      { error: "Internal Server Error (COMDT RSS)" },
      { status: 500 }
    );
  }
}
