import React from 'react';
import Link from "next/link";
import { ArrowLeft, Droplets, Flame, MapPin, Hammer } from "lucide-react";

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

  if (!etapes) return <div className="p-10 text-center">Chargement de l'histoire rose...</div>;

  return (
    <div className="min-h-screen bg-[#fffcf9] py-12 px-4 sm:px-6 lg:px-8 font-serif">
      
      <nav className="max-w-5xl mx-auto mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold transition-all">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>
      
      <div className="max-w-5xl mx-auto">
        
        {/* SECTION 1 : INTRODUCTION & TIMELINE */}
        <header className="text-center mb-20">
          <h1 className="text-5xl font-serif text-[#8b4513] mb-4 uppercase tracking-tighter">Toulouse & la Brique</h1>
          <div className="h-0.5 w-40 bg-[#d2691e] mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 italic max-w-2xl mx-auto">
            "La ville est rose parce qu'elle a transformé la contrainte de son sol en une signature mondiale."
          </p>
        </header>

        <div className="relative border-l-2 border-[#d2691e] ml-4 md:ml-10 space-y-16 mb-24">
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

        {/* SECTION 2 : SECRETS DE FABRICATION */}
        <section className="mb-24 bg-white p-10 rounded-3xl border border-orange-100 shadow-sm">
          <h2 className="text-3xl font-bold text-[#8b4513] mb-8 flex items-center gap-3">
            <Hammer className="text-[#d2691e]" /> Les Secrets de la Brique Foraine
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets size={18} className="text-blue-400" /> La Matière : Le Limon
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Toulouse est assise sur une plaine alluviale. Depuis des millénaires, la Garonne charrie des sédiments pyrénéens : 
                <strong> l'argile</strong> (liant), <strong>le sable</strong> (dégraissant) et <strong>l'oxyde de fer</strong> (colorant naturel).
              </p>
              <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-xs font-bold text-[#d2691e] uppercase mb-2">Format Unique</p>
                <p className="text-sm text-gray-700 italic">42 x 28 x 5 cm : Un format large et plat qui permet une cuisson homogène à cœur.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Flame size={18} className="text-orange-500" /> L'Art de la Cuisson
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                La couleur dépend de la position dans le four à bois :
              </p>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li><span className="font-bold text-red-900">■ Cœur du foyer :</span> Briques sombres, violettes, très dures (résistantes à l'eau).</li>
                <li><span className="font-bold text-orange-400">■ Périphérie :</span> Cuisson douce, briques claires, saumonées ou roses (plus tendres).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 3 : GÉOLOGIE DES COULEURS */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-[#8b4513] mb-8 flex items-center gap-3">
            <MapPin className="text-[#d2691e]" /> Géographie de la Couleur
          </h2>
          
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-left bg-white border-collapse">
              <thead className="bg-[#8b4513] text-white">
                <tr>
                  <th className="p-4 uppercase text-xs tracking-widest">Couleur</th>
                  <th className="p-4 uppercase text-xs tracking-widest">Composant</th>
                  <th className="p-4 uppercase text-xs tracking-widest">Provenance</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                <tr>
                  <td className="p-4 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f4a460]"></div> Rose / Saumon</td>
                  <td className="p-4 italic">Fer + Cuisson douce</td>
                  <td className="p-4 font-bold">Toulouse (Limon Garonne)</td>
                </tr>
                <tr>
                  <td className="p-4 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8b0000]"></div> Rouge / Brun</td>
                  <td className="p-4 italic">Fer + Cuisson forte</td>
                  <td className="p-4 font-bold">Albi / Montauban</td>
                </tr>
                <tr>
                  <td className="p-4 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f5deb3]"></div> Jaune / Crème</td>
                  <td className="p-4 italic">Calcaire + Sable</td>
                  <td className="p-4 font-bold">Gers (Lomagne)</td>
                </tr>
                <tr>
                  <td className="p-4 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#d1d5db]"></div> Gris / Blanc</td>
                  <td className="p-4 italic">Mélanges Kaolinitiques</td>
                  <td className="p-4 font-bold">Briqueteries Modernes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-500 italic text-right">Le mélange brique rouge / brique jaune du Gers est fréquent dans les quartiers Ouest (Lardenne).</p>
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
          <p>Dossier Spécial : Architecture et Terroir Occitan • 2026</p>
        </footer>
      </div>
    </div>
  );
}
