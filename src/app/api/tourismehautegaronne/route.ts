// src/app/api/tourismehautegaronne/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const dataset = "agendas-participatif-des-sorties-en-occitanie";
  const departementCode = "31";
  const apiUrl = `https://data.laregion.fr/api/records/1.0/search/?dataset=${dataset}&rows=1000&refine.departement=${departementCode}`;

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      return NextResponse.json({ error: "Erreur API" }, { status: resp.status });
    }

    const data = await resp.json();

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 31);

    const events = data.records
      .map((r: any, idx: number) => {
        const f = r.fields;

        const rawDate = f.date_evenement || f.date_debut || f.date || null;
        let isoDate: string | null = null;
        let dateFormatted: string | null = null;

        if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            isoDate = d.toISOString();
            dateFormatted = d.toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }
        }

        const stableId =
          r.recordid ||
          f.id ||
          `${(f.titre || "evenement").replace(/\s+/g, "-").slice(0, 50)}-${isoDate || "nodate"}-${idx}`;

        return {
          id: stableId,
          title: f.titre || f.title || "Événement",
          description: f.descriptif || f.description || "",
          date: isoDate,
          dateFormatted,
          location: f.commune || f.lieu_nom || f.ville || "",
          fullAddress: f.adresse || "",
          image: (f.image && (typeof f.image === "string" ? f.image : Array.isArray(f.image) ? f.image[0] : null)) || "https://via.placeholder.com/400x200?text=Événement",
          url: f.url || "",
          source: "tourismehautegaronne",
          recordid: r.recordid || null,
          thematique: f.thematique || f.thematique_principale || "Autres", // 🔵 ajout thématique
          _index: idx,
        };
      })
      // 🔵 Filtrage des événements sur 31 jours
      .filter(ev => ev.date && new Date(ev.date) >= today && new Date(ev.date) <= maxDate)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Erreur réseau ou JSON" }, { status: 500 });
  }
}
