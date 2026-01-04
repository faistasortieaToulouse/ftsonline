'use client';

import { useEffect, useState, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';

interface Hospitalier {
  id: number;
  personne: string;
  lieu: string;
  institution: string;
  ordre: string;
  superieur: string;
  niveau_equivalent: string | null;
}

interface TreeNodeDatum extends RawNodeDatum {
  numero: number;
  children?: TreeNodeDatum[];
}

export default function HierarchieHospitalierPage() {
  const [personnes, setPersonnes] = useState<Hospitalier[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeDatum[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const treeContainer = useRef<HTMLDivElement | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // -----------------------------
  // Charger les données
  // -----------------------------
  useEffect(() => {
    fetch('/api/hierarchieHospitalier')
      .then(res => res.json())
      .then((data) => {
        // L'ordre du JSON = ordre hiérarchique
        const withId = data.map((p: any, index: number) => ({
          ...p,
          id: index + 1,
        }));
        setPersonnes(withId);
      })
      .catch(console.error);
  }, []);

  // -----------------------------
  // Construire l'arbre linéaire
  // -----------------------------
  useEffect(() => {
    if (personnes.length === 0) return;

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

  // -----------------------------
  // Centrage automatique
  // -----------------------------
  useEffect(() => {
    if (treeContainer.current) {
      const { offsetWidth } = treeContainer.current;
      setTranslate({ x: offsetWidth / 2, y: 60 });
    }
  }, [treeContainer.current]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">
        🛡️ Hiérarchie Hospitalière
      </h1>

      {/* ===== ARBRE ===== */}
      <div
        ref={treeContainer}
        style={{ width: '100%', height: '65vh' }}
        className="relative mb-10 border rounded-lg bg-gray-50"
      >
        {treeData.length > 0 && (
          <Tree
            data={treeData}
            translate={translate}
            orientation="vertical"
            nodeSize={{ x: 240, y: 110 }}
            separation={{ siblings: 1.4, nonSiblings: 2 }}
            renderCustomNodeElement={({ nodeDatum, toggleNode }) => {
              const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

              return (
                <g
                  onMouseEnter={(e) =>
                    setTooltip({
                      x: e.clientX + 10,
                      y: e.clientY + 10,
                      text: nodeDatum.name,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: hasChildren ? 'pointer' : 'default' }}
                >
                  <circle
                    r={22}
                    fill="#2563EB"

                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasChildren) toggleNode?.();
                    }}
                  />
                  <text
                    fill="white"
                    x={0}
                    y={6}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {nodeDatum.numero}
                  </text>
                </g>
              );
            }}
          />
        )}

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: 'fixed',
              top: tooltip.y,
              left: tooltip.x,
              background: 'white',
              border: '1px solid #ccc',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              pointerEvents: 'none',
              zIndex: 50,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <strong>{tooltip.text}</strong>
          </div>
        )}
      </div>

      {/* ===== TABLEAU ===== */}
      <h2 className="text-2xl font-semibold mb-4">
        Tableau des niveaux
      </h2>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Personne</th>
            <th className="border px-2 py-1">Institution</th>
            <th className="border px-2 py-1">Lieu</th>
            <th className="border px-2 py-1">Supérieur</th>
            <th className="border px-2 py-1">Équivalent</th>
          </tr>
        </thead>
        <tbody>
          {personnes.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1 text-center font-bold">{p.id}</td>
              <td className="border px-2 py-1 font-semibold">{p.personne}</td>
              <td className="border px-2 py-1">{p.institution}</td>
              <td className="border px-2 py-1">{p.lieu}</td>
              <td className="border px-2 py-1">{p.superieur}</td>
              <td className="border px-2 py-1">{p.niveau_equivalent ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
