import { NextResponse } from "next/server";

const RSS_URL =
  "https://mercure.inp-toulouse.fr/_plugins/web/mercure/fr/filter/events/rss.xml";

// Petit utilitaire pour parser le RSS
async function parseRSS(xmlText: string) {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(xmlText, { contentType: "text/xml" });
  const doc = dom.window.document;

  const items = [...doc.querySelectorAll("item")].map((item) => ({
    title: item.querySelector("title")?.textContent?.trim() || "",
    link: item.querySelector("link")?.textContent?.trim() || "",
    pubDate: item.querySelector("pubDate")?.textContent?.trim() || "",
    description: item.querySelector("description")?.textContent?.trim() || "",
    image:
      item
        .querySelector("description")
        ?.innerHTML.match(/<img[^>]+src="([^"]+)"/)?.[1] || null,
  }));

  return { items };
}

export async function GET() {
  try {
    const resp = await fetch(RSS_URL);
    if (!resp.ok) throw new Error("Impossible de charger le flux INP.");

    const xml = await resp.text();
    const data = await parseRSS(xml);

    return NextResponse.json({ events: data.items });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}
