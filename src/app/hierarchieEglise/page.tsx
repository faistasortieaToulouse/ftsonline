'use client';

import { useEffect, useState, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Personne {
  id: number;
  personne: string;
  lieu: string;
  recteur: string | null;
  institution: string | null;
  ordre: string | null;
  superieur: string | null;
  niveau_equivalent: string | null;
}

interface TreeNodeDatum extends RawNodeDatum {
  numero: number;
  children?: TreeNodeDatum[];
}

export default function HierarchieEglisePage() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeDatum[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const treeContainer = useRef<HTMLDivElement | null>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // --- Charger les données ---
  useEffect(() => {
    fetch('/api/hierarchieEglise')
      .then((res) => res.json())
      .then((data: Personne[]) => {
        setPersonnes(data.map((p, i) => ({ ...p, id: i + 1 })));
      })
      .catch(console.error);
  }, []);

  // --- Construire l'arbre ---
  useEffect(() => {
    if (personnes.length === 0) return;

    const mapNodes = new Map<string, TreeNodeDatum>();

    // Crée tous les noeuds
    personnes.forEach((p) => {
      mapNodes.set(p.personne, { name: p.personne, numero: p.id, children: [] });
    });

    // Ajoute les enfants selon "superieur"
    const roots: TreeNodeDatum[] = [];
    personnes.forEach((p) => {
      const node = mapNodes.get(p.personne)!;
      if (p.superieur) {
        const parent = mapNodes.get(p.superieur);
        if (parent) parent.children!.push(node);
      } else {
        roots.push(node); // racine
      }
    });

    setTreeData(roots);
  }, [personnes]);

  // --- Centrage du conteneur ---
  useEffect(() => {
    if (treeContainer.current) {
      const { offsetWidth, offsetHeight } = treeContainer.current;
      setTranslate({ x: offsetWidth / 2, y: 50 });
    }
  }, [treeContainer.current]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-extrabold mb-6">
        ⛪ Hiérarchie de l'Église
      </h1>

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
                    r={20}
                    fill="#2563EB"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasChildren) toggleNode?.();
                    }}
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

      <h2 className="text-2xl font-semibold mb-4">Tableau des niveaux</h2>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1">#</th>
            <th className="border border-gray-300 px-2 py-1">Personne</th>
            <th className="border border-gray-300 px-2 py-1">Lieu</th>
            <th className="border border-gray-300 px-2 py-1">Recteur</th>
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
              <td className="border border-gray-300 px-2 py-1">{p.lieu}</td>
              <td className="border border-gray-300 px-2 py-1">{p.recteur || '-'}</td>
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
