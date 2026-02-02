import { NextRequest, NextResponse } from "next/server";
// On importe le fichier généré par ton GitHub Workflow
import statsHebdo from "@/data/stats-hebdo.json"; 

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") || "ftstoulouse.vercel.app";
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const BASE_URL = `${protocol}://${host}`;

  const totalArticles = 216;

  try {
    const endpoints = [
      { id: 'meetup_events', path: '/api/meetup-events' },
      { id: 'meetup_expats', path: '/api/meetup-expats' },
      { id: 'meetup_coloc',  path: '/api/meetup-coloc' },
      { id: 'meetup_sorties',path: '/api/meetup-sorties' },
      { id: 'cinema',        path: '/api/cinematoulouse' },
      { id: 'agenda',        path: '/api/agendatoulousain' },
      { id: 'jeux',          path: '/api/trictracphilibert' }
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(`${BASE_URL}${endpoint.path}`, {
            cache: 'no-store', 
            signal: controller.signal,
            headers: { "Internal-Auth": "radar-secret-v1" }
          });
          
          clearTimeout(timeout);
          if (!res.ok) return { id: endpoint.id, count: 0 };
          const data = await res.json();
          
          let count = 0;
          if (endpoint.id === 'cinema') count = data.results?.length || 0;
          else if (endpoint.id === 'agenda') count = data.total || data.count || 0;
          else if (endpoint.id === 'jeux') count = data.count || 0;
          else {
             count = data.totalEvents || (Array.isArray(data.events) ? data.events.length : (Array.isArray(data) ? data.length : 0));
          }
          return { id: endpoint.id, count };
        } catch (err) {
          return { id: endpoint.id, count: 0 };
        }
      })
    );

    const mCount = results.filter(r => r.id.startsWith('meetup')).reduce((a, b) => a + b.count, 0);
    const cCount = results.find(r => r.id === 'cinema')?.count || 0;
    const aCount = results.find(r => r.id === 'agenda')?.count || 0;
    const jCount = results.find(r => r.id === 'jeux')?.count || 0;

    const totalLive = mCount + cCount + aCount + jCount;

    // --- LOGIQUE DE SÉCURITÉ (FALLBACK) ---
    // Si le scan live est vide ou échoue (ex: 0 événements trouvés), 
    // on renvoie les données de stats-hebdo.json
    if (totalLive === 0) {
      return NextResponse.json({
        ...statsHebdo,
        source: "backup_hebdo_json",
        note: "Flux live indisponible, affichage des archives"
      }, {
        headers: { 'Cache-Control': 'public, s-maxage=300' } // Cache court si erreur
      });
    }

    return NextResponse.json({
      totalLive,
      totalArticles,
      detailsLive: { meetup: mCount, cinema: cCount, agenda: aCount, jeux: jCount },
      source: "live_radar",
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
      }
    });

  } catch (err) {
    // Si l'exécution plante totalement, on renvoie le JSON hebdo par défaut
    return NextResponse.json(statsHebdo);
  }
}