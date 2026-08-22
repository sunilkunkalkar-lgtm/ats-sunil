"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ActivityForm({ candidateId, applicationId }: { candidateId: string; applicationId?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);

  return (
    <form
      className="stack"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setConflict(null);
        const form = event.currentTarget;
        const payload = {
          candidateId,
          applicationId,
          type: String(new FormData(form).get("type")),
          body: String(new FormData(form).get("body")),
        };
        const res = await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) {
          setConflict(
            `Blocked. Owner is ${data.owner?.name}. Latest log: ${data.latestActivity?.body ?? "none"}.`,
          );
          return;
        }
        if (!res.ok) {
          setError(data.error ?? "Could not log activity");
          return;
        }
        form.reset();
        router.refresh();
      }}
    >
      <div className="grid-2">
        <label>
          Type
          <select name="type" defaultValue="NOTE">
            <option value="NOTE">Note</option>
            <option value="CALL">Call</option>
            <option value="EMAIL">Email</option>
            <option value="OUTREACH">Outreach</option>
          </select>
        </label>
        <label>
          Log
          <input name="body" required placeholder="Spoke with candidate about start date" />
        </label>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {conflict ? <p className="error">{conflict}</p> : null}
      <button className="btn" type="submit">
        Log activity
      </button>
    </form>
  );
}
