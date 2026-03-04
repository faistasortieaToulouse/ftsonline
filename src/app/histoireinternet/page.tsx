import Link from 'next/link';

// Interface pour typer tes données (adapte-la selon la structure de ton JSON)
interface EventInternet {
  nom?: string;
  evenement?: string;
  date: string;
  description: string;
}

async function getHistoireInternet() {
  // On appelle l'URL absolue en interne ou relative si configurée
  // Note : En développement local, utilise http://localhost:3000
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/histoireinternet`, {
    cache: 'no-store', // Pour toujours avoir les données à jour
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des données');
  }

  return res.json();
}

export default async function HistoireInternetPage() {
  let data: EventInternet[] = [];
  
  try {
    data = await getHistoireInternet();
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Histoire de l'Internet</h1>
          <Link 
            href="/" 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            ← Retour à l'Accueil
          </Link>
        </div>

        {/* Liste des événements */}
        <div className="space-y-6">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {item.nom || item.evenement}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                    {item.date}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Aucune donnée disponible pour le moment.</p>
          )}
        </div>

      </div>
    </main>
  );
}
