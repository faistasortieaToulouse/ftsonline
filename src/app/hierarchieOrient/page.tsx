'use client';

import { useEffect, useState, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';

interface Rang {
  rang: string;
  hommes: string[];
}

interface Hierarchie {
  occident: Rang[];
  orient: Rang[];
}

interface TreeNodeDatumExtended extends RawNodeDatum {
  children?: TreeNodeDatumExtended[];
  attributes?: { description?: string };
}

export default function HierarchieTemplePage() {
  const [hierarchie, setHierarchie] = useState<Hierarchie | null>(null);
  const [trees, setTrees] = useState<{ occident: TreeNodeDatumExtended[]; orient: TreeNodeDatumExtended[] }>({ occident: [], orient: [] });
  const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [translates, setTranslates] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Ordre hiérarchique Occident et Orient
  const ordreOccident = [
    "maître de l'ordre",
    "maître en deçà-mer puis visiteur",
    "maître de province ou pays ou précepteur",
    "maître de baillie",
    "maître du passage",
    "commandeur ou précepteur de maison",
    "procureur",
    "frères chapelains",
    "frères chevaliers",
    "frères sergents d'arme",
    "frères de métier",
    "serfs et serviteurs"
  ];

  const ordreOrient = [
    "Grand commandeur",
    "Maître",
    "Sénéchal",
    "Maréchal",
    "Commandeur du royaume de Jérusalem",
    "Drapier",
    "Commandeur de la cité de Jérusalem",
    "Commandeur de province",
    "Commandeur de maisons ou châtelains",
    "Commandeur des chevaliers"
  ];

  // Hommes à leur service pour Orient (fixe)
  const serviceOrient: Record<string, string[]> = {
    "Maître": [
      "frère-chapelain",
      "clerc",
      "frère-sergent",
      "valet",
      "maréchal-ferrant",
      "écrivain sarrasin",
      "turcopole",
      "queux",
      "palefrenier 1",
      "palefrenier 2"
    ],
    "Sénéchal": [
      "écuyer 1",
      "écuyer 2",
      "frère chevalier",
      "frère sergent",
      "diacre-écrivain",
      "turcopole",
      "écrivain sarrasin",
      "palefrenier 1",
      "palefrenier 2"
    ],
    "Maréchal": [
      "écuyer 1",
      "écuyer 2",
      "frère-sergent",
      "turcopole"
    ],
    "Commandeur du royaume de Jérusalem": [
      "écuyer 1",
      "écuyer 2",
      "frère sergent",
      "diacre lettré",
      "soldat turcopole",
      "écrivain",
      "palefrenier 1",
      "palefrenier 2"
    ],
    "Drapier": [
      "écuyer 1",
      "écuyer 2",
      "sommelier",
      "aiguillier",
      "grembeleure",
      "équipe de parmentiers"
    ],
    "Commandeur de la cité de Jérusalem": [
      "écuyer 1",
      "écuyer 2",
      "frère sergent",
      "écrivain sarrasin",
      "soldat turcopole"
    ],
    "Commandeur de province": [
      "chevalier",
      "frère sergent",
      "diacre",
      "turcopole",
      "écrivain sarrasin",
      "palefrenier"
    ],
    "Commandeur de maisons ou châtelains": [
      "écuyer 1",
      "écuyer 2"
    ],
    "Commandeur des chevaliers": [
      "écuyer"
    ]
  };

  // --- Charger données ---
  useEffect(() => {
    fetch('/api/hierarchieOrient')
      .then(res => res.json())
      .then((data: any) => {
        const all = [...(data.maison_centrale || []), ...(data.provinces || []), ...(data.armee || [])];

        // Construire Occident
        const occident: Rang[] = ordreOccident.map(rang => ({
          rang,
          hommes: all.filter(p => p.superieur?.toLowerCase() === rang.toLowerCase()).map(p => p.personne)
        }));

        // Construire Orient
        const orient: Rang[] = ordreOrient.map(rang => ({
          rang,
          hommes: serviceOrient[rang] || []
        }));

        setHierarchie({ occident, orient });

        // --- Construire arbres verticaux ---
        const buildTree = (ordre: string[]): TreeNodeDatumExtended[] => {
          const root: TreeNodeDatumExtended = { name: ordre[0], children: [] };
          let current = root;
          for (let i = 1; i < ordre.length; i++) {
            const node: TreeNodeDatumExtended = { name: ordre[i], children: [] };
            current.children!.push(node);
            current = node;
          }
          return [root];
        };

        setTrees({
          occident: buildTree(ordreOccident),
          orient: buildTree(ordreOrient)
        });
      })
      .catch(console.error);
  }, []);

  // --- Centrage des arbres ---
  useEffect(() => {
    const newTranslates: { [key: string]: { x: number; y: number } } = {};
    ['occident', 'orient'].forEach(key => {
      const ref = containerRefs.current[key];
      newTranslates[key] = ref ? { x: ref.offsetWidth / 2, y: 50 } : { x: 300, y: 50 };
    });
    setTranslates(newTranslates);
  }, [trees]);

  const renderTree = (titre: string, data: TreeNodeDatumExtended[], sectionKey: string) => (
    <div className="mb-6 bg-white p-4 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">{titre}</h2>
      <div
        ref={el => (containerRefs.current[sectionKey] = el)}
        style={{ width: '100%', height: '600px', border: '1px solid #ccc', borderRadius: '8px' }}
      >
        <Tree
          data={data}
          orientation="vertical"
          nodeSize={{ x: 200, y: 100 }}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          zoomable
          collapsible={false}
          translate={translates[sectionKey] || { x: 300, y: 50 }}
          renderCustomNodeElement={({ nodeDatum }) => (
            <g>
              <circle r={20} fill="#2563EB" />
              <text fill="white" x={0} y={5} textAnchor="middle" fontSize="12" fontWeight="bold">
                {nodeDatum.name}
              </text>
            </g>
          )}
        />
      </div>
    </div>
  );

  const renderTable = (titre: string, data: Rang[]) => (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">{titre}</h2>
      <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Rang</th>
            <th className="border px-2 py-1">Hommes à leur service</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-2 py-1 font-semibold">{d.rang}</td>
              <td className="border px-2 py-1">{d.hommes.join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!hierarchie) return <div>Chargement…</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center">👑 Hiérarchie de l'Ordre du Temple</h1>

      {/* Occident */}
      {renderTree("Arbre du Temple en Occident", trees.occident, 'occident')}
      {renderTable("Ordre du Temple en Occident", hierarchie.occident)}

      {/* Orient */}
      {renderTree("Arbre du Temple en Orient", trees.orient, 'orient')}
      {renderTable("Ordre du Temple en Orient", hierarchie.orient)}
    </div>
  );
}
