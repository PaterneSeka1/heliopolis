-- CreateEnum
CREATE TYPE "GuideRole" AS ENUM ('PLEIN', 'ADJOINT', 'ASSISTANT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "guideRole" "GuideRole";
