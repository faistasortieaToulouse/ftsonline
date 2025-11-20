"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Notification = {
  id: number;
  receivedAt: string;
  payload: any;
};

export default function HelloAssoAdminPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/helloasso/webhook");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Erreur chargement notifications", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Notifications HelloAsso</h1>
      <p className="text-muted-foreground mb-6">
        Liste des notifications reçues via le webhook HelloAsso.
      </p>

      <Button onClick={fetchNotifications} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "🔄 Rafraîchir"}
      </Button>

      {notifications.length > 0 ? (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className="border rounded p-4 bg-white shadow-sm"
            >
              <p className="text-sm text-muted-foreground mb-2">
                Reçue le {new Date(notif.receivedAt).toLocaleString("fr-FR")}
              </p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(notif.payload, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Aucune notification reçue pour l’instant.</p>
      )}
    </div>
  );
}
