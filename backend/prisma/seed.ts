import { PrismaClient, Role, LeadStatus, Priority, LeadSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.activityLog.deleteMany({});
  await prisma.leadNote.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const salesPassword = await bcrypt.hash('SalesPassword123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'admin@leadflow.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const adminGmail = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'sales@leadflow.com',
      password: salesPassword,
      role: Role.SALES_MEMBER,
    },
  });

  console.log('Users created:', { admin: admin.email, sales: sales.email });

  // Sample leads data
  const sampleLeads = [
    {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '+1-555-0199',
      company: 'Acme Corporation',
      website: 'https://acme.com',
      source: LeadSource.LINKEDIN,
      industry: 'Manufacturing',
      priority: Priority.HIGH,
      status: LeadStatus.QUALIFIED,
      score: 75,
      assignedToId: sales.id,
      createdById: admin.id,
    },
    {
      name: 'Cyberdyne Systems',
      email: 'info@cyberdyne.io',
      phone: '+1-555-0182',
      company: 'Cyberdyne Systems LLC',
      website: 'https://cyberdyne.io',
      source: LeadSource.WEBSITE,
      industry: 'Robotics',
      priority: Priority.URGENT,
      status: LeadStatus.NEW,
      score: 90,
      assignedToId: admin.id,
      createdById: admin.id,
    },
    {
      name: 'Stark Industries',
      email: 'tony@stark.com',
      phone: '+1-555-0143',
      company: 'Stark Industries',
      website: 'https://stark.com',
      source: LeadSource.REFERRAL,
      industry: 'Defense',
      priority: Priority.MEDIUM,
      status: LeadStatus.CONTACTED,
      score: 60,
      assignedToId: sales.id,
      createdById: sales.id,
    },
    {
      name: 'Wayne Enterprises',
      email: 'bruce@wayne.co',
      phone: '+1-555-0100',
      company: 'Wayne Enterprises',
      website: 'https://wayne.co',
      source: LeadSource.COLD_EMAIL,
      industry: 'Technology',
      priority: Priority.LOW,
      status: LeadStatus.NEGOTIATION,
      score: 40,
      assignedToId: sales.id,
      createdById: sales.id,
    },
    {
      name: 'Initech',
      email: 'peter@initech.com',
      phone: '+1-555-0122',
      company: 'Initech Software',
      website: 'https://initech.com',
      source: LeadSource.GOOGLE_ADS,
      industry: 'Software Development',
      priority: Priority.MEDIUM,
      status: LeadStatus.PROPOSAL_SENT,
      score: 55,
      assignedToId: sales.id,
      createdById: sales.id,
    },
  ];

  for (const leadData of sampleLeads) {
    const lead = await prisma.lead.create({ data: leadData });

    // Add activity logs
    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        userId: leadData.createdById,
        action: 'LEAD_CREATED',
        metadata: {
          name: lead.name,
          status: lead.status,
          priority: lead.priority,
        },
      },
    });

    if (leadData.assignedToId) {
      await prisma.activityLog.create({
        data: {
          leadId: lead.id,
          userId: leadData.createdById,
          action: 'ASSIGNED',
          metadata: {
            assignedToId: leadData.assignedToId,
          },
        },
      });
    }

    // Add sample notes for some leads
    if (lead.name === 'Acme Corp') {
      const note = await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          authorId: admin.id,
          note: 'Highly interested in our enterprise tier. Requested a call next Tuesday.',
        },
      });

      await prisma.activityLog.create({
        data: {
          leadId: lead.id,
          userId: admin.id,
          action: 'NOTE_ADDED',
          metadata: {
            noteId: note.id,
          },
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
