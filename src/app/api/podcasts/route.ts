// src/app/api/podcasts/route.ts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const librairieFilter = searchParams.get('librairie') || '';
    const dateMin = searchParams.get('dateMin');

    const [obEpisodes, tnEpisodes] = await Promise.all([
      fetchPodcast('Ombres Blanches', 'https://feed.ausha.co/les-podcasts-d-ombres-blanches'),
      fetchPodcast('Terra Nova', 'https://www.vodio.fr/rss/terranova'),
    ]);

    let allEpisodes = [...obEpisodes, ...tnEpisodes];

    // 🔎 Filtrage multicritère
    if (query) {
      allEpisodes = allEpisodes.filter(ep =>
        ep.titre.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query)
      );
    }
    if (librairieFilter) {
      allEpisodes = allEpisodes.filter(ep => ep.librairie === librairieFilter);
    }
    if (dateMin) {
      const minDate = new Date(dateMin);
      allEpisodes = allEpisodes.filter(ep => new Date(ep.date) >= minDate);
    }

    // Tri par date
    allEpisodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedEpisodes = allEpisodes.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedEpisodes,
      metadata: {
        totalEpisodes: allEpisodes.length,
        page,
        limit,
        totalPages: Math.ceil(allEpisodes.length / limit),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Erreur lors du parsing RSS.' }, { status: 500 });
  }
}
