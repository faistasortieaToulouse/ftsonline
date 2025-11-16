import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = "https://www.univ-tlse3.fr/actualites/flux-rss";

    // 1) Télécharger le flux en texte brut
    const xml = await fetch(url).then(res => res.text());

    // 2) Extraire manuellement les blocs <item> ... </item>
    const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/g) || [];

    const events = itemBlocks.map((block, index) => {
      const get = (tag: string) => {
        const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return match ? match[1].trim() : null;
      };

      return {
        id: get("guid") || get("link") || `item-${index}`,
        title: get("title"),
        description: get("description"),
        date: get("pubDate"),
        url: get("link"),
        source: "Université Toulouse III – Paul Sabatier",
      };
    });

    return NextResponse.json(events, { status: 200 });

  } catch (err: any) {
    console.error("UT3 RSS error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
