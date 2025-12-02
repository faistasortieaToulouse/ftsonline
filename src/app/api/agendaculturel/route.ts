import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RSS_URL = "https://31.agendaculturel.fr/rss";

// Very simple RSS parser without regex
function extract(tag, block) {
  const a = block.indexOf(`<${tag}>`);
  const b = block.indexOf(`</${tag}>`);
  if (a === -1 || b === -1) return null;
  return block.substring(a + tag.length + 2, b).trim();
}

export async function GET() {
  try {
    const res = await fetch(RSS_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Erreur RSS" }, { status: 500 });
    }

    const xml = await res.text();
    const rawItems = xml.split("<item>").slice(1);

    const events = rawItems.map((blk) => {
      const title = extract("title", blk)?.replace("<![CDATA[", "").replace("]]>", "") || null;
      const description = extract("description", blk)?.replace("<![CDATA[", "").replace("]]>", "") || null;
      const url = extract("link", blk) || null;
      const date = extract("pubDate", blk) || null;
      return { title, description, url, date };
    });

    return NextResponse.json({ count: events.length, events });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur", details: String(e) }, { status: 500 });
  }
}
