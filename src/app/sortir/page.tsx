"use client";
import React, { useState, useEffect } from 'react';

interface DayData {
  date: string;
  dayNum: number;
  score: number;
  affluenceTexte: string;
  details: string;
  meteo: string;
  meteoTypes: string[];
  estFerie: boolean;
  estVacances: boolean;
  nomVacances: string;
}

interface MonthData {
  name: string;
  days: DayData[];
  blankDaysBefore: number; // Pour décaler le début du mois selon le jour de la semaine
}

export default function TableDeBordSorties() {
  const [calendrier, setCalendrier] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const moisNoms = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  // En-têtes des jours de la semaine (réduits)
  const joursAbreges = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  useEffect(() => {
    const chargerTouteAnnee = async () => {
      const annee = 2025;
      const structureAnnee: MonthData[] = [];

      for (let m = 0; m < 12; m++) {
        const nbJours = new Date(annee, m + 1, 0).getDate();
        
        // Calculer le décalage pour le premier jour du mois (0 = Lundi, 6 = Dimanche)
        // native getDay(): 0 = Dimanche, 1 = Lundi... d'où l'ajustement :
        const premierJourIndex = new Date(annee, m, 1).getDay();
        const blankDaysBefore = premierJourIndex === 0 ? 6 : premierJourIndex - 1;

        const promessesJours = [];

        for (let j = 1; j <= nbJours; j++) {
          const dateStr = `${annee}-${String(m + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
          
          promessesJours.push(
            fetch(`/api/sortir?date=${dateStr}`)
              .then(res => res.json())
              .catch(() => ({
                date: dateStr, dayNum: j, score: 2, affluenceTexte: "Erreur",
                details: "Erreur", meteo: "", meteoTypes: [], estFerie: false, estVacances: false, nomVacances: ""
              }))
          );
        }

        const resultatsJours = await Promise.all(promessesJours);
        structureAnnee.push({
          name: moisNoms[m],
          blankDaysBefore: blankDaysBefore,
          days: resultatsJours.map((d, index) => ({ ...d, dayNum: index + 1 }))
        });
      }

      setCalendrier(structureAnnee);
      setLoading(false);
    };

    chargerTouteAnnee();
  }, []);

  const getColorForNiveau = (score: number) => {
    switch (score) {
case 1: return '#fef08a'; // 🟨 Jaune (ex: #fef08a ou #fde047)
    case 2: return '#fed7aa'; // 🟧 Orange (ex: #fed7aa ou #fb923c)
    case 3: return '#86efac'; // 🟩 Vert (ex: #86efac ou #4ade80)
    default: return '#ffffff';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fafafa' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>🔄 Chargement de la matrice Toulouse (Zone C) 2025...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh', position: 'relative' }}>
      
      {/* BOUTON RETOUR À L'ACCUEIL */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 15px auto' }}>
        <a 
          href="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#4b5563', 
            textDecoration: 'none', 
            fontSize: '14px', 
            fontWeight: '600',
            padding: '8px 16px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#4b5563';
          }}
        >
          🔙 Retour à l'accueil
        </a>
      </div>

      <h1 style={{ textAlign: 'center', color: '#111827', margin: '0 0 5px 0', fontSize: '26px' }}>📅 Tableau de Bord de Fréquentation 2025</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>Configuration Spécifique : <b>Zone C - Académie de Toulouse</b></p>

      {/* BLOC LÉGENDE COMPLET */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 40px auto', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        
        {/* Section 1 : Couleurs */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '15px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Niveaux de Fréquentation :</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}></div>
            <span style={{ fontSize: '13px', color: '#4b5563' }}><b>Score 1 :</b> Peu de monde 🔴</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#fef08a', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}></div>
            <span style={{ fontSize: '13px', color: '#4b5563' }}><b>Score 2 :</b> Moyennement de monde 🟡</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}></div>
            <span style={{ fontSize: '13px', color: '#4b5563' }}><b>Score 3 :</b> Beaucoup de monde 🟢</span>
          </div>
        </div>

        {/* Section 2 : Symboles */}
        <div style={{ padding: '15px', display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap', fontSize: '12px', color: '#4b5563' }}>
          <span>💡 <b>Cliquez sur un jour</b> pour voir le détail.</span>
          <span>🛑 <b>Jour Férié</b> (Bordure pointillée)</span>
          <span>🎒 <b>Vacances Toulouse</b> (Bordure Orange Basse)</span>
          <span>⏳ <b>Jour &gt; 19h30</b></span>
          <span>🥶 <b>&lt; 5°C</b></span>
          <span>🧥 <b>5°C à 10°C</b></span>
          <span>🥵 <b>Canicule</b></span>
          <span>💨 <b>Vent / Tempête</b></span>
          <span>🌧️ <b>Pluie</b></span>
          <span>⛈️ <b>Orage</b></span>
        </div>
      </div>

      {/* Grille des mois */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '25px', maxWidth: '1400px', margin: '0 auto' }}>
        {calendrier.map((month, idx) => (
          <div key={idx} style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>{month.name}</h3>
            
            {/* Grille Calendrier principale à 7 colonnes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              
              {/* ÉTAPE A : Rendu des en-têtes Lu, Ma, Me... */}
              {joursAbreges.map((jAbrev, jIdx) => (
                <div key={`header-${jIdx}`} style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textAlign: 'center', paddingBottom: '4px' }}>
                  {jAbrev}
                </div>
              ))}

              {/* ÉTAPE B : Cases blanches pour caler le 1er du mois sur le bon jour de la semaine */}
              {Array.from({ length: month.blankDaysBefore }).map((_, bIdx) => (
                <div key={`blank-${bIdx}`} style={{ backgroundColor: 'transparent' }} />
              ))}

              {/* ÉTAPE C : Affichage des jours réels */}
              {month.days.map((day, dIdx) => {
                const types = day.meteoTypes || [];
                const aGrosseAlerte = types.includes('canicule') || types.includes('orage') || types.includes('vent');

                return (
                  <div
                    key={dIdx}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      backgroundColor: getColorForNiveau(day.score),
                      padding: '8px 0 20px 0',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      minHeight: '40px',
                      border: aGrosseAlerte ? '2px solid #dc2626' : (day.estFerie ? '2px dashed #374151' : '1px solid rgba(0, 0, 0, 0.05)'),
                      borderBottom: day.estVacances ? '4px solid #f97316' : undefined,
                      transition: 'transform 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {day.dayNum}

                    {/* Zone des symboles sous le chiffre */}
                    <div style={{ position: 'absolute', bottom: '2px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '1px', fontSize: '9px' }}>
                      {day.estFerie && <span>🛑</span>}
                      {day.estVacances && <span>🎒</span>}
                      {types.includes('jour-long') && <span>⏳</span>}
                      {types.includes('grand-froid') && <span>🥶</span>}
                      {types.includes('frais') && <span>🧥</span>}
                      {types.includes('canicule') && <span>🥵</span>}
                      {types.includes('vent') && <span>💨</span>}
                      {types.includes('pluie') && <span>🌧️</span>}
                      {types.includes('orage') && <span>⛈️</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fenêtre Flottante de Détails */}
      {selectedDay && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1f2937', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', maxWidth: '350px', zIndex: 200, border: '1px solid #374151' }}>
          <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize', borderBottom: '1px solid #4b5563', paddingBottom: '6px' }}>
            {new Date(selectedDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Fréquentation :</strong> {selectedDay.affluenceTexte}</p>
          
          {selectedDay.estVacances && (
            <p style={{ margin: '6px 0', fontSize: '13px', color: '#fb923c' }}><strong>🎒 Calendrier Toulouse :</strong> {selectedDay.nomVacances}</p>
          )}

          <p style={{ margin: '6px 0', fontSize: '13px', color: '#9ca3af', whiteSpace: 'pre-line' }}>
            <strong>🔍 Analyse contextuelle :</strong>{"\n• " + selectedDay.details.split(' | ').join('\n• ')}
          </p>
          
          <div style={{ 
            marginTop: '12px', padding: '8px', borderRadius: '6px', 
            backgroundColor: selectedDay.meteoTypes.some(t => ['canicule', 'vent', 'orage'].includes(t)) ? '#991b1b' : '#374151',
            fontSize: '12px' 
          }}>
            <strong>🌤️ Relevés Climat :</strong><br />
            {selectedDay.meteo}
          </div>

          <button onClick={() => setSelectedDay(null)} style={{ marginTop: '14px', backgroundColor: '#4b5563', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: '600' }}>
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
