// /src/app/ecrivainsaude/page.tsx

type Ecrivain = {
  nom: string;
  commune: string;
  dates: string | null;
  description: string | null;
};

async function getEcrivainsData(): Promise<Ecrivain[]> {
  // En production, vous devriez utiliser un chemin absolu ou une variable d'environnement pour l'hôte.
  // Pour le développement local ou l'approche Next.js server-side fetching, le chemin relatif est souvent suffisant.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/ecrivainsaude`, {
    cache: 'force-cache' // Mise en cache pour une reconstruction rapide
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  
  return res.json();
}

export default async function EcrivainsAudePage() {
  const ecrivains = await getEcrivainsData();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Écrivains nés dans l'Aude (et communes associées)</h1>
      <p>
        Cette liste répertorie des écrivains et personnalités littéraires originaires des communes de l'Aude et des villes des alentours (Castres, Montpellier, Pamiers, Toulouse, etc.).
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nom</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Commune</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Dates</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description / Profession</th>
          </tr>
        </thead>
        <tbody>
          {ecrivains.map((ecrivain, index) => (
            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.nom}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.commune}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.dates || 'Inconnu'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
