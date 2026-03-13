import { NextResponse } from 'next/server';

export async function GET() {
  // On cherche les romans (fiction) en français, triés par les plus récents
  const url = "https://openlibrary.org/search.json?q=language:fre+subject:fiction&sort=new&limit=20";

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FTSToulouse/1.0 (contact: ton-email@example.com)'
      },
      // On demande à Next.js de mettre en cache pendant 24h (86400 secondes)
      next: { revalidate: 86400 } 
    });

    if (!response.ok) throw new Error('Erreur API');

    const data = await response.json();

    const livres = data.docs
      .filter((book: any) => book.cover_i) // Uniquement ceux avec couverture
      .map((book: any) => ({
        id: book.key,
        titre: book.title,
        auteur: book.author_name?.[0] || "Auteur inconnu",
        image: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
        annee: book.first_publish_year
      }));

    return NextResponse.json(livres);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de charger les nouveautés" }, { status: 500 });
  }
}
