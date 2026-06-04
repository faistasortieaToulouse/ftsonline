"use client";
import React, { useState, useEffect } from 'react';

interface DayData {
  date: string;
  dayNum: number;
  score: number;
  affluenceTexte: string;
  details: string;
}

interface MonthData {
  name: string;
  days: DayData[];
}

export default function TableDeBordSorties() {
  const [calendrier, setCalendrier] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const moisNoms = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  useEffect(() => {
    const chargerTouteAnnee = async () => {
      const annee = 2025;
      const structureAnnee: MonthData[] = [];

      for (let m = 0; m < 12; m++) {
        const nbJours = new Date(annee, m + 1, 0).getDate();
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
                details: data.details
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

    chargerTouteAnnee();
  }, []);

  // Couleurs associées aux niveaux stricts 1, 2 et 3
  const getColorForNiveau = (score: number) => {
    switch (score) {
      case 1: return '#fca5a5'; // Rouge/Rose (Peu de monde)
      case 2: return '#fef08a'; // Jaune pâle (Moyen)
      case 3: return '#86efac'; // Vert clair (Beaucoup de monde)
      default: return '#ffffff';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>🔄 Initialisation du calendrier 2025 selon vos critères terrain...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#111827', margin: '0 0 5px 0', fontSize: '26px' }}>📅 Calendrier des Sorties & Fréquentation 2025</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>Indexation basée sur vos données terrain (Niveaux 1, 2, 3)</p>

      {/* Légende */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#fca5a5', borderRadius: '4px' }}></div> Niveau 1 (Peu de gens)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#fef08a', borderRadius: '4px' }}></div> Niveau 2 (Moyen)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#86efac', borderRadius: '4px' }}></div> Niveau 3 (Beaucoup de monde)
        </div>
      </div>

      {/* Grille Annuelle */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '25px', maxWidth: '1300px', margin: '0 auto' }}>
        {calendrier.map((month, idx) => (
          <div key={idx} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1f2937', fontSize: '18px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>{month.name}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {month.days.map((day, dIdx) => (
                <div
                  key={dIdx}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    backgroundColor: getColorForNiveau(day.score),
                    padding: '10px 0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fenêtre de Détail Flottante */}
      {selectedDay && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1f2937', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', maxWidth: '320px', zIndex: 50 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#f9fafb', fontSize: '15px' }}>
            {new Date(selectedDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Constat :</strong> {selectedDay.affluenceTexte}</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#9ca3af' }}>🔍 {selectedDay.details}</p>
          <button 
            onClick={() => setSelectedDay(null)}
            style={{ marginTop: '12px', backgroundColor: '#4b5563', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Masquer le détail
          </button>
        </div>
      )}
    </div>
  );
}
