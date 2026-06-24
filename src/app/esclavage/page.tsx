async function getData() {
  const res = await fetch("http://localhost:3000/api/esclavage", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des données");
  }

  return res.json();
}

export default async function EsclavagePage() {
  const data = await getData();

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>{data.theme}</h1>

      <section>
        <h2>Résumé</h2>
        <p>{data.message_general.resume}</p>

        <ul>
          {data.message_general.points_cles.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Civilisations concernées</h2>
        {data.civilisations_pratiquant_esclavage.map(
          (c: any, i: number) => (
            <div key={i} style={{ marginBottom: "1rem" }}>
              <h3>{c.civilisation}</h3>
              <ul>
                {c.caracteristiques.map((car: string, j: number) => (
                  <li key={j}>{car}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </section>

      <section>
        <h2>Formes d'esclavage</h2>
        <ul>
          {data.formes_esclavage.map((f: string, i: number) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Traite atlantique</h2>
        <p><strong>Période :</strong> {data.traite_atlantique.periode}</p>

        <h3>Acteurs</h3>
        <p>Fournisseurs : {data.traite_atlantique.principaux_acteurs.fournisseurs.join(", ")}</p>
        <p>Transport : {data.traite_atlantique.principaux_acteurs.organisateurs_transport.join(", ")}</p>
        <p>Acheteurs : {data.traite_atlantique.principaux_acteurs.acheteurs_finaux.join(", ")}</p>

        <h3>Produits liés à la demande</h3>
        <ul>
          {data.traite_atlantique.demande.map((d: string, i: number) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Royaumes africains impliqués</h2>
        {data.royaumes_africains_impliques_dans_traite_atlantique.map(
          (r: any, i: number) => (
            <div key={i} style={{ marginBottom: "1rem" }}>
              <h3>{r.nom} ({r.actuel})</h3>
              <ul>
                {r.role.map((role: string, j: number) => (
                  <li key={j}>{role}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </section>

      <section>
        <h2>Nuances historiques</h2>
        <ul>
          {data.nuances_historiques.map((n: string, i: number) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Synthèse</h2>
        <p>{data.formulation_synthetique.texte}</p>
      </section>
    </main>
  );
}
