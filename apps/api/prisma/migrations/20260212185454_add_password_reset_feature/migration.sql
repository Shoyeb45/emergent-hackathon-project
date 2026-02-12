-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_reset_otp" VARCHAR(10),
ADD COLUMN     "password_reset_otp_expires_at" TIMESTAMP(3);
