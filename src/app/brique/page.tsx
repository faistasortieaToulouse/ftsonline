import React from 'react';
import Link from "next/link";
import { ArrowLeft, Droplets, Flame, MapPin, Hammer, Factory, Layers } from "lucide-react";

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

        {/* 1. MATIÈRE PREMIÈRE & FABRICATION */}
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm">
              <h2 className="text-2xl font-bold text-[#8b4513] mb-6 flex items-center gap-2">
                <Droplets className="text-blue-400" /> 1. D'où vient la matière première ?
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                La matière première, c'est <strong>le limon de la Garonne</strong>. Toulouse est assise sur une plaine alluviale qui charrie des sédiments pyrénéens :
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>• <strong>L'argile :</strong> Le liant qui durcit à la cuisson.</li>
                <li>• <strong>Le sable :</strong> Sert de "dégraissant" pour éviter que la brique ne se fende au séchage.</li>
                <li>• <strong>L'oxyde de fer :</strong> Naturellement présent, il réagit à la chaleur pour donner la couleur.</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm">
              <h2 className="text-2xl font-bold text-[#8b4513] mb-6 flex items-center gap-2">
                <Factory className="text-gray-500" /> 2. Où étaient-elles fabriquées ?
              </h2>
              <p className="text-gray-600 text-sm mb-4">Historiquement, on fabriquait les briques là où on creusait :</p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>• <strong>Briqueteries foraines :</strong> Situées aux portes de la ville pour limiter les frais de charrette.</li>
                <li>• <strong>Quartiers historiques :</strong> Blagnac, Lardenne et Saint-Cyprien (rive gauche) possédaient une terre particulièrement grasse.</li>
                <li>• <strong>Manufacture Virebent :</strong> Célèbre au XIXe pour ses briques moulées et décors de façades (Launaguet).</li>
              </ul>
            </div>
          </div>
        </section>

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

{/* 3. GÉOGRAPHIE DES COULEURS (Gers, Lauragais, Tarn) */}
<section className="mb-24 bg-white p-10 rounded-3xl border border-orange-100 shadow-sm">
  <h2 className="text-3xl font-bold text-[#8b4513] mb-10 flex items-center gap-3">
    <MapPin className="text-[#d2691e]" /> Géographie de la Couleur
  </h2>
  
  <div className="space-y-12">
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {/* GERS */}
      <div className="border-l-4 border-amber-400 pl-6">
        <h3 className="text-xl font-bold text-amber-700 mb-3">Le Gers : Le royaume de la brique jaune</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Le sol possède des <strong>molasses calcaires</strong>. Le calcaire "blanchit" l'oxyde de fer pendant la cuisson. 
          La brique prend des teintes crème, jaune pâle ou moutarde.
        </p>
        <p className="text-xs text-amber-800 font-bold uppercase tracking-wide">Où en voir ? Bastides (Gimont, Lectoure) et haute vallée de la Save.</p>
      </div>

      {/* LAURAGAIS & TARN */}
      <div className="border-l-4 border-red-800 pl-6">
        <h3 className="text-xl font-bold text-red-900 mb-3">Le Lauragais et le Tarn : Les nuances d'ocre</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Vers <strong>Castres et Albi</strong>, la terre riche en fer donne les briques les plus sombres (Cathédrale d'Albi). 
          Vers <strong>Castelnaudary (Lauragais)</strong>, on obtient un orangé ou ocre chaleureux.
        </p>
      </div>
    </div>

    {/* ZONES DE RENCONTRE */}
    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
      <h3 className="text-lg font-bold text-[#8b4513] mb-2 flex items-center gap-2">
        <Layers size={20} /> Les "zones de rencontre" (Toulouse Ouest)
      </h3>
      <p className="text-gray-700 text-sm leading-relaxed">
        À <strong>Lardenne</strong> ou <strong>Tournefeuille</strong>, les bâtisseurs utilisaient la brique jaune du Gers pour les encadrements de fenêtres afin de créer un contraste avec la brique rouge locale. On appelle cela le <strong>"jeu de briques"</strong>.
      </p>
    </div>

    {/* TABLEAU RÉCAPITULATIF INTÉGRÉ */}
    <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-left text-sm bg-orange-50/20">
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
          <tr className="bg-white/50">
            <td className="p-3 font-medium text-gray-500">Gris / Blanc</td>
            <td className="p-3">Briqueteries modernes (XXIe siècle)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
        
        {/* 4. LA BRIQUE ACTUELLE (XXIe SIÈCLE) */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-slate-800 mb-10 flex items-center gap-3">
            <Flame className="text-slate-500" /> La brique actuelle (XXIe siècle)
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Mélanges industriels</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Les briqueteries modernes (comme Terreal) mélangent des argiles de carrières différentes pour obtenir des couleurs précises : <strong>gris anthracite, blanc pur ou rouge éclatant</strong>.
              </p>
            </div>
            <div className="p-8 bg-slate-800 text-white rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold text-slate-300 mb-4">La brique "grise"</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Très présente à <strong>La Cartoucherie</strong>, elle ne vient pas de terre grise mais d'un processus de <strong>réduction d'oxygène</strong> lors de la cuisson qui change la couleur naturelle de l'argile.
              </p>
            </div>
          </div>
        </section>        
      
{/* --- NOUVEAU BLOC : L'ÉPOPÉE DES BRIQUETIERS --- */}
<section className="mb-24">
  <h2 className="text-3xl font-bold text-[#8b4513] mb-10 flex items-center gap-3">
    <Hammer className="text-[#d2691e]" /> L'Épopée des Briquetiers
  </h2>

  <div className="grid md:grid-cols-2 gap-8">
    
    {/* 1. CYCLE SAISONNIER */}
    <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ThermometerSnowflake size={20} className="text-blue-400" /> Le Cycle des Saisons
      </h3>
      <div className="space-y-4">
        <div>
          <span className="font-bold text-[#d2691e]">Hiver (L'Extraction) :</span>
          <p className="text-sm text-gray-600">On extrait le limon. Le gel brise les mottes : c'est le "pourrissement" indispensable à la souplesse de la terre.</p>
        </div>
        <div>
          <span className="font-bold text-[#d2691e]">Printemps (Le Moulage) :</span>
          <p className="text-sm text-gray-600">Le travail se fait à genoux. On jette la pâte dans des cadres en bois sablés pour donner forme à la brique.</p>
        </div>
        <div>
          <span className="font-bold text-[#d2691e]">Été (Le Séchage) :</span>
          <p className="text-sm text-gray-600">Les briques reposent sous des "haies" (hangars ouverts). Un séchage trop brutal au soleil les ferait éclater.</p>
        </div>
      </div>
    </div>

    {/* 2. RÉVOLUTION VIREBENT */}
    <div className="bg-[#fdf2e9] p-8 rounded-2xl border border-orange-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <DraftingCompass size={20} className="text-[#d2691e]" /> L'Ère Virebent (XIXe)
      </h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        Cette famille a démocratisé le luxe. Grâce à l'invention du <strong>"ciseau"</strong> (découpe mécanique), ils ont produit des colonnes et statues en série.
      </p>
      <p className="text-sm text-gray-700 italic">
        "C'est grâce à eux que les façades bourgeoises arborent ces décors Renaissance en terre cuite sans le prix de la pierre sculptée."
      </p>
    </div>

    {/* 3. LES DERNIERS GÉANTS */}
    <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Factory size={20} className="text-gray-500" /> Noms Emblématiques
      </h3>
      <ul className="space-y-4 text-sm">
        <li>
          <strong className="text-[#8b4513]">Briqueterie Nagen :</strong> Située à Saint-Marcel-Paulel, elle utilise toujours le célèbre <strong>four Hoffmann</strong> pour restaurer nos monuments historiques.
        </li>
        <li>
          <strong className="text-[#8b4513]">Terreal :</strong> Le successeur des Briqueteries du Midi, exportant aujourd'hui le "style toulousain" dans le monde entier.
        </li>
      </ul>
    </div>

    {/* 4. L'EXIL HORS LA VILLE */}
    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <CloudOff size={20} className="text-slate-500" /> Pourquoi ont-elles quitté le centre ?
      </h3>
      <ul className="space-y-3 text-sm text-slate-600">
        <li>• <strong>Le risque d'incendie :</strong> Les étincelles des fours à bois menaçaient les toitures médiévales.</li>
        <li>• <strong>La pollution :</strong> Les fumées noires constantes étaient devenues insupportables pour les riverains.</li>
      </ul>
    </div>
  </div>

  {/* ANECDOTE FORMAT */}
  <div className="mt-8 p-6 bg-amber-50 rounded-xl border-l-4 border-amber-400 italic">
    <p className="text-sm text-amber-900">
      <span className="font-bold">Le secret du format 42x28x5 cm :</span> Ce n'est pas qu'une question de style ! Ce format plat permettait à la brique de sécher de façon homogène. Plus épaisse, le cœur resterait humide et la brique exploserait littéralement dans le four sous la pression de la vapeur d'eau.
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
            Au XVIIIe siècle, la brique était jugée "pauvre". Les riches toulousains peignaient leurs façades en blanc pour imiter la pierre de taille parisienne ! C'est seulement plus tard qu'on a redécouvert et assumé la beauté du "rose" naturel.
          </p>
        </div>

        <footer className="mt-20 text-center text-gray-400 text-sm border-t border-orange-100 pt-10 font-sans">
          <p>Archives de l'Architecture Toulousaine • Données 2026</p>
        </footer>
      </div>
    </div>
  );
}
