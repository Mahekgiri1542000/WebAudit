-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PlatformHint" AS ENUM ('AUTO', 'WORDPRESS', 'GHL', 'REACT', 'NEXTJS', 'NODE', 'SHOPIFY', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'AGENCY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "ScanFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SEO_DROP', 'SEO_IMPROVE', 'GEO_CHANGE', 'AEO_CHANGE', 'RANKING_UP', 'RANKING_DOWN', 'SECURITY_ALERT', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'BOTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platformHint" "PlatformHint" NOT NULL DEFAULT 'AUTO',
    "status" "AuditStatus" NOT NULL DEFAULT 'PENDING',
    "overallScore" INTEGER,
    "onPageScore" INTEGER,
    "offPageScore" INTEGER,
    "geoScore" INTEGER,
    "aeoScore" INTEGER,
    "worldwideSeoScore" INTEGER,
    "pageSpeedScore" INTEGER,
    "securityScore" INTEGER,
    "confidenceScore" INTEGER,
    "report" JSONB,
    "suggestions" JSONB,
    "detectedCms" TEXT,
    "industryHint" TEXT,
    "errorMessage" TEXT,
    "aiSuggestionsStatus" TEXT DEFAULT 'pending',
    "verificationHash" TEXT,
    "certificateId" TEXT,
    "shareToken" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonthly" INTEGER NOT NULL,
    "auditsPerMonth" INTEGER NOT NULL,
    "monitoredSites" INTEGER NOT NULL,
    "keywordsPerSite" INTEGER NOT NULL,
    "historyDays" INTEGER NOT NULL,
    "maxScanFreq" "ScanFrequency" NOT NULL DEFAULT 'MONTHLY',
    "emailAlerts" BOOLEAN NOT NULL DEFAULT false,
    "pdfExport" BOOLEAN NOT NULL DEFAULT false,
    "whiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "dualMalware" BOOLEAN NOT NULL DEFAULT false,
    "multiPageCrawl" BOOLEAN NOT NULL DEFAULT false,
    "rankingTracker" BOOLEAN NOT NULL DEFAULT false,
    "shareableReport" BOOLEAN NOT NULL DEFAULT false,
    "aiSuggestions" BOOLEAN NOT NULL DEFAULT false,
    "stripePriceId" TEXT,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "auditsUsedThisPeriod" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoredSite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "platformHint" "PlatformHint" NOT NULL DEFAULT 'AUTO',
    "scanFrequency" "ScanFrequency" NOT NULL DEFAULT 'WEEKLY',
    "alertOnSeo" BOOLEAN NOT NULL DEFAULT true,
    "alertOnGeo" BOOLEAN NOT NULL DEFAULT true,
    "alertOnAeo" BOOLEAN NOT NULL DEFAULT true,
    "alertOnRanking" BOOLEAN NOT NULL DEFAULT true,
    "alertOnSecurity" BOOLEAN NOT NULL DEFAULT true,
    "alertThreshold" INTEGER NOT NULL DEFAULT 5,
    "lastAuditId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextScanAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoredSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "monitoredSiteId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'us',
    "language" TEXT NOT NULL DEFAULT 'en',
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "lastPosition" INTEGER,
    "previousPosition" INTEGER,
    "hasFeaturedSnippet" BOOLEAN NOT NULL DEFAULT false,
    "ownsFeaturedSnippet" BOOLEAN NOT NULL DEFAULT false,
    "inAIOverview" BOOLEAN NOT NULL DEFAULT false,
    "inLocalPack" BOOLEAN NOT NULL DEFAULT false,
    "serpFeatures" JSONB,
    "volatility" TEXT,
    "trend" TEXT,
    "avgPosition" DOUBLE PRECISION,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordSnapshot" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "position" INTEGER,
    "serpFeatures" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorDomain" (
    "id" TEXT NOT NULL,
    "monitoredSiteId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSnapshot" (
    "id" TEXT NOT NULL,
    "monitoredSiteId" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "onPageScore" INTEGER,
    "offPageScore" INTEGER,
    "geoScore" INTEGER,
    "aeoScore" INTEGER,
    "worldwideSeoScore" INTEGER,
    "overallScore" INTEGER,
    "pageSpeedMobile" INTEGER,
    "malwareStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monitoredSiteId" TEXT,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'BOTH',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "inAppAlerts" BOOLEAN NOT NULL DEFAULT true,
    "seoAlerts" BOOLEAN NOT NULL DEFAULT true,
    "rankingAlerts" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "geoAlerts" BOOLEAN NOT NULL DEFAULT true,
    "digestFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,
    "quietDaysOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_certificateId_key" ON "Audit"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_shareToken_key" ON "Audit"("shareToken");

-- CreateIndex
CREATE INDEX "Audit_userId_createdAt_idx" ON "Audit"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");

-- CreateIndex
CREATE INDEX "Audit_certificateId_idx" ON "Audit"("certificateId");

-- CreateIndex
CREATE INDEX "Audit_shareToken_idx" ON "Audit"("shareToken");

-- CreateIndex
CREATE INDEX "Audit_url_idx" ON "Audit"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_tier_key" ON "Plan"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "StripeEvent_stripeEventId_key" ON "StripeEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "StripeEvent_stripeEventId_idx" ON "StripeEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "MonitoredSite_userId_idx" ON "MonitoredSite"("userId");

-- CreateIndex
CREATE INDEX "MonitoredSite_isActive_nextScanAt_idx" ON "MonitoredSite"("isActive", "nextScanAt");

-- CreateIndex
CREATE INDEX "Keyword_monitoredSiteId_idx" ON "Keyword"("monitoredSiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_monitoredSiteId_keyword_country_device_key" ON "Keyword"("monitoredSiteId", "keyword", "country", "device");

-- CreateIndex
CREATE INDEX "KeywordSnapshot_keywordId_checkedAt_idx" ON "KeywordSnapshot"("keywordId", "checkedAt" DESC);

-- CreateIndex
CREATE INDEX "CompetitorDomain_monitoredSiteId_idx" ON "CompetitorDomain"("monitoredSiteId");

-- CreateIndex
CREATE INDEX "AuditSnapshot_monitoredSiteId_createdAt_idx" ON "AuditSnapshot"("monitoredSiteId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_emailSent_createdAt_idx" ON "Notification"("emailSent", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "SecurityLog_ip_createdAt_idx" ON "SecurityLog"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityLog_userId_createdAt_idx" ON "SecurityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityLog_event_createdAt_idx" ON "SecurityLog"("event", "createdAt");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoredSite" ADD CONSTRAINT "MonitoredSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_monitoredSiteId_fkey" FOREIGN KEY ("monitoredSiteId") REFERENCES "MonitoredSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordSnapshot" ADD CONSTRAINT "KeywordSnapshot_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorDomain" ADD CONSTRAINT "CompetitorDomain_monitoredSiteId_fkey" FOREIGN KEY ("monitoredSiteId") REFERENCES "MonitoredSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSnapshot" ADD CONSTRAINT "AuditSnapshot_monitoredSiteId_fkey" FOREIGN KEY ("monitoredSiteId") REFERENCES "MonitoredSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSnapshot" ADD CONSTRAINT "AuditSnapshot_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_monitoredSiteId_fkey" FOREIGN KEY ("monitoredSiteId") REFERENCES "MonitoredSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityLog" ADD CONSTRAINT "SecurityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
