'use client';

import { useEffect, useState, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';

interface Personne {
  personne: string;
  institution?: string;
  lieu?: string;
  superieur?: string | null;
  niveau_equivalent?: string | null;
}

interface TreeNodeDatum extends RawNodeDatum {
  children?: TreeNodeDatum[];
  attributes?: { institution?: string; lieu?: string };
}

// Ordres pour les trois tableaux / arbres
const ordreTableau1 = [
  'Commanderie hospitalière','Baillie hospitalière','Langues hospitalières',
  'Grand Prieuré hospitalier','Prieuré hospitalier','chapellenie hospitalière',
  'maisons hospitalières','Moine-soldat','Marine'
];

const ordreTableau2 = [
  'Hôspitaliers','Grand hospitalier','supérieur régional','commandeur','bailli',
  'pilier','grand prieur','prieur','chapelain','sergent d\'arme',
  'Chevalier-Hospitalier','Frère hospitalier','amrial','officiers','capitaine',
  'chevalier','frère'
];

const ordreTableau3 = [
  'Première classe','Chevaliers de justice','Chapelains conventuels',
  'Deuxième classe','Chevaliers et dames d\'honneur et de dévotion en obédience',
  'Chevaliers et dames de grâce et de dévotion en obédience',
  'Chevaliers et dames de grâce magistrale en obédience',
  'Troisième classe','Chevaliers et dames d\'honneur et de dévotion','Chapelains conventuels ad honorem',
  'Chevaliers et dames de grâce et de dévotion','Chapelains magistraux','Diacres magistraux',
  'Chevaliers et dames de grâce magistrale','Donats et donates de dévotion'
];

export default function HierarchieMaltePage() {
  const [data, setData] = useState<Personne[]>([]);
  const [trees, setTrees] = useState<TreeNodeDatum[][]>([[], [], []]);
  const [translates, setTranslates] = useState([{ x: 0, y: 50 }, { x: 0, y: 50 }, { x: 0, y: 50 }]);
  const containerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const treeNodeSize = { x: 180, y: 100 };

  // --- Charger JSON ---
  useEffect(() => {
    fetch('/api/hierarchieMalte')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // --- Construire arbres linéaires ---
  useEffect(() => {
    if (data.length === 0) return;

    const buildLinearTree = (ordre: string[]): TreeNodeDatum[] => {
      let root: TreeNodeDatum | null = null;
      let current: TreeNodeDatum | null = null;

      ordre.forEach(name => {
        const p = data.find(p => p.personne === name);
        const node: TreeNodeDatum = {
          name,
          attributes: {
            institution: p?.institution || '-',
            lieu: p?.lieu || '-'
          },
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

      return root ? [root] : [];
    };

    setTrees([
      buildLinearTree(ordreTableau1),
      buildLinearTree(ordreTableau2),
      buildLinearTree(ordreTableau3)
    ]);
  }, [data]);

  // --- Centrer chaque arbre ---
  useEffect(() => {
    const newTranslates = containerRefs.map(ref => ({
      x: ref.current ? ref.current.offsetWidth / 2 : 300,
      y: 50
    }));
    setTranslates(newTranslates);
  }, [trees]);

  // --- Générer tableau ---
  const renderTable = (ordre: string[]) => (
    <tbody>
      {ordre.map((name, idx) => {
        const p = data.find(p => p.personne === name);
        return (
          <tr key={idx} className="hover:bg-gray-50">
            <td className="border px-2 py-1 text-center">{idx + 1}</td>
            <td className="border px-2 py-1">{name}</td>
            <td className="border px-2 py-1">{p?.institution || '-'}</td>
            <td className="border px-2 py-1">{p?.lieu || '-'}</td>
            <td className="border px-2 py-1">{p?.superieur || '-'}</td>
          </tr>
        );
      })}
    </tbody>
  );

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center">🏰 Hiérarchie de l'ordre de Malte</h1>

      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-8">
          {['Ordre militaire','Hôspitaliers','Ordre de Malte'].map((title, i) => (
            <div key={i} className="bg-white p-4 rounded shadow flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>

              <div ref={containerRefs[i]} style={{ width: '100%', height: '400px' }}>
                {trees[i].length > 0 && (
                  <Tree
                    data={trees[i]}
                    orientation="vertical"
                    nodeSize={treeNodeSize}
                    separation={{ siblings: 1.5, nonSiblings: 2 }}
                    zoomable
                    collapsible={false}
                    translate={translates[i]}
                    renderCustomNodeElement={({ nodeDatum }) => (
                      <g>
                        <circle r={22} fill="#2563EB" />
                        <text fill="white" x={0} y={5} textAnchor="middle" fontSize="11" fontWeight="600">{nodeDatum.name}</text>
                        {nodeDatum.attributes?.institution && (
                          <text fill="#000" x={0} y={30} textAnchor="middle" fontSize="9">{nodeDatum.attributes.institution}</text>
                        )}
                        {nodeDatum.attributes?.lieu && (
                          <text fill="#000" x={0} y={45} textAnchor="middle" fontSize="8">{nodeDatum.attributes.lieu}</text>
                        )}
                      </g>
                    )}
                  />
                )}
              </div>

              <table className="w-full table-auto border-collapse border border-gray-300 mt-4 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">Nom</th>
                    <th className="border px-2 py-1">Institution</th>
                    <th className="border px-2 py-1">Lieu</th>
                    <th className="border px-2 py-1">Supérieur</th>
                  </tr>
                </thead>
                {i === 0 ? renderTable(ordreTableau1) :
                 i === 1 ? renderTable(ordreTableau2) :
                 renderTable(ordreTableau3)}
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
