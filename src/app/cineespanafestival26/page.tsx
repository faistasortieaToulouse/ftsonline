async function getLink() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/cineespanafestival26`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function CineEspanaPage() {
  const { url } = await getLink();

  return (
    <main className="mx-auto max-w-xl py-10 px-6 text-center">
      <h1 className="text-3xl font-bold mb-6">
        Groupe WhatsApp CinéEspaña
      </h1>

      <p className="mb-6">
        Rejoignez le groupe WhatsApp de CinéEspaña.
      </p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
      >
        Rejoindre le groupe
      </a>
    </main>
  );
}
