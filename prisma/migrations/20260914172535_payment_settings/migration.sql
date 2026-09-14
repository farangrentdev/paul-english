-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "provider" TEXT NOT NULL DEFAULT 'yookassa',
    "shopId" TEXT NOT NULL DEFAULT '',
    "secretKeyEnc" TEXT,
    "liveMode" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" DATETIME,
    "lastCheckOk" BOOLEAN,
    "lastCheckError" TEXT,
    "updatedAt" DATETIME NOT NULL
);
