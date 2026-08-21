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

  const [maya, ravi, lena, owen] = await Promise.all([
    prisma.recruiter.create({ data: { name: "Maya Chen", email: "maya@northline.staff" } }),
    prisma.recruiter.create({ data: { name: "Ravi Patel", email: "ravi@northline.staff" } }),
    prisma.recruiter.create({ data: { name: "Lena Okonkwo", email: "lena@northline.staff" } }),
    prisma.recruiter.create({ data: { name: "Owen Brooks", email: "owen@northline.staff" } }),
  ]);

  const [helix, meridian, cobalt] = await Promise.all([
    prisma.client.create({ data: { name: "Helix Payments" } }),
    prisma.client.create({ data: { name: "Meridian Health" } }),
    prisma.client.create({ data: { name: "Cobalt Logistics" } }),
  ]);

  const java = await prisma.role.create({
    data: {
      title: "Java Developer",
      clientId: helix.id,
      priority: "NEW_PROJECT",
      slaDays: 21,
      openedAt: daysAgo(12),
      headcount: 2,
      ownerId: maya.id,
    },
  });
  const ba = await prisma.role.create({
    data: {
      title: "Business Analyst",
      clientId: meridian.id,
      priority: "BACKFILL",
      slaDays: 21,
      openedAt: daysAgo(19),
      headcount: 1,
      ownerId: ravi.id,
    },
  });
  const devops = await prisma.role.create({
    data: {
      title: "DevOps Engineer",
      clientId: cobalt.id,
      priority: "NEW_PROJECT",
      slaDays: 21,
      openedAt: daysAgo(5),
      headcount: 1,
      ownerId: lena.id,
    },
  });
  const qa = await prisma.role.create({
    data: {
      title: "QA Lead",
      clientId: helix.id,
      priority: "BACKFILL",
      slaDays: 21,
      openedAt: daysAgo(24),
      headcount: 1,
      ownerId: owen.id,
      status: "OPEN",
    },
  });

  const people = [
    {
      firstName: "Priya",
      lastName: "Nair",
      email: "priya.nair@example.com",
      phone: "4155550101",
      ownerId: maya.id,
      roleId: java.id,
      status: "INTERVIEWING" as const,
      days: 8,
    },
    {
      firstName: "Jonah",
      lastName: "Feldman",
      email: "jonah.feldman@example.com",
      phone: "4155550102",
      ownerId: maya.id,
      roleId: java.id,
      status: "OFFERED" as const,
      days: 6,
    },
    {
      firstName: "Sofia",
      lastName: "Martinez",
      email: "sofia.martinez@example.com",
      phone: "4155550103",
      ownerId: ravi.id,
      roleId: java.id,
      status: "SOURCED" as const,
      days: 2,
    },
    {
      firstName: "Andre",
      lastName: "Williams",
      email: "andre.williams@example.com",
      phone: "4155550104",
      ownerId: lena.id,
      roleId: java.id,
      status: "CONTACTED" as const,
      days: 4,
    },
    {
      firstName: "Mei",
      lastName: "Huang",
      email: "mei.huang@example.com",
      phone: "4155550105",
      ownerId: maya.id,
      roleId: java.id,
      status: "JOINED" as const,
      days: 18,
    },
    {
      firstName: "Chris",
      lastName: "Adler",
      email: "chris.adler@example.com",
      phone: "4155550106",
      ownerId: owen.id,
      roleId: java.id,
      status: "OFFER_DROPOFF" as const,
      days: 10,
      dropoffReason: "COUNTER_OFFER" as const,
      dropoffNotes: "Incumbent matched base + 10%.",
    },
    {
      firstName: "Nina",
      lastName: "Volkov",
      email: "nina.volkov@example.com",
      phone: "2125550107",
      ownerId: ravi.id,
      roleId: ba.id,
      status: "ACCEPTED" as const,
      days: 7,
    },
    {
      firstName: "Tariq",
      lastName: "Hassan",
      email: "tariq.hassan@example.com",
      phone: "2125550108",
      ownerId: ravi.id,
      roleId: ba.id,
      status: "OFFER_DROPOFF" as const,
      days: 9,
      dropoffReason: "SALARY_MISMATCH" as const,
      dropoffNotes: "Asked 18% above band.",
    },
    {
      firstName: "Hannah",
      lastName: "Cole",
      email: "hannah.cole@example.com",
      phone: "6465550109",
      ownerId: lena.id,
      roleId: devops.id,
      status: "INTERVIEWING" as const,
      days: 3,
    },
    {
      firstName: "Diego",
      lastName: "Santos",
      email: "diego.santos@example.com",
      phone: "9175550110",
      ownerId: owen.id,
      roleId: qa.id,
      status: "OFFERED" as const,
      days: 20,
    },
    {
      firstName: "Aisha",
      lastName: "Rahman",
      email: "aisha.rahman@example.com",
      phone: "7185550111",
      ownerId: lena.id,
      roleId: devops.id,
      status: "CONTACTED" as const,
      days: 1,
    },
    {
      firstName: "Eli",
      lastName: "Park",
      email: "eli.park@example.com",
      phone: "3475550112",
      ownerId: maya.id,
      roleId: qa.id,
      status: "JOINED" as const,
      days: 22,
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
        body: `Intro email sent for ${person.firstName} ${person.lastName}.`,
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

  console.log("Seeded Northline ATS demo data.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
