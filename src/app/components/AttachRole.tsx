"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AttachRole({
  candidateId,
  roles,
}: {
  candidateId: string;
  roles: { id: string; title: string; client: { name: string } }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="row"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        const roleId = String(new FormData(event.currentTarget).get("roleId"));
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId, roleId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not attach");
          return;
        }
        router.refresh();
      }}
    >
      <select name="roleId" required>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.client.name} — {role.title}
          </option>
        ))}
      </select>
      <button className="btn" type="submit">
        Add to requisition
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
