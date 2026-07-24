-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT;
