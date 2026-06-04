"use client";
import React, { useState, useEffect } from 'react';

interface DayData {
  date: string;
  dayNum: number;
  score: number;
  affluenceTexte: string;
  details: string;
  meteo: string;
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
                details: data.details,
                meteo: data.meteo
              }))
              .catch(() => ({
                date: dateStr,
                dayNum: j,
                score: 2,
                affluenceTexte: "Erreur",
                details: "Erreur API",
                meteo: ""
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

  const getColorForNiveau = (score: number) => {
    switch (score) {
      case 1: return '#fca5a5';
      case 2: return '#fef08a';
      case 3: return '#86efac';
      default: return '#ffffff';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>🔄 Initialisation de la Matrice 2025...</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px' }}>Calcul des indicateurs d'ensoleillement (Durée &gt; 19h30), vacances et alertes climatiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#111827', margin: '0 0 5px 0', fontSize: '26px' }}>📅 Calendrier des Sorties & Fréquentation 2025</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>Indexation complète : Météo, Saisons, Vacances scolaires et Jours Fériés</p>

      {/* Légende */}
      <div style={{ maxWidth: '850px', margin: '0 auto 40px auto', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#fca5a5', borderRadius: '4px' }}></div> Niveau 1 (Calme / Férié / Alerte)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#fef08a', borderRadius: '4px' }}></div> Niveau 2 (Moyen)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#86efac', borderRadius: '4px' }}></div> Niveau 3 (Forte Affluence)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', borderLeft: '1px solid #e5e7eb', paddingLeft: '15px' }}>
          <span>⚡</span> Alerte météo active (Vent, Pluie, Canicule)
        </div>
      </div>

      {/* Grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '25px', maxWidth: '1300px', margin: '0 auto' }}>
        {calendrier.map((month, idx) => (
          <div key={idx} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1f2937', fontSize: '18px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>{month.name}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {month.days.map((day, dIdx) => {
                const aUneAlerte = day.meteo && day.meteo !== "☀️ Météo clémente ou conforme aux normales.";
                
                return (
                  <div
                    key={dIdx}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      backgroundColor: getColorForNiveau(day.score),
                      padding: '10px 0',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: aUneAlerte ? '2px solid #dc2626' : '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.15s ease',
                      position: 'relative'
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
                    {aUneAlerte && (
                      <span style={{ position: 'absolute', bottom: '1px', right: '2px', fontSize: '8px' }}>
                        ⚡
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fenêtre Flottante */}
      {selectedDay && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1f2937', color: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', maxWidth: '360px', zIndex: 100, border: '1px solid #374151' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#f9fafb', fontSize: '16px', textTransform: 'capitalize', borderBottom: '1px solid #4b5563', paddingBottom: '8px' }}>
            {new Date(selectedDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
          <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Constat :</strong> {selectedDay.affluenceTexte}</p>
          <p style={{ margin: '8px 0', fontSize: '13px', color: '#d1d5db', lineHeight: '1.4' }}><strong>🔍 Facteurs :</strong> {selectedDay.details}</p>
          
          <div style={{ 
            marginTop: '12px', 
            padding: '10px', 
            borderRadius: '6px', 
            backgroundColor: selectedDay.meteo.includes('⚠️') || selectedDay.meteo.includes('🥵') || selectedDay.meteo.includes('🌪️') || selectedDay.meteo.includes('⛈️') ? '#991b1b' : '#374151', 
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            <strong>🌤️ Relevé Climat :</strong><br />
            {selectedDay.meteo}
          </div>

          <button 
            onClick={() => setSelectedDay(null)}
            style={{ marginTop: '16px', backgroundColor: '#4b5563', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', width: '100%', fontWeight: '600' }}
          >
            Fermer le volet
          </button>
        </div>
      )}
    </div>
  );
}
