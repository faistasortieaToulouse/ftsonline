import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const res = await fetch("https://halles-cartoucherie.fr/wp-admin/admin-ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "load_event_posts",
        eventfeed_current_page: "1",
        eventfeed_page: "load_more",
      }),
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const events: any[] = [];

    $(".event-card").each((_, el) => {
      const title = $(el).find(".event-title").text().trim();
      const date = $(el).find(".event-date").text().trim();
      const link = $(el).find("a").attr("href");
      const image = $(el).find("img").attr("src");

      events.push({
        id: link || title,
        title,
        date,
        dateFormatted: date,
        url: link,
        image,
        source: "Halles de la Cartoucherie",
      });
    });

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("Halles Cartoucherie error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
