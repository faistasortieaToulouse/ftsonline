'use client';
import React from 'react';
import ClientLink from './ClientLink';

interface CategorieItem {
  label: string;
  url?: string;
  separator?: boolean;
  [key: string]: any;
}

interface CategoriesGridProps {
  categories: CategorieItem[];
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      {categories.map((item, i) => (
        item.separator ? (
          <div key={i} style={{ gridColumn: '1 / -1' }}>
            <hr style={{ borderTop: '2px solid #6A057F', margin: '20px 0' }} />
          </div>
        ) : (
          item.url && <ClientLink key={i} href={item.url} label={item.label} />
        )
      ))}
    </div>
  );
}
