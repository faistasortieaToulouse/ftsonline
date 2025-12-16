// src/app/museeaveyron/page.tsx
'use client';

import { useEffect, useState } from 'react';
// Importation du type Musee depuis la route API Aveyron
import { Musee as MuseeAveyron } from '../api/museeaveyron/route'; 

// Styles pour le tableau (utilisant des styles en ligne simples)
const tableHeaderStyle: React.CSSProperties = { 
  padding: '12px', 
  borderBottom: '2px solid #ddd',
  backgroundColor: '#e6e6fa' // Couleur claire pour l'en-tête
};
const tableCellStyle: React.CSSProperties = { 
  padding: '12px', 
  borderBottom: '1px solid #eee' 
};

// Composant principal de la page
export default function MuseeAveyronPage() {
  const [musees, setMusees] = useState<MuseeAveyron[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMusees() {
      try {
        // Appel de l'URL d'appel API pour l'Aveyron
        const response = await fetch('/api/museeaveyron'); 
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données de l'API.");
        }
        const data: MuseeAveyron[] = await response.json();
        setMusees(data);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Une erreur inattendue est survenue.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchMusees();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Musées de l'Aveyron (12)</h1>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Musées de l'Aveyron (12)</h1>
        <p>Erreur : {error}</p>
        <p>Vérifiez que le fichier /api/museeaveyron/route.ts est correctement configuré.</p>
      </div>
    );
  }

  // Tri des musées par ordre alphabétique de commune
  const museesTries = [...musees].sort((a, b) => a.commune.localeCompare(b.commune));

  const totalMusees = museesTries.length; 

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
        🐑 Musées et Patrimoine de l'Aveyron (12)
      </h1>
      
      <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>
        Total de Musées listés : {totalMusees}
      </p>

      <h2>Liste Détaillée des Musées</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>N°</th> 
            <th style={tableHeaderStyle}>Commune</th>
            <th style={tableHeaderStyle}>Nom du Musée</th>
            <th style={tableHeaderStyle}>Catégorie</th>
            <th style={tableHeaderStyle}>Adresse</th>
            <th style={tableHeaderStyle}>URL</th>
          </tr>
        </thead>
        <tbody>
          {museesTries.map((musee, index) => (
            <tr key={index}>
              {/* Affichage du numéro (index + 1) */}
              <td style={tableCellStyle}><strong>{index + 1}</strong></td> 
              <td style={tableCellStyle}>{musee.commune}</td>
              <td style={tableCellStyle}>{musee.nom}</td>
              <td style={tableCellStyle}>{musee.categorie}</td>
              <td style={tableCellStyle}>{musee.adresse}</td>
              <td style={tableCellStyle}>
                <a 
                  href={musee.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#6a5acd', textDecoration: 'underline' }} 
                >
                  Voir le site
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
