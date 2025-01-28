/*
  Warnings:

  - A unique constraint covering the columns `[userId,token]` on the table `verification_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "verification_tokens_token_key";

-- DropIndex
DROP INDEX "verification_tokens_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_userId_token_key" ON "verification_tokens"("userId", "token");
