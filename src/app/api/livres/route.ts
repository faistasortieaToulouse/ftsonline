import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  
  // Requête ultra-large : Langue française uniquement, triée par nouveauté
  // On enlève le filtre subject pour avoir un maximum de résultats
  const url = `https://openlibrary.org/search.json?q=language:fre&sort=new&limit=100&page=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FTSToulouse/1.0 (contact: admin@ftstoulouse.online)'
      },
      next: { revalidate: 0 } // On force la mise à jour pour tes tests
    });

    if (!response.ok) throw new Error(`Erreur: ${response.status}`);

    const data = await response.json();

    const livres = data.docs
      .filter((book: any) => book.cover_i) // On garde uniquement ceux qui ont une photo
      .map((book: any) => ({
        id: book.key.replace('/works/', ''), 
        titre: book.title,
        auteur: book.author_name ? book.author_name[0] : "Auteur inconnu",
        image: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
        annee: book.first_publish_year || "N/C",
        // LIEN VERS LA DESCRIPTION
        url_description: `https://openlibrary.org${book.key}`,
        // On récupère les sujets pour que tu puisses voir ce que c'est (Roman, Histoire, etc.)
        sujets: book.subject ? book.subject.slice(0, 2) : []
      }));

    return NextResponse.json(livres);
    
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
