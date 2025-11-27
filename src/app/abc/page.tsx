// app/abc/page.tsx
'use client';

import { useEffect, useState } from 'react';

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
};

export default function AbcCinemaPage() {
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/abc')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(data.items);
      })
      .catch((err) => {
        console.error(err);
        setError('Impossible de récupérer le flux RSS');
      });
  }, []);

  if (error) return <div>Erreur : {error}</div>;
  if (!items) return <div>Chargement…</div>;

  return (
    <main>
      <h1>Programmation Cinéma ABC Toulouse</h1>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            <a href={it.link} target="_blank" rel="noopener noreferrer">
              {it.title}
            </a>
            <br/>
            <small>{new Date(it.pubDate).toLocaleString()}</small>
            <p dangerouslySetInnerHTML={{ __html: it.description }} />
          </li>
        ))}
      </ul>
    </main>
  );
}
