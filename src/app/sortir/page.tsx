"use client";
import React, { useState, useEffect } from 'react';

interface DayData {
  date: string;
  dayNum: number;
  score: number;
  affluenceTexte: string;
  isFerie: boolean;
}

interface MonthData {
  name: string;
  days: DayData[];
}

export default function CalendrierCompletPage() {
  const [calendrier, setCalendrier] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  // Liste des mois pour l'affichage
  const moisNoms = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  useEffect(() => {
    const genererCalendrierComplet = async () => {
      const annee = 2025;
      const structureAnnee: MonthData[] = [];

      // Pour chaque mois de l'année 2025
      for (let m = 0; m < 12; m++) {
        const joursDuMois: DayData[] = [];
        const nbJours = new Date(annee, m + 1, 0).getDate(); // Nombre de jours dans le mois

        // Pour chaque jour du mois, on appelle notre API existante pour avoir son score
        const promessesJours = [];
        for (let j = 1; j <= nbJours; j++) {
          const dateStr = `${annee}-${String(m + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
          promessesJours.push(
            fetch(`/api/sortir?date=${dateStr}`)
              .then(res => res.json())
              .then(data => ({
                date: dateStr,
                dayNum: j,
                score: data.score,
                affluenceTexte: data.affluenceTexte,
                isFerie: data.details.includes("férié")
              }))
          );
        }

        const resultatsJours = await Promise.all(promessesJours);
        structureAnnee.push({
          name: moisNoms[m],
          days: resultatsJours
        });
      }

      setCalendrier(structureAnnee);
      setLoading(false);
    };

    genererCalendrierComplet();
  }, []);

  // Fonction utilitaire pour attribuer une couleur selon le score d'affluence (0 à 5)
  const getColorForScore = (score: number) => {
    switch (score) {
      case 0: return '#efefef'; // Gris (Vide / Août)
      case 1: return '#fce8e6'; // Rouge très clair (Très calme)
      case 2: return '#fbc4be'; // Rouge/Orange léger (Calme)
      case 3: return '#fef7e0'; // Jaune (Modéré / Moyen)
      case 4: return '#c2e7cb'; // Vert clair (Beaucoup de monde)
      case 5: return '#81c995'; // Vert foncé (Plein à craquer 🔥)
      default: return '#ffffff';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', fontStyle: 'italic' }}>⚡ Génération et analyse du calendrier complet 2025 en cours...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#202124', marginBottom: '10px' }}>📅 Tableau de Bord de Fréquentation Annuelle (2025)</h1>
      <p style={{ textAlign: 'center', color: '#5f6368', marginBottom: '30px' }}>Basé sur le modèle prédictif de Toulouse (Zone C)</p>

      {/* Légende du Calendrier */}
      <div style={{ maxWidth: '800px', margin: '0 auto 30px auto', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Légende :</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#efefef', border: '1px solid #ccc' }}></div> Désert (0)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#fce8e6', border: '1px solid #ccc' }}></div> Très calme (1)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#fbc4be', border: '1px solid #ccc' }}></div> Calme (2)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#fef7e0', border: '1px solid #ccc' }}></div> Modéré (3)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#c2e7cb', border: '1px solid #ccc' }}></div> Beaucoup de monde (4)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#81c995', border: '1px solid #ccc' }}></div> Plein 🔥 (5)</span>
      </div>

      {/* Grille des 12 mois */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {calendrier.map((month, mIdx) => (
          <div key={mIdx} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1a73e8', borderBottom: '2px solid #f1f3f4', paddingBottom: '5px' }}>{month.name}</h3>
            
            {/* Grille des jours du mois */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
              {month.days.map((day, dIdx) => (
                <div
                  key={dIdx}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    backgroundColor: getColorForScore(day.score),
                    padding: '8px 0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: day.isFerie ? 'bold' : 'normal',
                    cursor: 'pointer',
                    border: day.isFerie ? '2px solid #d93025' : '1px solid transparent',
                    transition: 'transform 0.1s ease',
                  }}
                  title={`Date: ${day.date} - ${day.affluenceTexte}`}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fenêtre modale/Détail au clic sur un jour */}
      {selectedDay && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#202124', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', maxWidth: '350px', zIndex: 1000 }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#8ab4f8' }}>Détail du {new Date(selectedDay.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
          <p style={{ margin: '5px 0' }}><strong>Affluence :</strong> {selectedDay.affluenceTexte}</p>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#bdc1c6' }}>Score du modèle : {selectedDay.score} / 5</p>
          {selectedDay.isFerie && <p style={{ margin: '5px 0', color: '#f28b82', fontWeight: 'bold' }}>⚠️ Jour Férié</p>}
          <button 
            onClick={() => setSelectedDay(null)} 
            style={{ marginTop: '10px', background: '#3c4043', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
