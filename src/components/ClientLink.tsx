// src/components/ClientLink.tsx

'use client';

import React from 'react';

// Définit l'interface des propriétés que le composant recevra.
interface ClientLinkProps {
  href: string;
  label: string;
}

export default function ClientLink({ href, label }: ClientLinkProps) {
  
  // Les fonctions onMouseOver et onMouseOut sont DÉFINIES et UTILISÉES
  // dans ce Composant Client, ce qui est autorisé.
  
  const handleMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        padding: "15px",
        border: "2px solid #6A057F",
        borderRadius: "10px",
        textAlign: "center",
        background: "#fdfdff",
        textDecoration: "none",
        color: "#333",
        fontWeight: "bold",
        fontSize: "1.1em",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseOver={handleMouseOver} // ✅ Maintenant OK, car dans un Client Component
      onMouseOut={handleMouseOut}   // ✅ Maintenant OK, car dans un Client Component
    >
      {label}
    </a>
  );
}