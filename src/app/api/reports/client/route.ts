import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PIPELINE_COLUMNS, statusLabel } from "@/lib/pipeline";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const roleId = searchParams.get("roleId");
  const format = searchParams.get("format");

  const roles = await prisma.role.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(roleId ? { id: roleId } : {}),
    },
    include: {
      client: true,
      owner: true,
      applications: true,
    },
    orderBy: [{ client: { name: "asc" } }, { title: "asc" }],
  });

  const rows = roles.map((role) => {
    const counts = Object.fromEntries(PIPELINE_COLUMNS.map((c) => [c.status, 0])) as Record<
      string,
      number
    >;
    for (const app of role.applications) {
      counts[app.status] += 1;
    }
    return {
      client: role.client.name,
      role: role.title,
      priority: role.priority,
      slaDays: role.slaDays,
      openedAt: role.openedAt.toISOString(),
      ...Object.fromEntries(PIPELINE_COLUMNS.map((c) => [c.status, counts[c.status]])),
      summary: PIPELINE_COLUMNS.filter((c) => counts[c.status] > 0)
        .map((c) => `${counts[c.status]} ${statusLabel(c.status).toLowerCase()}`)
        .join(", "),
    };
  });

  if (format === "csv") {
    const headers = [
      "Client",
      "Role",
      "Priority",
      ...PIPELINE_COLUMNS.map((c) => statusLabel(c.status)),
      "Summary",
    ];
    const lines = [
      headers.join(","),
      ...rows.map((row) =>
        [
          csv(row.client),
          csv(row.role),
          csv(row.priority),
          ...PIPELINE_COLUMNS.map((c) => String(row[c.status] ?? 0)),
          csv(row.summary),
        ].join(","),
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="client-pipeline.csv"',
      },
    });
  }

  return NextResponse.json({ rows });
}

function csv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
