'use client';

import { useEffect, useState, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Personne {
  id: number;
  section: string;
  titre: string;
  description: string;
}

interface TreeNodeDatum extends RawNodeDatum {
  children?: TreeNodeDatum[];
  attributes?: { description?: string };
}

export default function HierarchieNoblessePage() {
  const [data, setData] = useState<Personne[]>([]);
  const [trees, setTrees] = useState<Record<string, TreeNodeDatum[]>>({});
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [translates, setTranslates] = useState<Record<string, { x: number; y: number }>>({});

  // --- Sections à afficher dans l'arbre ---
  const arbreSections: string[] = [
    'Titres Souverains',
    'Dignité Héréditaire et Titre de Dignité',
    'Grands Officiers de la Couronne',
    'Grands Officiers de la Maison',
    'Titres de Noblesse',
    'Haute Fonction d\'Etat',
    'Premiers Gentilshommes et Officiers ordinaires',
    'Petite Noblesse'
  ];

  // --- Charger données ---
  useEffect(() => {
    fetch('/api/hierarchieNoblesse')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // --- Construire arbres ---
  useEffect(() => {
    if (!data.length) return;

    const newTrees: Record<string, TreeNodeDatum[]> = {};

    arbreSections.forEach(section => {
      const sectionData = data.filter(p => p.section.startsWith(section));
      if (!sectionData.length) return;

      let root: TreeNodeDatum | null = null;
      let current: TreeNodeDatum | null = null;

      sectionData.forEach(p => {
        const node: TreeNodeDatum = {
          name: p.titre,
          attributes: { description: p.description },
          children: []
        };
        if (!root) {
          root = node;
          current = node;
        } else {
          current!.children!.push(node);
          current = node;
        }
      });

      if (root) newTrees[section] = [root];
    });

    setTrees(newTrees);
  }, [data]);

  // --- Centrage des arbres ---
  useEffect(() => {
    const newTranslates: Record<string, { x: number; y: number }> = {};
    Object.keys(trees).forEach(section => {
      const ref = containerRefs.current[section];
      if (ref) newTranslates[section] = { x: ref.offsetWidth / 2, y: 50 };
      else newTranslates[section] = { x: 300, y: 50 };
    });
    setTranslates(newTranslates);
  }, [trees]);

  // --- Sections pour tableaux hors arbre ---
  const officiersOrdinaires = data.filter(p => p.section === 'Officiers ordinaires');
  const serviceEtEcuries = data.filter(p =>
    ['Service et Garde', 'Écuries Royales'].includes(p.section)
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-extrabold mb-6 text-center">👑 Hiérarchie de la Noblesse</h1>

      {/* -------------------- Arbres -------------------- */}
      {arbreSections.map(section => (
        trees[section] ? (
          <div key={section} className="mb-12 bg-white p-4 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">{section}</h2>

            <div ref={el => containerRefs.current[section] = el} style={{ width: '100%', height: '400px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <Tree
                data={trees[section]}
                orientation="vertical"
                nodeSize={{ x: 220, y: 100 }}
                separation={{ siblings: 1.5, nonSiblings: 2 }}
                zoomable
                collapsible={false}
                translate={translates[section] || { x: 300, y: 50 }}
                renderCustomNodeElement={({ nodeDatum }) => (
                  <g>
                    <circle r={20} fill="#2563EB" />
                    <text fill="white" x={0} y={5} textAnchor="middle" fontSize="12" fontWeight="bold">{nodeDatum.name}</text>
                    {nodeDatum.attributes?.description && (
                      <text fill="#000" x={0} y={25} textAnchor="middle" fontSize="10">{nodeDatum.attributes.description}</text>
                    )}
                  </g>
                )}
              />
            </div>

            {/* Tableau sous l'arbre */}
            <table className="w-full table-auto border-collapse border border-gray-300 text-sm mt-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">Titre</th>
                  <th className="border px-2 py-1">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.filter(p => p.section.startsWith(section)).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border px-2 py-1">{p.titre}</td>
                    <td className="border px-2 py-1">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null
      ))}

      {/* -------------------- Tableau Officiers ordinaires -------------------- */}
      {officiersOrdinaires.length > 0 && (
        <div className="mb-12 bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Officiers ordinaires</h2>
          <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Titre</th>
                <th className="border px-2 py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {officiersOrdinaires.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">{p.titre}</td>
                  <td className="border px-2 py-1">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------------------- Tableau Service et Garde / Écuries Royales -------------------- */}
      {serviceEtEcuries.length > 0 && (
        <div className="mb-12 bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Service et Garde / Écuries Royales</h2>
          <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Titre</th>
                <th className="border px-2 py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {serviceEtEcuries.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">{p.titre}</td>
                  <td className="border px-2 py-1">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
