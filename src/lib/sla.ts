export const SLA_DAYS = 21;

export function slaDeadline(openedAt: Date, slaDays = SLA_DAYS): Date {
  const deadline = new Date(openedAt);
  deadline.setUTCDate(deadline.getUTCDate() + slaDays);
  deadline.setUTCHours(23, 59, 59, 999);
  return deadline;
}

export function daysRemaining(openedAt: Date, slaDays = SLA_DAYS, now = new Date()): number {
  const ms = slaDeadline(openedAt, slaDays).getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export type SlaTone = "ok" | "warn" | "breach";

export function slaTone(daysLeft: number): SlaTone {
  if (daysLeft < 0) return "breach";
  if (daysLeft <= 5) return "warn";
  return "ok";
}

export function slaLabel(daysLeft: number): string {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return "due today";
  return `${daysLeft}d left`;
}
