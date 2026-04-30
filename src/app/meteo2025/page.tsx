"use client";

import { useEffect, useState } from "react";

type Meteo = {
  date: string;
  tempMax: number;
  tempMin: number;
  pluie: number;
  vent: number;
};

export default function Meteo2025Page() {
  const [data, setData] = useState<Meteo[]>([]);

  useEffect(() => {
    fetch("/api/meteo2025")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Météo Toulouse 2025</h1>

      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp Max</th>
            <th>Temp Min</th>
            <th>Pluie</th>
            <th>Vent</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.tempMax}</td>
              <td>{d.tempMin}</td>
              <td>{d.pluie}</td>
              <td>{d.vent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
