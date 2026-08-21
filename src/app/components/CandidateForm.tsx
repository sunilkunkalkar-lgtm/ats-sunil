"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ConflictPayload = {
  blocked: true;
  reason?: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  owner: { id: string; name: string; email: string };
  latestActivity: {
    type: string;
    body: string;
    createdAt: string | Date;
    recruiterName: string;
  } | null;
};

export function ConflictCard({ conflict }: { conflict: ConflictPayload }) {
  const when = conflict.latestActivity
    ? new Date(conflict.latestActivity.createdAt).toLocaleString()
    : null;

  return (
    <aside className="conflict" role="alert">
      <p className="kicker">Duplicate blocked</p>
      <h3>
        {conflict.candidate.firstName} {conflict.candidate.lastName} is already in the ATS
      </h3>
      <dl>
        <div>
          <dt>Owner</dt>
          <dd>
            {conflict.owner.name}
            <span className="muted"> · {conflict.owner.email}</span>
          </dd>
        </div>
        <div>
          <dt>Matched on</dt>
          <dd>{(conflict.reason ?? "identity").replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt>Latest communication</dt>
          <dd>
            {conflict.latestActivity ? (
              <>
                <strong>{conflict.latestActivity.type}</strong> · {when}
                <p>{conflict.latestActivity.body}</p>
              </>
            ) : (
              "No activity logged yet."
            )}
          </dd>
        </div>
      </dl>
      <a href={`/candidates/${conflict.candidate.id}`}>Open existing record</a>
    </aside>
  );
}

export function CandidateForm({
  defaultRoleId,
}: {
  defaultRoleId?: string;
}) {
  const router = useRouter();
  const [conflict, setConflict] = useState<ConflictPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="stack"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setConflict(null);
        const form = new FormData(event.currentTarget);
        const payload = {
          firstName: String(form.get("firstName") ?? ""),
          lastName: String(form.get("lastName") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
        };
        const res = await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) {
          setConflict(data);
          setPending(false);
          return;
        }
        if (!res.ok) {
          setError(data.error ?? "Could not create candidate");
          setPending(false);
          return;
        }

        if (defaultRoleId) {
          await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ candidateId: data.candidate.id, roleId: defaultRoleId }),
          });
        }

        setPending(false);
        router.push(`/candidates/${data.candidate.id}`);
        router.refresh();
      }}
    >
      <div className="grid-2">
        <label>
          First name
          <input name="firstName" required />
        </label>
        <label>
          Last name
          <input name="lastName" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required placeholder="name@company.com" />
        </label>
        <label>
          Phone
          <input name="phone" required placeholder="+1 415 555 0100" />
        </label>
      </div>
      <p className="muted">
        Email and phone are unique. A matching record blocks create/contact and shows the current
        owner plus the latest log.
      </p>
      {error ? <p className="error">{error}</p> : null}
      {conflict ? <ConflictCard conflict={conflict} /> : null}
      <button className="btn" disabled={pending} type="submit">
        {pending ? "Checking…" : "Create candidate"}
      </button>
    </form>
  );
}
