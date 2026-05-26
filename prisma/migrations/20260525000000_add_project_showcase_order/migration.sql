-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "showcaseOrder" INTEGER NOT NULL DEFAULT 100;

-- Backfill existing project rows with the global Showcase Order.
UPDATE "Project" SET "showcaseOrder" = 10 WHERE "title" = 'Brixa';
UPDATE "Project" SET "showcaseOrder" = 20 WHERE "title" IN ('Travel Booking App', 'Fabebus');
UPDATE "Project" SET "showcaseOrder" = 30 WHERE "title" = 'Grab & Eat';
UPDATE "Project" SET "showcaseOrder" = 40 WHERE "title" = 'Claimence';
UPDATE "Project" SET "showcaseOrder" = 50 WHERE "title" = 'KeySwap';
UPDATE "Project" SET "showcaseOrder" = 60 WHERE "title" = 'Golfo Nuevo Admin';
UPDATE "Project" SET "showcaseOrder" = 100 WHERE "title" = 'Cash Tally';
UPDATE "Project" SET "showcaseOrder" = 110 WHERE "title" = 'Feeling the Groove';
UPDATE "Project" SET "showcaseOrder" = 120 WHERE "title" = 'Multi Step Form';
UPDATE "Project" SET "showcaseOrder" = 130 WHERE "title" = 'Rest Countries App';

