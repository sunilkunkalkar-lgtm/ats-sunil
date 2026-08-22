"use client";

import { useRouter } from "next/navigation";

type Recruiter = { id: string; name: string };

export function RecruiterSwitcher({
  recruiters,
  currentId,
}: {
  recruiters: Recruiter[];
  currentId: string;
}) {
  const router = useRouter();

  return (
    <label className="switcher">
      <span>Acting as</span>
      <select
        defaultValue={currentId}
        onChange={async (event) => {
          await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recruiterId: event.target.value }),
          });
          router.refresh();
        }}
      >
        {recruiters.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}
