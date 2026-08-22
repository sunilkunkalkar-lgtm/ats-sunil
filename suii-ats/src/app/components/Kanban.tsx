"use client";

import { useState } from "react";
import { DROPOFF_REASONS, PIPELINE_COLUMNS } from "@/lib/pipeline";
import type { DropoffReason, PipelineStatus } from "@prisma/client";

type Card = {
  id: string;
  status: PipelineStatus;
  dropoffReason: DropoffReason | null;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    owner: { name: string };
  };
  role: { title: string; client: { name: string } };
};

export function Kanban({ applications }: { applications: Card[] }) {
  const [items, setItems] = useState(applications);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function move(id: string, status: PipelineStatus, extra?: { dropoffReason: DropoffReason; dropoffNotes?: string }) {
    setError(null);
    const res = await fetch(`/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update status");
      return false;
    }
    setItems((prev) => prev.map((app) => (app.id === id ? { ...app, status, dropoffReason: extra?.dropoffReason ?? null } : app)));
    return true;
  }

  return (
    <div>
      {error ? <p className="error">{error}</p> : null}
      <div className="kanban">
        {PIPELINE_COLUMNS.map((column) => (
          <section key={column.status} className="kanban-col">
            <header>
              <h2>{column.label}</h2>
              <span>{items.filter((a) => a.status === column.status).length}</span>
            </header>
            <div
              className="kanban-drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (!id) return;
                if (column.status === "OFFER_DROPOFF") {
                  setDropTarget(id);
                  return;
                }
                await move(id, column.status);
              }}
            >
              {items
                .filter((a) => a.status === column.status)
                .map((app) => (
                  <article
                    key={app.id}
                    className="card"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", app.id)}
                  >
                    <a href={`/candidates/${app.candidate.id}`}>
                      {app.candidate.firstName} {app.candidate.lastName}
                    </a>
                    <p>
                      {app.role.client.name} · {app.role.title}
                    </p>
                    <p className="muted">Owner {app.candidate.owner.name}</p>
                    {app.dropoffReason ? (
                      <p className="pill danger">{app.dropoffReason.replaceAll("_", " ")}</p>
                    ) : null}
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
      {dropTarget ? (
        <DropoffModal
          onCancel={() => setDropTarget(null)}
          onSave={async (reason, notes) => {
            const ok = await move(dropTarget, "OFFER_DROPOFF", { dropoffReason: reason, dropoffNotes: notes });
            if (ok) setDropTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

function DropoffModal({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (reason: DropoffReason, notes: string) => Promise<void>;
}) {
  const [reason, setReason] = useState<DropoffReason>("COUNTER_OFFER");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          await onSave(reason, notes);
          setPending(false);
        }}
      >
        <h3>Offer drop-off reason</h3>
        <p className="muted">Required so offer-to-join attrition is measurable, not anecdotal.</p>
        <label>
          Reason code
          <select value={reason} onChange={(e) => setReason(e.target.value as DropoffReason)}>
            {DROPOFF_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
        <div className="row">
          <button className="btn" disabled={pending} type="submit">
            Record drop-off
          </button>
          <button className="btn ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
