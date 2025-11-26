"use client";

import { useEffect, useState } from "react";

interface Event {
id: string;
title: string;
description: string;
url: string;
image: string;
start: string | null;
end: string | null;
location: string | null;
source: string;
}

export default function ICTEventsPage() {
const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetch("/api/ict-min")
.then(res => res.json())
.then(data => {
setEvents(data);
setLoading(false);
})
.catch(err => {
console.error(err);
setLoading(false);
});
}, []);

if (loading) return <p>Chargement...</p>;
if (!events.length) return <p>Aucun événement trouvé.</p>;

return ( <div> <h1>Événements ICT Toulouse</h1> <ul>
{events.map(event => ( <li key={event.id}> <a href={event.url} target="_blank" rel="noopener noreferrer"> <img src={event.image} alt={event.title} width={100} /> <h3>{event.title}</h3> <p>{event.description}</p> </a> </li>
))} </ul> </div>
);
}
