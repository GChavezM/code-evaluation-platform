-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CODER', 'EVALUATOR', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CODER';
