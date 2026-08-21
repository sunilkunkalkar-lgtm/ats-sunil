import { PipelineStatus } from "@prisma/client";

export const PIPELINE_COLUMNS: { status: PipelineStatus; label: string }[] = [
  { status: "SOURCED", label: "Sourced" },
  { status: "CONTACTED", label: "Contacted" },
  { status: "INTERVIEWING", label: "Interviewing" },
  { status: "OFFERED", label: "Offered" },
  { status: "ACCEPTED", label: "Accepted" },
  { status: "JOINED", label: "Joined" },
  { status: "OFFER_DROPOFF", label: "Offer drop-off" },
];

export const DROPOFF_REASONS = [
  { value: "COUNTER_OFFER", label: "Counter-offer" },
  { value: "GHOSTED", label: "Ghosted" },
  { value: "SALARY_MISMATCH", label: "Salary mismatch" },
  { value: "ACCEPTED_ELSEWHERE", label: "Accepted elsewhere" },
  { value: "PERSONAL", label: "Personal / timing" },
  { value: "OTHER", label: "Other" },
] as const;

export function statusLabel(status: PipelineStatus): string {
  return PIPELINE_COLUMNS.find((c) => c.status === status)?.label ?? status;
}

export type FunnelStats = {
  offered: number;
  joined: number;
  dropoff: number;
  acceptedPending: number;
  offerToJoinRate: number | null;
  offerDropoffRate: number | null;
};

export function computeOfferJoinFunnel(counts: {
  offered: number;
  accepted: number;
  joined: number;
  dropoff: number;
}): FunnelStats {
  const offeredTerminal = counts.offered + counts.accepted + counts.joined + counts.dropoff;
  const joined = counts.joined;
  const dropoff = counts.dropoff;
  return {
    offered: offeredTerminal,
    joined,
    dropoff,
    acceptedPending: counts.accepted,
    offerToJoinRate: offeredTerminal === 0 ? null : joined / offeredTerminal,
    offerDropoffRate: offeredTerminal === 0 ? null : dropoff / offeredTerminal,
  };
}

export function pct(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 1000) / 10}%`;
}
