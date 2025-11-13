"use client";

import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import fr from "date-fns/locale/fr";
import { useMemo } from "react";
import type { Event } from "@/lib/types";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type Props = {
  events: Event[];
};

export default function CalendarView({ events }: Props) {
  const formattedEvents = useMemo(
    () =>
      events.map((event) => ({
        title: event.name,
        start: new Date(event.date),
        end: new Date(event.date), // tu peux ajuster si tu as une durée
        allDay: false,
        resource: event,
      })),
    [events]
  );

  return (
    <div className="h-[70vh] rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        startAccessor="start"
        endAccessor="end"
        popup
        style={{ height: "100%", width: "100%" }}
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd’hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          showMore: (count) => `+ ${count} de plus`,
        }}
	onSelectEvent={(e) => alert(`${e.title}\n${e.resource.description}`)}
      />
    </div>
  );
}
