import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  try {
    const res = await fetch("https://www.american-cosmograph.fr/?feed=rss2");
    let xml = await res.text();

    // Afficher le XML complet pour inspection
    console.log("Flux RSS brut :", xml.substring(0, 1000)); // on limite l'affichage pour la console

    // Nettoyage minimal pour éviter les erreurs de parsing
    xml = xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;");

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseTagValue: true,
      allowBooleanAttributes: true,
    });

    const jsonObj = parser.parse(xml);

    // Chercher les événements dans plusieurs balises possibles
    const items =
      jsonObj?.rss?.channel?.item ||
      jsonObj?.feed?.entry ||
      [];

    console.log("Nombre total d'événements trouvés dans le XML :", items.length);

    // Garder uniquement les événements à partir d'aujourd'hui
    const today = new Date();
    const events = items
      .map((item: any, i: number) => {
        const dateStr = item.pubDate || item.published || item.date || null;
        const date = dateStr ? new Date(dateStr) : null;

        return {
          id: item.guid?.["@_isPermaLink"] || item.id || `cosmo-${i}`,
          title: item.title || item.name || "Événement Cosmograph",
          description: item.description || item.summary || "",
          date: date ? date.toISOString() : null,
          url: item.link || (item.id ? item.id : "#"),
          source: "American Cosmograph",
        };
      })
      .filter(ev => ev.date && new Date(ev.date) >= today); // filtrer à partir d'aujourd'hui

    console.log("Dates des événements récupérés :", events.map(ev => ev.date));

    return NextResponse.json({ total: events.length, events });
  } catch (err: any) {
    console.error("Erreur Flux American Cosmograph :", err);

    // Retour fallback si le flux RSS échoue complètement
    const fallbackEvents = [
      {
        id: "cosmo-1",
        title: "Événement test 1",
        description: "Description d'un événement test",
        date: new Date().toISOString(),
        url: "#",
        source: "American Cosmograph",
      },
    ];

    return NextResponse.json(
      { total: fallbackEvents.length, events: fallbackEvents },
      { status: 200 }
    );
  }
}
