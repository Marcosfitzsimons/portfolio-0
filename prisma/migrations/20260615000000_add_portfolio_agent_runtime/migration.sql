-- CreateTable
CREATE TABLE "PortfolioAgentConversation" (
    "id" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "activeRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioAgentConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioAgentRun" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "routingProfile" JSONB,
    "routingMode" TEXT,
    "orchestratorModel" TEXT,
    "usage" JSONB,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "PortfolioAgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioAgentSpecialistRun" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "specialist" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sourceIds" TEXT[],
    "evidence" JSONB,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "PortfolioAgentSpecialistRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioAgentTraceEvent" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "publicLabel" TEXT NOT NULL,
    "publicData" JSONB,
    "sourceLabels" TEXT[],
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioAgentTraceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioAgentRateLimitBucket" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioAgentRateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioAgentConversation_expiresAt_idx" ON "PortfolioAgentConversation"("expiresAt");

-- CreateIndex
CREATE INDEX "PortfolioAgentRun_conversationId_createdAt_idx" ON "PortfolioAgentRun"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "PortfolioAgentSpecialistRun_runId_idx" ON "PortfolioAgentSpecialistRun"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioAgentSpecialistRun_runId_specialist_key" ON "PortfolioAgentSpecialistRun"("runId", "specialist");

-- CreateIndex
CREATE INDEX "PortfolioAgentTraceEvent_runId_createdAt_idx" ON "PortfolioAgentTraceEvent"("runId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioAgentTraceEvent_runId_sequence_key" ON "PortfolioAgentTraceEvent"("runId", "sequence");

-- CreateIndex
CREATE INDEX "PortfolioAgentRateLimitBucket_expiresAt_idx" ON "PortfolioAgentRateLimitBucket"("expiresAt");

-- AddForeignKey
ALTER TABLE "PortfolioAgentRun" ADD CONSTRAINT "PortfolioAgentRun_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "PortfolioAgentConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioAgentSpecialistRun" ADD CONSTRAINT "PortfolioAgentSpecialistRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PortfolioAgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioAgentTraceEvent" ADD CONSTRAINT "PortfolioAgentTraceEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PortfolioAgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

