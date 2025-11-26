// src/app/api/tourismehautegaronne/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const dataset = "agendas-participatif-des-sorties-en-occitanie";
  const departementCode = "31";
  const apiUrl = `https://data.laregion.fr/api/records/1.0/search/?dataset=${dataset}&rows=1000&refine.departement=${departementCode}`;

  // Table d'images par thématique (clé "Education Emploi" demandée)
  const THEME_IMAGES: Record<string, string> = {
    "Culture": "/images/tourismehg31/themeculture.jpg",
    "Education Emploi": "/images/tourismehg31/themeeducation.jpg",
    "Autres": "/images/tourismehg31/themeautres.jpg",
    "Sport": "/images/tourismehg31/themesport.jpg",
    "Environnement": "/images/tourismehg31/themeenvironnement.jpg",
    "Économie / vie des entreprises": "/images/tourismehg31/themeentreprises.jpg",
    "Vides Grenier / Brocantes / Foires et salons": "/images/tourismehg31/themebrocantes.jpg",
    "Culture scientifique": "/images/tourismehg31/themesciences.jpg",
    "Agritourisme": "/images/tourismehg31/themeagritourisme.jpg",
  };

  const DEFAULT_THEME_IMAGE = "/images/tourismehg31/placeholder.jpg";
  const FALLBACK_PLACEHOLDER = "https://via.placeholder.com/400x200?text=Événement";

  // Normalize : lowercase + remove accents
  function normalize(str?: string) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Retourne l'image de thématique ; detecte les variantes "education" / "éducation"
  function getThemeImage(thematique?: string) {
    if (!thematique) return DEFAULT_THEME_IMAGE;

    const t = normalize(thematique.trim());

    if (t.startsWith("education") || t.startsWith("éducation")) {
      return THEME_IMAGES["Education Emploi"];
    }

    // essayer correspondance exacte (clé telle quelle dans THEME_IMAGES)
    // on compare normalisé aux clés normalisées
    for (const key of Object.keys(THEME_IMAGES)) {
      if (normalize(key) === t) return THEME_IMAGES[key];
    }

    return DEFAULT_THEME_IMAGE;
  }

  // Extraire l'URL d'image depuis le champ f.image qui peut être:
  // - une string (url)
  // - un tableau de strings
  // - un tableau d'objets (ex: {url: "..."} ou {thumbnail: "...", url: "..."})
  function extractImageField(imageField: any): string | null {
    if (!imageField) return null;

    if (typeof imageField === "string") {
      return imageField;
    }

    if (Array.isArray(imageField) && imageField.length > 0) {
      const first = imageField[0];
      if (typeof first === "string") return first;
      if (typeof first === "object" && first !== null) {
        // chercher une propriété probable
        return first.url || first.thumbnail || first.thumb || null;
      }
    }

    if (typeof imageField === "object" && imageField.url) {
      return imageField.url;
    }

    return null;
  }

  // Vérifie si l'enregistrement appartient bien au département 31 (robuste)
  function isDepartement31(fields: any): boolean {
    if (!fields) return false;

    // cas communs : fields.departement, fields.departement_code, fields.code_departement
    const possibles = [
      fields.departement,
      fields.departement_code,
      fields.code_departement,
      fields.code_dept,
      fields.departement_num,
      fields.dept,
      fields.nom_departement,
      fields.libelle_departement,
    ];

    for (const p of possibles) {
      if (!p && p !== 0) continue;
      const v = Array.isArray(p) ? p.join(",") : String(p);
      const nv = normalize(v);
      if (nv.includes("31") || nv.includes("haute-garonne") || nv.includes("haute garonne")) {
        return true;
      }
    }

    // fallback : regarder la commune / ville et leurs codes (parfois fields.insee_commune etc.)
    const communeFields = [
      fields.commune,
      fields.ville,
      fields.lieu_nom,
      fields.insee,
      fields.code_insee,
      fields.insee_commune,
    ];
    for (const c of communeFields) {
      if (!c) continue;
      const nv = normalize(String(c));
      // pas parfait mais cela aide pour certains enregistrements
      if (nv.includes("toulouse") || nv.includes("haute-garonne") || nv.includes("31")) {
        return true;
      }
    }

    return false;
  }

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      // si refine a raté côté API, pour être tolérant on retente sans refine puis on filtrera côté serveur
      const fallbackUrl = `https://data.laregion.fr/api/records/1.0/search/?dataset=${dataset}&rows=1000`;
      const fallbackResp = await fetch(fallbackUrl);
      if (!fallbackResp.ok) {
        return NextResponse.json({ error: "Erreur API" }, { status: resp.status });
      }
      const fallbackData = await fallbackResp.json();

      // on poursuit avec fallbackData
      // (on ne retourne tout de suite, on continue traitement plus bas)
      // remplace data par fallbackData pour traitement
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataAny: any = fallbackData;

      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 31);

      const events = (dataAny.records || [])
        .map((r: any, idx: number) => {
          const f = r.fields || {};

          // Si on a un refine qui n'a pas matché, on filtre localement robustement
          if (!isDepartement31(f)) return null;

          const rawDate = f.date_evenement || f.date_debut || f.date || f.start || null;
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

          const rawImage = extractImageField(f.image);
          const thematique = f.thematique || f.thematique_principale || f.theme || f.categorie || "Autres";

          // détermination image : priorité image fournie > image par thématique > placeholder
          const finalImage =
            rawImage ||
            getThemeImage(thematique) ||
            DEFAULT_THEME_IMAGE ||
            FALLBACK_PLACEHOLDER;

          return {
            id: stableId,
            title: f.titre || f.title || "Événement",
            description: f.descriptif || f.description || "",
            date: isoDate,
            dateFormatted,
            location: f.commune || f.lieu_nom || f.ville || "",
            fullAddress: f.adresse || "",
            image: finalImage,
            url: f.url || "",
            source: "tourismehautegaronne",
            recordid: r.recordid || null,
            thematique,
            _index: idx,
          };
        })
        .filter(Boolean)
        .filter((ev: any) => ev.date && new Date(ev.date) >= today && new Date(ev.date) <= maxDate)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return NextResponse.json({ events });
    }

    const data = await resp.json();

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 31);

    const events = (data.records || [])
      .map((r: any, idx: number) => {
        const f = r.fields || {};

        // filtrage robuste côté serveur : vérifier que l'enregistrement correspond bien au 31
        if (!isDepartement31(f)) return null;

        const rawDate = f.date_evenement || f.date_debut || f.date || f.start || null;
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

        const rawImage = extractImageField(f.image);
        const thematique = f.thematique || f.thematique_principale || f.theme || f.categorie || "Autres";

        const finalImage =
          rawImage ||
          getThemeImage(thematique) ||
          DEFAULT_THEME_IMAGE ||
          FALLBACK_PLACEHOLDER;

        return {
          id: stableId,
          title: f.titre || f.title || "Événement",
          description: f.descriptif || f.description || "",
          date: isoDate,
          dateFormatted,
          location: f.commune || f.lieu_nom || f.ville || "",
          fullAddress: f.adresse || "",
          image: finalImage,
          url: f.url || "",
          source: "tourismehautegaronne",
          recordid: r.recordid || null,
          thematique,
          _index: idx,
        };
      })
      .filter(Boolean)
      .filter((ev: any) => ev.date && new Date(ev.date) >= today && new Date(ev.date) <= maxDate)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Erreur réseau ou JSON" }, { status: 500 });
  }
}
