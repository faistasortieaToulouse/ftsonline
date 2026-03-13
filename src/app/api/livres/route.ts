import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = '100';
  
  // ÉLARGISSEMENT DE LA REQUÊTE :
  // On cherche "fiction" OU "romans" OU "french fiction" pour capter les 100 derniers
  const query = 'language:fre AND (subject:fiction OR subject:romans OR subject:"french fiction")';
  
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&page=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FTSToulouse/1.0 (contact: admin@ftstoulouse.online)'
      },
      // Cache réduit à 1h (3600s) pour mieux voir les nouveautés pendant tes tests
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur API: ${response.status}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    const livres = data.docs
      .filter((book: any) => book.cover_i) // Filtre de sécurité pour les images
      .map((book: any) => ({
        id: book.key.replace('/works/', ''), 
        titre: book.title,
        auteur: book.author_name ? book.author_name[0] : "Auteur inconnu",
        image: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
        annee: book.first_publish_year || "N/C",
        
        // --- LIEN VERS LA DESCRIPTION ---
        // Ce lien renvoie vers la page Open Library qui contient le résumé complet
        url_description: `https://openlibrary.org${book.key}`,
        
        sujets: book.subject ? book.subject.slice(0, 3) : [],
        nbEditions: book.edition_count || 1
      }));

    return NextResponse.json(livres);
    
  } catch (error) {
    console.error("Erreur OpenLibrary:", error);
    return NextResponse.json(
      { error: "Erreur serveur" }, 
      { status: 500 }
    );
  }
}
