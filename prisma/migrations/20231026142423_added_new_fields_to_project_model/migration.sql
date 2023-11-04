/*
  Warnings:

  - Added the required column `coverImageSm` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "coverImageSm" TEXT NOT NULL,
ADD COLUMN     "mobileImages" TEXT[];
