import { PrismaClient, PlanTier, ScanFrequency, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('Seeding plans...');

  const plans = [
    {
      tier: PlanTier.FREE,
      name: 'Free',
      priceMonthly: 0,
      auditsPerMonth: 3,
      monitoredSites: 1,
      keywordsPerSite: 3,
      historyDays: 7,
      maxScanFreq: ScanFrequency.MONTHLY,
      emailAlerts: false,
      pdfExport: false,
      whiteLabel: false,
      dualMalware: false,
      multiPageCrawl: false,
      rankingTracker: false,
      shareableReport: false,
      aiSuggestions: false,
      stripePriceId: null,
    },
    {
      tier: PlanTier.STARTER,
      name: 'Starter',
      priceMonthly: 1900,
      auditsPerMonth: 25,
      monitoredSites: 3,
      keywordsPerSite: 10,
      historyDays: 30,
      maxScanFreq: ScanFrequency.WEEKLY,
      emailAlerts: true,
      pdfExport: false,
      whiteLabel: false,
      dualMalware: false,
      multiPageCrawl: false,
      rankingTracker: false,
      shareableReport: true,
      aiSuggestions: false,
      stripePriceId: process.env.STRIPE_PRICE_STARTER ?? null,
    },
    {
      tier: PlanTier.PRO,
      name: 'Pro',
      priceMonthly: 4900,
      auditsPerMonth: 100,
      monitoredSites: 10,
      keywordsPerSite: 25,
      historyDays: 90,
      maxScanFreq: ScanFrequency.WEEKLY,
      emailAlerts: true,
      pdfExport: false,
      whiteLabel: false,
      dualMalware: true,
      multiPageCrawl: false,
      rankingTracker: true,
      shareableReport: true,
      aiSuggestions: true,
      stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
    },
    {
      tier: PlanTier.AGENCY,
      name: 'Agency',
      priceMonthly: 9900,
      auditsPerMonth: -1,
      monitoredSites: -1,
      keywordsPerSite: 50,
      historyDays: 365,
      maxScanFreq: ScanFrequency.DAILY,
      emailAlerts: true,
      pdfExport: true,
      whiteLabel: true,
      dualMalware: true,
      multiPageCrawl: true,
      rankingTracker: true,
      shareableReport: true,
      aiSuggestions: true,
      stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? null,
    },
  ];

  for (const plan of plans) {
    await db.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  console.log('Plans seeded.');

  // Seed super admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set — skipping admin user');
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hash,
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  const freePlan = await db.plan.findUnique({ where: { tier: PlanTier.FREE } });
  if (freePlan) {
    await db.subscription.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
        planId: freePlan.id,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`Super admin seeded: ${adminEmail}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
