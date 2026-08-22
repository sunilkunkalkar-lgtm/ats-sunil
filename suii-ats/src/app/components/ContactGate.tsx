"use client";

import { useState } from "react";
import { ConflictCard, type ConflictPayload } from "./CandidateForm";

export function ContactGate() {
  const [conflict, setConflict] = useState<ConflictPayload | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  return (
    <form
      className="stack panel"
      onSubmit={async (event) => {
        event.preventDefault();
        setConflict(null);
        setOk(null);
        const form = new FormData(event.currentTarget);
        const res = await fetch("/api/candidates/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.get("email"),
            phone: form.get("phone"),
          }),
        });
        const data = await res.json();
        if (res.status === 409) {
          setConflict(data);
          return;
        }
        if (!res.ok) {
          setOk(data.error ?? "Check failed");
          return;
        }
        setOk("No duplicate. You can create this candidate.");
      }}
    >
      <h2>Pre-contact duplicate check</h2>
      <p className="muted">Run this before outreach so two recruiters never email the same person.</p>
      <div className="grid-2">
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Phone
          <input name="phone" required />
        </label>
      </div>
      <button className="btn" type="submit">
        Check identity
      </button>
      {ok ? <p>{ok}</p> : null}
      {conflict ? <ConflictCard conflict={conflict} /> : null}
    </form>
  );
}
