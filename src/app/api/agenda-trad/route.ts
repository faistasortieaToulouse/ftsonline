import RSSParser from "rss-parser";

const parser = new RSSParser();

export async function GET() {
  try {
    const feed = await parser.parseURL("https://agendatrad.org/rss/events/next/France/Occitanie/Haute-Garonne.xml?lang=fr");

    const events = feed.items
      .map((item: any) => {
        const dateStr = item.published || item.isoDate;
        const date = dateStr ? new Date(dateStr) : null;
        if (!date || date < new Date()) return null;

        const title = item.title?.replace(/\[\d{4}-\d{2}-\d{2}\]\s*/, "") || "Événement AgendaTrad";
        const description = item.contentSnippet || item.content || "";
        const url = item.link || "";
        const category = item.categories?.[0] || "Danse";
        const image = feed.image?.url || "/images/categories/danse.jpg";

        // Construire une adresse si disponible
        const address = item.location || "";

        return {
          id: item.id || url,
          title,
          description,
          date: date.toISOString(),
          dateFormatted: date.toLocaleString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          fullAddress: address,
          category,
          image,
          url,
          source: "AgendaTrad",
        };
      })
      .filter(Boolean);

    return new Response(JSON.stringify(events), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
