// src/app/lot/page.tsx
interface SiteLot {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: string;
}

async function getLotSites(): Promise<SiteLot[]> {
  const res = await fetch('http://localhost:3000/api/lot', {
    cache: 'no-store',
  });
  return res.json();
}

export default async function LotPage() {
  const sites = await getLotSites();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Communes et sites emblématiques du Lot
      </h1>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Commune</th>
            <th className="border p-2">Site / Monument</th>
            <th className="border p-2">Niveau</th>
            <th className="border p-2">Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id}>
              <td className="border p-2">{site.commune}</td>
              <td className="border p-2">{site.site}</td>
              <td className="border p-2 text-center">{site.niveau}</td>
              <td className="border p-2">{site.categorie}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
