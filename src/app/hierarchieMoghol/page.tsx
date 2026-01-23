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
  attributes?: { section?: string; description?: string };
}

export default function HierarchieMogholPage() {
  const [data, setData] = useState<Personne[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeDatum[]>([]);
  const treeContainer = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 50 });

  // --- Charger les données ---
  useEffect(() => {
    fetch('/api/hierarchieMoghol')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // --- Construire arbre linéaire ---
  useEffect(() => {
    if (data.length === 0) return;

    let root: TreeNodeDatum | null = null;
    let current: TreeNodeDatum | null = null;

    data.forEach(p => {
      const node: TreeNodeDatum = {
        name: p.titre,
        attributes: { section: p.section, description: p.description },
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

    if (root) setTreeData([root]);
  }, [data]);

  // --- Centrage ---
  useEffect(() => {
    if (treeContainer.current) {
      setTranslate({ x: treeContainer.current.offsetWidth / 2, y: 50 });
    }
  }, [treeContainer.current, treeData]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-extrabold mb-6 text-center">🏯 Hiérarchie de l'Empire Moghol (Ourdou)</h1>

      <div ref={treeContainer} style={{ width: '100%', height: '400px', border: '1px solid #ccc', borderRadius: '8px' }} className="mb-8 relative bg-gray-50">
        {treeData.length > 0 && (
          <Tree
            data={treeData}
            translate={translate}
            orientation="vertical"
            nodeSize={{ x: 200, y: 100 }}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            zoomable
            collapsible={false}
            renderCustomNodeElement={({ nodeDatum }) => (
              <g>
                <circle r={20} fill="#2563EB" />
                <text fill="white" x={0} y={5} textAnchor="middle" fontSize="12" fontWeight="bold">
                  {nodeDatum.name}
                </text>
                {nodeDatum.attributes?.section && (
                  <text fill="#000" x={0} y={25} textAnchor="middle" fontSize="10">{nodeDatum.attributes.section}</text>
                )}
              </g>
            )}
          />
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Tableau des niveaux</h2>
      <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Titre</th>
            <th className="border px-2 py-1">Section</th>
            <th className="border px-2 py-1">Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1 text-center">{p.id}</td>
              <td className="border px-2 py-1">{p.titre}</td>
              <td className="border px-2 py-1">{p.section}</td>
              <td className="border px-2 py-1">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
