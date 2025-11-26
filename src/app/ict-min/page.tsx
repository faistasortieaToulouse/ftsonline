import { useEffect, useState } from "react";

interface Event {
id: string;
title: string;
description: string;
date: string;
image: string | null;
url: string;
source: string;
}

export default function IctPage() {
const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetch("/api/ict-min")
.then((res) => res.json())
.then((data) => setEvents(data))
.finally(() => setLoading(false));
}, []);

if (loading) return <p>Chargement des événements…</p>;

return (
<div style={{ padding: "2rem" }}> <h1>Événements ICT - Hieronyma</h1>
{events.length === 0 && <p>Aucun événement trouvé.</p>}
<ul style={{ listStyle: "none", padding: 0 }}>
{events.map((event) => (
<li key={event.id} style={{ marginBottom: "2rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}> <h2>{event.title}</h2>
{event.image && <img src={event.image} alt={event.title} style={{ maxWidth: "150px", marginRight: "1rem", float: "left" }} />}
<p dangerouslySetInnerHTML={{ __html: event.description }}></p> <p><strong>Date :</strong> {new Date(event.date).toLocaleDateString()}</p> <p><a href={event.url} target="_blank" rel="noopener noreferrer">Voir l'événement</a></p>
<div style={{ clear: "both" }}></div> </li>
))} </ul> </div>
);
}
