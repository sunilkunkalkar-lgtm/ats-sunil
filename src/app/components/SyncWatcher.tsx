"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function SyncWatcher() {
  const router = useRouter();
  const versionRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/sync", { cache: "no-store" });
        const data = (await res.json()) as { version: number };
        if (cancelled) return;
        if (versionRef.current === null) {
          versionRef.current = data.version;
          return;
        }
        if (data.version !== versionRef.current) {
          versionRef.current = data.version;
          router.refresh();
        }
      } catch {
        /* ignore transient errors */
      }
    }

    tick();
    const id = window.setInterval(tick, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [router]);

  return null;
}
