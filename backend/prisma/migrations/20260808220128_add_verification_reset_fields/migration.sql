-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_code_hash" TEXT,
ADD COLUMN     "email_verification_expires_at" TIMESTAMP(3),
ADD COLUMN     "password_reset_expires_at" TIMESTAMP(3),
ADD COLUMN     "password_reset_token_hash" TEXT;
