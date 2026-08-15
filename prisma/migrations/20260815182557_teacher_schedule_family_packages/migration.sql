/*
  Warnings:

  - Added the required column `teacherId` to the `ScheduleSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `WorkingSlot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL DEFAULT 'Сам',
    "note" TEXT,
    "isSelf" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PackagePurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "lessonsTotal" INTEGER NOT NULL,
    "lessonsUsed" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT,
    CONSTRAINT "PackagePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PackagePurchase_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "date" TEXT,
    "time" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'plan',
    "order" INTEGER NOT NULL DEFAULT 0,
    "teacherId" INTEGER,
    "memberId" TEXT,
    "purchaseId" TEXT,
    "countedAt" DATETIME,
    CONSTRAINT "Lesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeamMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lesson_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lesson_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PackagePurchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("dateLabel", "id", "order", "status", "time", "topic", "userId") SELECT "dateLabel", "id", "order", "status", "time", "topic", "userId" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new_Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "priceAmount" INTEGER NOT NULL DEFAULT 0,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "per" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "accent" BOOLEAN NOT NULL DEFAULT false,
    "feats" TEXT NOT NULL DEFAULT '[]',
    "cta" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Package" ("accent", "cta", "feats", "id", "isTrial", "name", "note", "order", "per", "popular", "price", "priceAmount") SELECT "accent", "cta", "feats", "id", "isTrial", "name", "note", "order", "per", "popular", "price", "priceAmount" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE TABLE "new_ScheduleSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "bookedByUserId" TEXT,
    "memberId" TEXT,
    "lessonId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduleSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduleSlot_bookedByUserId_fkey" FOREIGN KEY ("bookedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScheduleSlot_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScheduleSlot_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScheduleSlot" ("bookedByUserId", "createdAt", "date", "id", "status", "time") SELECT "bookedByUserId", "createdAt", "date", "id", "status", "time" FROM "ScheduleSlot";
DROP TABLE "ScheduleSlot";
ALTER TABLE "new_ScheduleSlot" RENAME TO "ScheduleSlot";
CREATE UNIQUE INDEX "ScheduleSlot_lessonId_key" ON "ScheduleSlot"("lessonId");
CREATE INDEX "ScheduleSlot_date_idx" ON "ScheduleSlot"("date");
CREATE UNIQUE INDEX "ScheduleSlot_teacherId_date_time_key" ON "ScheduleSlot"("teacherId", "date", "time");
CREATE TABLE "new_TeamMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT NOT NULL,
    "photoUrl" TEXT,
    "hero" BOOLEAN NOT NULL DEFAULT false,
    "takesBookings" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_TeamMember" ("hero", "id", "name", "note", "order", "photoUrl", "role", "tags") SELECT "hero", "id", "name", "note", "order", "photoUrl", "role", "tags" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE TABLE "new_WorkingSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "WorkingSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkingSlot" ("enabled", "id", "time", "weekday") SELECT "enabled", "id", "time", "weekday" FROM "WorkingSlot";
DROP TABLE "WorkingSlot";
ALTER TABLE "new_WorkingSlot" RENAME TO "WorkingSlot";
CREATE UNIQUE INDEX "WorkingSlot_teacherId_weekday_time_key" ON "WorkingSlot"("teacherId", "weekday", "time");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PackagePurchase_paymentId_key" ON "PackagePurchase"("paymentId");
