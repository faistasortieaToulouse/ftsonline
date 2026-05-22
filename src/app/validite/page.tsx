'use client';
import { useEffect, useState } from 'react';

interface Validite {
  nom: string;
  dateExpiration: string;
  fournisseur: string;
  type: string;
  prix?: string;
}

export default function ValiditePage() {
  const [services, setServices] = useState<Validite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/validite')
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Chargement des données...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Suivi des Validités & Abonnements</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service / Domaine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Limite / Expiration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service, index) => {
              // Vérification si la date est dépassée ou proche
              const expDate = new Date(service.dateExpiration);
              const aujourdhui = new Date();
              const estDepasse = expDate < aujourdhui;

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{service.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.fournisseur}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${estDepasse ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {new Date(service.dateExpiration).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{service.prix || "N/A"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
