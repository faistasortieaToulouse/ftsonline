import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  
  // NOUVELLE STRATÉGIE : Paramètres séparés pour forcer l'API à fouiller plus loin
  // On cible les tags français que tu as listés
  const url = `https://openlibrary.org/search.json?language=fre&subject=fiction&q=romans&sort=new&limit=100&page=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FTSToulouse/1.0 (contact: admin@ftstoulouse.online)'
      },
      // IMPORTANT: On passe le cache à 0 pendant tes tests pour voir les nouveaux livres
      next: { revalidate: 0 } 
    });

    if (!response.ok) throw new Error(`Erreur: ${response.status}`);

    const data = await response.json();

    const livres = data.docs
      .filter((book: any) => book.cover_i) // On garde ceux avec images
      .map((book: any) => ({
        id: book.key.replace('/works/', ''), 
        titre: book.title,
        auteur: book.author_name ? book.author_name[0] : "Auteur inconnu",
        image: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
        annee: book.first_publish_year || "N/C",
        // LIEN RÉSUMÉ (Vérifie que page.tsx utilise bien EXACTEMENT ce nom)
        url_description: `https://openlibrary.org${book.key}`,
        sujets: book.subject ? book.subject.slice(0, 3) : [],
        nbEditions: book.edition_count || 1
      }));

    return NextResponse.json(livres);
    
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
