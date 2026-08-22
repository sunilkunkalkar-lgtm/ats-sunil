import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.role.deleteMany();
  await prisma.client.deleteMany();
  await prisma.recruiter.deleteMany();

  const [ananya, vikram, nora, diego] = await Promise.all([
    prisma.recruiter.create({ data: { name: "Ananya Rao", email: "ananya@suii.team" } }),
    prisma.recruiter.create({ data: { name: "Vikram Shah", email: "vikram@suii.team" } }),
    prisma.recruiter.create({ data: { name: "Nora Klein", email: "nora@suii.team" } }),
    prisma.recruiter.create({ data: { name: "Diego Alvarez", email: "diego@suii.team" } }),
  ]);

  const [apex, lumen, harbor] = await Promise.all([
    prisma.client.create({ data: { name: "Apex Retail" } }),
    prisma.client.create({ data: { name: "Lumen Bio" } }),
    prisma.client.create({ data: { name: "Harbor Bank" } }),
  ]);

  const react = await prisma.role.create({
    data: {
      title: "React Engineer",
      clientId: apex.id,
      priority: "NEW_PROJECT",
      slaDays: 14,
      openedAt: daysAgo(8),
      headcount: 2,
      ownerId: ananya.id,
    },
  });
  const analyst = await prisma.role.create({
    data: {
      title: "Data Analyst",
      clientId: lumen.id,
      priority: "BACKFILL",
      slaDays: 14,
      openedAt: daysAgo(12),
      headcount: 1,
      ownerId: vikram.id,
    },
  });
  const cloud = await prisma.role.create({
    data: {
      title: "Cloud Architect",
      clientId: harbor.id,
      priority: "NEW_PROJECT",
      slaDays: 14,
      openedAt: daysAgo(3),
      headcount: 1,
      ownerId: nora.id,
    },
  });
  const coord = await prisma.role.create({
    data: {
      title: "Staffing Coordinator",
      clientId: apex.id,
      priority: "BACKFILL",
      slaDays: 14,
      openedAt: daysAgo(16),
      headcount: 1,
      ownerId: diego.id,
    },
  });

  const people = [
    {
      firstName: "Kira",
      lastName: "Bose",
      email: "kira.bose@example.com",
      phone: "6285550201",
      ownerId: ananya.id,
      roleId: react.id,
      status: "INTERVIEWING" as const,
      days: 6,
    },
    {
      firstName: "Marcus",
      lastName: "Quinn",
      email: "marcus.quinn@example.com",
      phone: "6285550202",
      ownerId: ananya.id,
      roleId: react.id,
      status: "OFFERED" as const,
      days: 5,
    },
    {
      firstName: "Leila",
      lastName: "Haddad",
      email: "leila.haddad@example.com",
      phone: "6285550203",
      ownerId: vikram.id,
      roleId: react.id,
      status: "SOURCED" as const,
      days: 2,
    },
    {
      firstName: "Theo",
      lastName: "Nguyen",
      email: "theo.nguyen@example.com",
      phone: "6285550204",
      ownerId: nora.id,
      roleId: react.id,
      status: "CONTACTED" as const,
      days: 4,
    },
    {
      firstName: "Samira",
      lastName: "Ibrahim",
      email: "samira.ibrahim@example.com",
      phone: "6285550205",
      ownerId: ananya.id,
      roleId: react.id,
      status: "JOINED" as const,
      days: 13,
    },
    {
      firstName: "Owen",
      lastName: "Blake",
      email: "owen.blake@example.com",
      phone: "6285550206",
      ownerId: diego.id,
      roleId: react.id,
      status: "OFFER_DROPOFF" as const,
      days: 9,
      dropoffReason: "COUNTER_OFFER" as const,
      dropoffNotes: "Current employer matched RSUs.",
    },
    {
      firstName: "Priya",
      lastName: "Menon",
      email: "priya.menon@example.com",
      phone: "2125550207",
      ownerId: vikram.id,
      roleId: analyst.id,
      status: "ACCEPTED" as const,
      days: 6,
    },
    {
      firstName: "Jules",
      lastName: "Okada",
      email: "jules.okada@example.com",
      phone: "2125550208",
      ownerId: vikram.id,
      roleId: analyst.id,
      status: "OFFER_DROPOFF" as const,
      days: 8,
      dropoffReason: "SALARY_MISMATCH" as const,
      dropoffNotes: "Asked above Harbor/Lumen band.",
    },
    {
      firstName: "Elena",
      lastName: "Costa",
      email: "elena.costa@example.com",
      phone: "6465550209",
      ownerId: nora.id,
      roleId: cloud.id,
      status: "INTERVIEWING" as const,
      days: 2,
    },
    {
      firstName: "Jamal",
      lastName: "Wright",
      email: "jamal.wright@example.com",
      phone: "9175550210",
      ownerId: diego.id,
      roleId: coord.id,
      status: "OFFERED" as const,
      days: 15,
    },
    {
      firstName: "Noor",
      lastName: "Farah",
      email: "noor.farah@example.com",
      phone: "7185550211",
      ownerId: nora.id,
      roleId: cloud.id,
      status: "CONTACTED" as const,
      days: 1,
    },
    {
      firstName: "Ben",
      lastName: "Ivers",
      email: "ben.ivers@example.com",
      phone: "3475550212",
      ownerId: ananya.id,
      roleId: coord.id,
      status: "JOINED" as const,
      days: 18,
    },
  ];

  for (const person of people) {
    const candidate = await prisma.candidate.create({
      data: {
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email,
        phone: person.phone,
        ownerId: person.ownerId,
        createdAt: daysAgo(person.days + 2),
      },
    });

    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        roleId: person.roleId,
        status: person.status,
        dropoffReason: person.dropoffReason,
        dropoffNotes: person.dropoffNotes,
        recruiterId: person.ownerId,
        createdAt: daysAgo(person.days),
      },
    });

    await prisma.activityLog.create({
      data: {
        candidateId: candidate.id,
        applicationId: application.id,
        recruiterId: person.ownerId,
        type: "OUTREACH",
        body: `Suii intro sent for ${person.firstName} ${person.lastName}.`,
        createdAt: daysAgo(person.days),
      },
    });

    if (person.status !== "SOURCED") {
      await prisma.activityLog.create({
        data: {
          candidateId: candidate.id,
          applicationId: application.id,
          recruiterId: person.ownerId,
          type: "STATUS_CHANGE",
          body: `Moved to ${person.status.replaceAll("_", " ").toLowerCase()}.`,
          createdAt: daysAgo(Math.max(0, person.days - 1)),
        },
      });
    }
  }

  console.log("Seeded Suii ATS demo data (separate desk).");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
