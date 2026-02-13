-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_otp" VARCHAR(10),
ADD COLUMN IF NOT EXISTS "password_reset_otp_expires_at" TIMESTAMP(3);
