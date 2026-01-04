'use client';

import { useEffect, useState, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';

interface Personne {
  id: number;
  personne: string;
  lieu: string | null;
  institution: string | null;
  ordre: string | null;
  superieur: string | null;
  niveau_equivalent: string | null;
}

interface TreeNodeDatum extends RawNodeDatum {
  numero: number;
  children?: TreeNodeDatum[];
}

export default function HierarchieChartreuxPage() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeDatum[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const treeContainer = useRef<HTMLDivElement | null>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // --- Charger les données ---
  useEffect(() => {
    fetch('/api/hierarchieChartreux')
      .then(res => res.json())
      .then((data: Personne[]) => {
        // On force les ID si pas présent
        setPersonnes(data.map((p, i) => ({ ...p, id: i + 1 })));
      })
      .catch(console.error);
  }, []);

  // --- Construire l'arbre linéaire en suivant l'ordre d'ID ---
  useEffect(() => {
    if (personnes.length === 0) return;

    // Racine = premier niveau
    const rootNode: TreeNodeDatum = {
      name: personnes[0].personne,
      numero: personnes[0].id,
      children: [],
    };

    let currentNode = rootNode;

    for (let i = 1; i < personnes.length; i++) {
      const node: TreeNodeDatum = {
        name: personnes[i].personne,
        numero: personnes[i].id,
        children: [],
      };
      currentNode.children!.push(node);
      currentNode = node;
    }

    setTreeData([rootNode]);
  }, [personnes]);

  // --- Centrer le conteneur ---
  useEffect(() => {
    if (treeContainer.current) {
      const { offsetWidth } = treeContainer.current;
      setTranslate({ x: offsetWidth / 2, y: 50 });
    }
  }, [treeContainer.current]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">
        ⛪ Hiérarchie des Chartreux
      </h1>

      {/* --- Arbre --- */}
      <div
        ref={treeContainer}
        style={{ width: '100%', height: '60vh', border: '1px solid #ccc', borderRadius: '8px' }}
        className="mb-8 relative bg-gray-50"
      >
        {treeData.length > 0 && (
          <Tree
            data={treeData}
            translate={translate}
            nodeSize={{ x: 200, y: 100 }}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            orientation="vertical"
            renderCustomNodeElement={({ nodeDatum, toggleNode }) => {
              return (
                <g
                  key={`${nodeDatum.numero}-${nodeDatum.name}`}
                  onMouseEnter={(e) =>
                    setTooltip({ x: e.clientX + 10, y: e.clientY + 10, text: nodeDatum.name })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'default' }}
                >
                  <circle
                    r={20}
                    fill="#2563EB"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <text
                    fill="white"
                    stroke="none"
                    x={0}
                    y={5}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {nodeDatum.numero}
                  </text>
                </g>
              );
            }}
          />
        )}

        {tooltip && (
          <div
            style={{
              position: 'fixed',
              top: tooltip.y,
              left: tooltip.x,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              padding: '4px 8px',
              borderRadius: '4px',
              pointerEvents: 'none',
              fontSize: '12px',
              zIndex: 10,
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* --- Tableau --- */}
      <h2 className="text-2xl font-semibold mb-4">Tableau des niveaux</h2>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1">#</th>
            <th className="border border-gray-300 px-2 py-1">Personne</th>
            <th className="border border-gray-300 px-2 py-1">Lieu</th>
            <th className="border border-gray-300 px-2 py-1">Institution</th>
            <th className="border border-gray-300 px-2 py-1">Ordre</th>
            <th className="border border-gray-300 px-2 py-1">Supérieur</th>
            <th className="border border-gray-300 px-2 py-1">Équivalent</th>
          </tr>
        </thead>
        <tbody>
          {personnes.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1 text-center">{p.id}</td>
              <td className="border border-gray-300 px-2 py-1">{p.personne}</td>
              <td className="border border-gray-300 px-2 py-1">{p.lieu || '-'}</td>
              <td className="border border-gray-300 px-2 py-1">{p.institution || '-'}</td>
              <td className="border border-gray-300 px-2 py-1">{p.ordre || '-'}</td>
              <td className="border border-gray-300 px-2 py-1">{p.superieur || '-'}</td>
              <td className="border border-gray-300 px-2 py-1">{p.niveau_equivalent || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
