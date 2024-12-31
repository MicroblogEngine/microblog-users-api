-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "salt" VARCHAR(400) NOT NULL,
    "hash" VARCHAR(400) NOT NULL,
    "email_verified" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
