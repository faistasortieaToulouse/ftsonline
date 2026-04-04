import React from 'react';

async function getDevLinks() {
  // Sur un Server Component, on peut appeler l'API via son URL absolue 
  // ou lire directement process.env. Ici on simule l'appel API.
  const discord = process.env.API_DEV_TOLOSA;
  const whatsapp = process.env.API_WA_DEV;
  
  return [
    { name: 'Discord', url: discord, color: '#5865F2' },
    { name: 'WhatsApp', url: whatsapp, color: '#25D366' }
  ];
}

export default async function DevPage() {
  const links = await getDevLinks();

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>
        🛠 Espace Développeurs
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Accès restreint aux membres de l'équipe Tolosa.
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>
        {links.map((link) => (
          <div key={link.name} style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong style={{ fontSize: '1.2rem' }}>{link.name}</strong>
              <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#888' }}>
                Lien d'invitation officiel
              </p>
            </div>
            {link.url ? (
              <a href={link.url} target="_blank" rel="noopener noreferrer" style={{
                backgroundColor: link.color,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Rejoindre
              </a>
            ) : (
              <span style={{ color: 'red', fontSize: '0.8rem' }}>Lien non configuré</span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
