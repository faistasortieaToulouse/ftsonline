"use client";
import React, { useState, useEffect } from 'react';

// Interface correspondant à la réponse JSON de notre API route.ts
interface ApiResponse {
  date: string;
  jourSemaine: string;
  score: number;
  affluenceTexte: string;
  details: string;
  periodeFavorabilite: string;
}

export default function SortirPage() {
  const [date, setDate] = useState<string>("2025-05-20"); // Date de test par défaut (Mai = Période forte)
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sortir?date=${date}`)
      .then((res) => res.json())
      .then((resData: ApiResponse) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des données", err);
        setLoading(false);
      });
  }, [date]);

  // Fonction utilitaire pour gérer la couleur de fond dynamique selon le score
  const getBackgroundColor = (score: number) => {
    if (score >= 4) return '#e6f4ea'; // Vert clair (Favorable)
    if (score <= 2) return '#fce8e6'; // Rouge clair (Calme/Vide)
    return '#fef7e0'; // Orange clair (Moyen)
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333', fontSize: '24px' }}>📊 Analyseur d'Affluence Urbaine</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="date-picker" style={{ fontWeight: 'bold', color: '#555' }}>Choisir une date en 2025 :</label>
        <input 
          id="date-picker"
          type="date" 
          value={date} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>

      <hr style={{ border: '0', height: '1px', backgroundColor: '#eee', margin: '20px 0' }} />

      {loading ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>Analyse des données en cours...</p>
      ) : (
        data && (
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ textTransform: 'capitalize', color: '#0056b3', fontSize: '20px', marginBottom: '10px' }}>
              {data.jourSemaine} {new Date(data.date).toLocaleDateString('fr-FR')}
            </h2>
            
            <div style={{ padding: '15px', backgroundColor: getBackgroundColor(data.score), borderRadius: '8px', margin: '15px 0' }}>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>
                Statut : {data.affluenceTexte}
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555' }}>
                Diagnostic : <strong>{data.periodeFavorabilite}</strong>
              </p>
            </div>

            <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#444' }}>
              <strong>Détails du modèle :</strong> {data.details}
            </p>
          </div>
        )
      )}
    </div>
  );
}
