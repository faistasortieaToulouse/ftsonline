import React from 'react';
import Link from "next/link";
import { ArrowLeft, Droplets, Flame, MapPin, Hammer, Factory } from "lucide-react";

async function getArchiToulouse() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  try {
    const res = await fetch(`${baseUrl}/api/brique`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function ArchiToulousePage() {
  const etapes = await getArchiToulouse();

  if (!etapes) return <div className="p-10 text-center italic">Chargement des secrets de la Ville Rose...</div>;

  return (
    <div className="min-h-screen bg-[#fffcf9] py-12 px-4 sm:px-6 lg:px-8 font-serif">
      
      <nav className="max-w-5xl mx-auto mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold transition-all">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>
      
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER PRINCIPAL */}
        <header className="text-center mb-20">
          <h1 className="text-5xl font-serif text-[#8b4513] mb-4 uppercase tracking-tighter">Toulouse & la Brique</h1>
          <div className="h-0.5 w-40 bg-[#d2691e] mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 italic max-w-3xl mx-auto">
            "La brique est l'âme de Toulouse. Si la ville est rose, c'est parce qu'elle a transformé la contrainte de son sol en une signature mondiale."
          </p>
        </header>

        {/* 1. LA MATIÈRE ET LA FABRICATION */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm">
            <h2 className="text-2xl font-bold text-[#8b4513] mb-6 flex items-center gap-2">
              <Droplets className="text-blue-400" /> 1. La Matière Première
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Toulouse est assise sur une <strong>plaine alluviale</strong>. Depuis des millénaires, la Garonne charrie des sédiments depuis les Pyrénées :
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>L'argile :</strong> Le liant qui durcit à la cuisson.</li>
              <li>• <strong>Le sable :</strong> Le "dégraissant" qui évite les fissures.</li>
              <li>• <strong>L'oxyde de fer :</strong> Réagit à la chaleur pour donner la couleur.</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm">
            <h2 className="text-2xl font-bold text-[#8b4513] mb-6 flex items-center gap-2">
              <Factory className="text-gray-500" /> 2. Les Briqueteries
            </h2>
            <p className="text-gray-600 text-sm mb-4 italic">"On fabriquait les briques là où on creusait."</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Briqueteries foraines :</strong> Aux portes de la ville (frais de transport réduits).</li>
              <li>• <strong>Quartiers Rive Gauche :</strong> Blagnac, Lardenne et Saint-Cyprien (terre grasse).</li>
              <li>• <strong>Virebent :</strong> Manufacture célèbre pour ses décors moulés (Launaguet).</li>
            </ul>
          </div>
        </div>

        {/* 2. CHRONOLOGIE HISTORIQUE (Données API) */}
        <div className="relative border-l-2 border-[#d2691e] ml-4 md:ml-10 space-y-16 mb-24">
          <h2 className="text-3xl font-bold text-[#8b4513] mb-10 pl-4 uppercase">L'Évolution du Style</h2>
          {etapes.map((etape: any) => (
            <div key={etape.id} className="relative pl-8 md:pl-12">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-[#d2691e] border-2 border-white shadow-sm"></div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                <span className="text-sm font-bold text-[#d2691e] uppercase tracking-widest">{etape.époque}</span>
                <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-4">{etape.titre}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{etape.description}</p>
                <div className="flex flex-wrap gap-2">
                  {etape.points_cles.map((item: string, idx: number) => (
                    <span key={idx} className="text-xs bg-orange-50 text-[#8b4513] px-3 py-1 rounded-full border border-orange-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. LE SECRET DES COULEURS & GÉOLOGIE */}
        <section className="mb-24 bg-white p-10 rounded-3xl border border-orange-100 shadow-sm">
          <h2 className="text-3xl font-bold text-[#8b4513] mb-10 flex items-center gap-3">
            <Flame className="text-[#d2691e]" /> Pourquoi Rose, Rouge ou Jaune ?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">A. Chimie & Terroir</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-bold text-red-700">Fer + Oxygène = Rouge/Rose</h4>
                  <p className="text-sm text-gray-600">Le standard toulousain, Albi et le Tarn (très riche en fer).</p>
                </div>
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-bold text-amber-600">Calcaire + Fer = Jaune/Paille</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Le Gers :</strong> Le calcaire des molasses "blanchit" le fer. 
                    Typique des bastides comme Lectoure ou Gimont.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">B. Position dans le four</h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="w-4 h-4 rounded bg-red-900 shrink-0"></span>
                  <span><strong>Cœur du foyer :</strong> Cuisson forte, briques brunes/violettes (très dures).</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-4 h-4 rounded bg-orange-300 shrink-0"></span>
                  <span><strong>Périphérie :</strong> Cuisson douce, briques saumonées ou roses (plus tendres).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* TABLEAU RÉCAPITULATIF DES PROVENANCES */}
          <div className="mt-12 overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm bg-orange-50/30">
              <thead className="bg-[#8b4513] text-white">
                <tr>
                  <th className="p-3">Couleur</th>
                  <th className="p-3">Provenance historique</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-orange-100">
                  <td className="p-3 font-medium text-red-600">Rose / Saumon</td>
                  <td className="p-3">Toulouse (Limon Garonne)</td>
                </tr>
                <tr className="border-b border-orange-100">
                  <td className="p-3 font-medium text-red-900">Rouge Vif / Brun</td>
                  <td className="p-3">Albi / Montauban / Tarn</td>
                </tr>
                <tr className="border-b border-orange-100">
                  <td className="p-3 font-medium text-amber-600">Jaune / Crème</td>
                  <td className="p-3">Gers (Lomagne / Vallée de la Save)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-gray-500">Gris / Blanc</td>
                  <td className="p-3">Briqueteries modernes (XXIe siècle)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. ZONES DE RENCONTRE & MODERNITÉ */}
        <section className="mb-24 grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-orange-100 rounded-2xl border-2 border-dashed border-orange-300">
            <h3 className="text-xl font-bold text-[#8b4513] mb-4">Le "Jeu de Briques"</h3>
            <p className="text-[#a0522d] text-sm leading-relaxed">
              Dans les quartiers Ouest (Lardenne, Tournefeuille), on mélange les briques rouges locales et les briques jaunes du Gers pour décorer les angles des murs et les fenêtres.
            </p>
          </div>
          <div className="p-8 bg-slate-800 text-white rounded-2xl">
            <h3 className="text-xl font-bold text-amber-400 mb-4">La Brique au XXIe siècle</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Aujourd'hui, on utilise des mélanges industriels pour obtenir du gris anthracite ou du blanc pur. 
              La brique "grise" (Cartoucherie) vient d'une cuisson sans oxygène.
            </p>
          </div>
        </section>

        {/* FOOTER SAVIEZ-VOUS */}
        <div className="p-10 bg-[#8b4513] text-white rounded-3xl shadow-inner relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
             <Hammer size={200} />
          </div>
          <h3 className="text-2xl font-bold mb-4">Le saviez-vous ?</h3>
          <p className="text-orange-100 leading-relaxed max-w-2xl">
            Au XVIIIe siècle, la brique était jugée "pauvre". Les riches toulousains peignaient leurs façades en blanc pour faire croire que leurs maisons étaient en pierre de taille, comme à Paris ! C'est seulement plus tard qu'on a redécouvert et assumé la beauté du "rose" naturel.
          </p>
        </div>

        <footer className="mt-20 text-center text-gray-400 text-sm border-t border-orange-100 pt-10">
          <p>Archives de l'Architecture Toulousaine • Dossier Spécial 2026</p>
        </footer>
      </div>
    </div>
  );
}
