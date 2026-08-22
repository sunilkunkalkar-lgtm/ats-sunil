"use client";

import { useState } from "react";
import type { RolePriority } from "@prisma/client";

export function RoleForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="stack panel"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const res = await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            clientName: form.get("clientName"),
            priority: form.get("priority"),
            headcount: Number(form.get("headcount") || 1),
          }),
        });
        const data = await res.json();
        setPending(false);
        if (!res.ok) {
          setError(data.error ?? "Could not create requisition");
          return;
        }
        window.location.href = `/roles/${data.role.id}`;
      }}
    >
      <h2>Open a requisition</h2>
      <div className="grid-2">
        <label>
          Role title
          <input name="title" required placeholder="React Engineer" />
        </label>
        <label>
          Client
          <input name="clientName" required placeholder="Apex Retail" />
        </label>
        <label>
          Priority
          <select name="priority" defaultValue={"NEW_PROJECT" satisfies RolePriority}>
            <option value="NEW_PROJECT">New project</option>
            <option value="BACKFILL">Backfill</option>
          </select>
        </label>
        <label>
          Headcount
          <input name="headcount" type="number" min={1} defaultValue={1} />
        </label>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" disabled={pending} type="submit">
        {pending ? "Saving…" : "Create requisition"}
      </button>
    </form>
  );
}
