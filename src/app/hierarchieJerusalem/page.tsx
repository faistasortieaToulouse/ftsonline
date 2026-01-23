'use client';

import { useEffect, useState, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Personne {
  personne: string;
  institution: string;
  superieur: string | null;
  niveau_equivalent?: string | null;
}

interface TreeNodeDatum extends RawNodeDatum {
  children?: TreeNodeDatum[];
  attributes?: { institution?: string };
}

// --- Ordres pour les arbres ---
const ordreDignitaires = [
  'Grand Maître','Baillis conventuels','Trésorier','Grand commandeur ou Grand précepteur',
  'Grand hospitalier à la langue de France','Grand maréchal','Grand drapier','Grand hospitalier',
  'Grand amiral','Turcoplier'
];

const ordreFonctions = [
  'Frère prieur conventuel','Frère pilier','Frère commandeur','Frère bailli capitulaire','Frère prieur provincial',
  'Les charges dans l\'Ordre','Officiers','Conseillers','Prud\'hommes','Commissaires','Les grands dignitaires',
  'Grand Maître','Frère bailli conventuel','Les grands offices','Organisation de l\'Ordre','Les organes du pouvoir',
  'Les frères chevaliers','Les sergents d\'armes','Les sergents d\'office','Frères prêtres / Chapelains conventuels'
];

const ordreFonctionsTable = [
  'Frère prieur conventuel','Frère pilier','Frère commandeur','Frère bailli capitulaire','Frère prieur provincial',
  'Les charges dans l\'Ordre','Officiers','Conseillers','Prud\'hommes','Commissaires','Les grands dignitaires',
  'Grand Maître','Frère bailli conventuel','Les grands offices','Organisation de l\'Ordre','Les organes du pouvoir',
  'les frères chevalier','les sergents d\'armes','les sergents d\'office','les frères prêtres ou chapelain'
];

// Mapping JSON -> affichage exact pour le tableau 2
const mappingFonctions: Record<string,string> = {
  'Frères prêtres / Chapelains conventuels': 'les frères prêtres ou chapelain',
  'Frères chevaliers': 'les frères chevalier',
  'Sergents d\'armes': 'les sergents d\'armes',
  'Sergents d\'office': 'les sergents d\'office'
};

const ordreClasses = [
  'Frères prêtres / Chapelains conventuels','Frères prêtres d\'obédience','Frères chevaliers profès','Frères chevaliers de grâce',
  'Servants hospitaliers','Sergents d\'armes','Confrères donats (Grand\'croix, Demi-croix, Médaillers)',
  'Nos seigneurs les malades','La familia','Les dépendants'
];

const ordreClassesTable = [
  // Les frères clercs
  'les frères prêtres','les frères chapelains conventuels','les frères prêtres d\'obédience','les frères chevaliers',
  'Les frères chevaliers profès','les frères chevaliers de grâce',

  // Les laïcs
  'les servants','les servants hospitaliers','les sergents d\'armes','les confrères donats',

  // Ces donats
  'les grand\'croix','les demi-croix','les médaillers de dévotion',

  // Autour de l’Ordre
  '« nos seigneurs les malades »','la familia','les dépendants'
];

// Mapping JSON -> affichage exact pour le tableau 3
const mappingClasses: Record<string,string> = {
  'Frères prêtres': 'les frères prêtres',
  'Frères chapelains conventuels': 'les frères chapelains conventuels',
  'Frères prêtres d\'obédience': 'les frères prêtres d\'obédience',
  'Frères chevaliers profès': 'Les frères chevaliers profès',
  'Frères chevaliers de grâce': 'les frères chevaliers de grâce',
  'Servants': 'les servants',
  'Servants hospitaliers': 'les servants hospitaliers',
  'Sergents d\'armes': 'les sergents d\'armes',
  'Confrères donats (Grand\'croix, Demi-croix, Médaillers)': 'les confrères donats',
  'Nos seigneurs les malades': '« nos seigneurs les malades »',
  'La familia': 'la familia',
  'Les dépendants': 'les dépendants'
};

export default function HierarchieJerusalemPage() {
  const [data, setData] = useState<{
    hierarchie_dignitaires: Personne[];
    fonctions_et_organisation: Personne[];
    classes_et_statuts: Personne[];
  } | null>(null);

  const [trees, setTrees] = useState<TreeNodeDatum[][]>([[], [], []]);
  const [translates, setTranslates] = useState([{ x: 0, y: 50 }, { x: 0, y: 50 }, { x: 0, y: 50 }]);

  const treeNodeSize = { x: 180, y: 100 };
  const containerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // --- Charger JSON ---
  useEffect(() => {
    fetch('/api/hierarchieJerusalem')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // --- Construire arbres ---
  useEffect(() => {
    if (!data) return;

    const buildLinearTree = (liste: Personne[], ordre: string[]): TreeNodeDatum[] => {
      const map = new Map<string, Personne>();
      liste.forEach(p => map.set(p.personne, p));

      let root: TreeNodeDatum | null = null;
      let current: TreeNodeDatum | null = null;

      ordre.forEach(name => {
        if (!map.has(name)) return;
        const p = map.get(name)!;
        const node: TreeNodeDatum = {
          name: p.personne,
          attributes: { institution: p.institution },
          children: [],
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
      buildLinearTree(data.hierarchie_dignitaires, ordreDignitaires),
      buildLinearTree(data.fonctions_et_organisation, ordreFonctions),
      buildLinearTree(data.classes_et_statuts, ordreClasses),
    ]);
  }, [data]);

  // --- Centrer chaque arbre ---
  useEffect(() => {
    const newTranslates = containerRefs.map(ref => {
      if (ref.current) return { x: ref.current.offsetWidth / 2, y: 50 };
      return { x: 300, y: 50 };
    });
    setTranslates(newTranslates);
  }, [trees]);

  // --- Fonction pour générer tableau avec mapping ---
  const renderTable = (i: number) => {
    let ordreTable: string[] = [];
    let mapping: Record<string,string> = {};
    let list: Personne[] = [];

    if (i === 0) { ordreTable = ordreDignitaires; list = data!.hierarchie_dignitaires; }
    if (i === 1) { ordreTable = ordreFonctionsTable; list = data!.fonctions_et_organisation; mapping = mappingFonctions; }
    if (i === 2) { ordreTable = ordreClassesTable; list = data!.classes_et_statuts; mapping = mappingClasses; }

    return (
      <tbody>
        {ordreTable.map((name, idx) => {
          let p = list.find(p => p.personne === name);
          if (!p) {
            // Vérifier mapping
            const key = Object.keys(mapping).find(k => mapping[k] === name);
            if (key) p = list.find(p => p.personne === key);
          }
          return (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-2 py-1 text-center">{idx + 1}</td>
              <td className="border px-2 py-1">{name}</td>
              <td className="border px-2 py-1">{p?.institution || '-'}</td>
              <td className="border px-2 py-1">{p?.superieur || '-'}</td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-extrabold mb-6 text-center">✡️ Hiérarchie de Jérusalem</h1>

      {data && (
        <div className="grid grid-cols-3 gap-8">
          {['Dignitaires', 'Fonctions & Organisation', 'Classes & Statuts'].map((title, i) => (
            <div key={title} className="bg-white p-4 rounded shadow flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>

              <div ref={containerRefs[i]} style={{ width: '100%', height: '500px' }}>
                {trees[i] && trees[i].length > 0 && (
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
                      </g>
                    )}
                  />
                )}
              </div>

              {/* Tableau sous l'arbre */}
              <table className="w-full table-auto border-collapse border border-gray-300 mt-4 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">Nom</th>
                    <th className="border px-2 py-1">Institution</th>
                    <th className="border px-2 py-1">Supérieur</th>
                  </tr>
                </thead>
                {renderTable(i)}
              </table>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
