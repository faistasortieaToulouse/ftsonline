import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = '100';
  
  // Requête ciblée : Français + Fiction + Trié par nouveautés
  const url = `https://openlibrary.org/search.json?q=language:fre+subject:fiction&sort=new&limit=${limit}&page=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FTSToulouse/1.0 (contact: admin@ftstoulouse.online)'
      },
      next: { revalidate: 86400 } // Cache 24h
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur API: ${response.status}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    const livres = data.docs
      .filter((book: any) => book.cover_i) // On garde uniquement ceux avec couverture
      .map((book: any) => ({
        // L'ID sert à construire le lien vers la fiche détaillée plus tard
        id: book.key.replace('/works/', ''), 
        titre: book.title,
        auteur: book.author_name ? book.author_name[0] : "Auteur inconnu",
        image: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
        annee: book.first_publish_year || "N/C",
        
        // --- NOUVELLES INFOS AJOUTÉES ---
        sujets: book.subject ? book.subject.slice(0, 3) : [], // On prend les 3 premiers thèmes
        nbEditions: book.edition_count || 1,
        // Lien direct vers Open Library au cas où
        url_ol: `https://openlibrary.org${book.key}`
      }));

    return NextResponse.json(livres);
    
  } catch (error) {
    console.error("Erreur OpenLibrary:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des livres" }, 
      { status: 500 }
    );
  }
}
