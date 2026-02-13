-- AlterTable
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "upload_requested_at" TIMESTAMP(3);
