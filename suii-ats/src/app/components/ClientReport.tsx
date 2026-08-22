"use client";

import { useMemo, useState } from "react";

type Row = {
  client: string;
  role: string;
  priority: string;
  summary: string;
  SOURCED: number;
  CONTACTED: number;
  INTERVIEWING: number;
  OFFERED: number;
  ACCEPTED: number;
  JOINED: number;
  OFFER_DROPOFF: number;
};

export function ClientReport({
  rows,
  clients,
}: {
  rows: Row[];
  clients: { id: string; name: string }[];
}) {
  const [client, setClient] = useState("all");
  const filtered = useMemo(
    () => (client === "all" ? rows : rows.filter((r) => r.client === client)),
    [client, rows],
  );
  const selected = clients.find((c) => c.name === client);

  return (
    <section className="panel">
      <div className="toolbar">
        <label>
          Client
          <select value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="all">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <a
          className="btn"
          href={
            selected
              ? `/api/reports/client?clientId=${selected.id}&format=csv`
              : "/api/reports/client?format=csv"
          }
        >
          Export CSV
        </a>
      </div>
      <div className="live-cards">
        {filtered.map((row) => (
          <article key={`${row.client}-${row.role}`} className="live-card">
            <p className="kicker">{row.client}</p>
            <h3>{row.role}</h3>
            <p className="lede">
              {row.role}: {row.summary || "no candidates yet"}
            </p>
            <ul>
              <li>{row.SOURCED} sourced</li>
              <li>{row.INTERVIEWING} interviewing</li>
              <li>{row.OFFERED} offer</li>
              <li>{row.JOINED} joined</li>
              <li>{row.OFFER_DROPOFF} drop-off</li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
