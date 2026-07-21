-- Add missing bio and experience columns to tasker_profiles
-- These exist in schema.prisma but were omitted from the initial migration

ALTER TABLE "tasker_profiles"
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "experience" INTEGER;
