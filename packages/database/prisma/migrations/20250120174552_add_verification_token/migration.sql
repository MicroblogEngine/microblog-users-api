-- CreateTable
CREATE TABLE "verification_tokens" (
    "userId" VARCHAR(40) NOT NULL,
    "token" VARCHAR(8) NOT NULL,
    "expires" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_userId_key" ON "verification_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
