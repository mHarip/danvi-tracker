/*
  Warnings:

  - Made the column `startTime` on table `Belt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Belt" ALTER COLUMN "startTime" SET NOT NULL;
