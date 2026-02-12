/*
  Warnings:

  - The `end_time` column on the `events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `start_time` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "start_time",
ADD COLUMN     "start_time" INTEGER NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" INTEGER;
