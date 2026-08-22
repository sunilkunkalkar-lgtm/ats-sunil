import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { getCurrentRecruiter } from "@/lib/session";
import { RecruiterSwitcher } from "./components/RecruiterSwitcher";
import { SyncWatcher } from "./components/SyncWatcher";

export const metadata: Metadata = {
  title: "Suii ATS",
  description: "Single source of truth for recruiting operations"
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [recruiters, current] = await Promise.all([
    prisma.recruiter.findMany({ orderBy: { name: "asc" } }),
    getCurrentRecruiter(),
  ]);

  return (
    <html lang="en">
      <body>
        <SyncWatcher />
        <div className="app">
          <aside className="sidebar">
            <div className="brand">
              Suii
              <small>Applicant tracking</small>
            </div>
            <nav className="nav">
              <Link href="/">Dashboard</Link>
              <Link href="/pipeline">Pipeline</Link>
              <Link href="/roles">Requisitions</Link>
              <Link href="/candidates">Candidates</Link>
              <Link href="/reports">Reports</Link>
            </nav>
            {current ? <RecruiterSwitcher recruiters={recruiters} currentId={current.id} /> : null}
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
