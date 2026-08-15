/*
  Warnings:

  - You are about to drop the column `dateLabel` on the `ScheduleSlot` table. All the data in the column will be lost.
  - You are about to drop the column `dayLabel` on the `ScheduleSlot` table. All the data in the column will be lost.
  - You are about to drop the column `weekOrder` on the `ScheduleSlot` table. All the data in the column will be lost.
  - Added the required column `date` to the `ScheduleSlot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "WorkingSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekday" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScheduleSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "bookedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduleSlot_bookedByUserId_fkey" FOREIGN KEY ("bookedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScheduleSlot" ("bookedByUserId", "id", "status", "time") SELECT "bookedByUserId", "id", "status", "time" FROM "ScheduleSlot";
DROP TABLE "ScheduleSlot";
ALTER TABLE "new_ScheduleSlot" RENAME TO "ScheduleSlot";
CREATE UNIQUE INDEX "ScheduleSlot_date_time_key" ON "ScheduleSlot"("date", "time");
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "logoUrl" TEXT,
    "teacherName" TEXT NOT NULL DEFAULT 'Павел',
    "teacherRole" TEXT NOT NULL DEFAULT 'Преподаватель английского · автор методики',
    "tagline" TEXT NOT NULL DEFAULT 'Английский, который наконец-то заговорит',
    "awards" TEXT NOT NULL DEFAULT '[]',
    "heroPhotoUrl" TEXT NOT NULL DEFAULT '/uploads/pavel.jpg',
    "heroBadge" TEXT NOT NULL DEFAULT '«Учитель
года» ×4',
    "aboutLead" TEXT NOT NULL DEFAULT '',
    "aboutBody" TEXT NOT NULL DEFAULT '[]',
    "reviewsScore" TEXT NOT NULL DEFAULT '4.9',
    "reviewsCount" TEXT NOT NULL DEFAULT '120+ оценок',
    "email" TEXT NOT NULL DEFAULT 'hello@pavelenglish.ru',
    "phone" TEXT NOT NULL DEFAULT '+7 (000) 000-00-00',
    "telegram" TEXT NOT NULL DEFAULT '@pavelenglish',
    "socials" TEXT NOT NULL DEFAULT '[]',
    "footerLegal" TEXT NOT NULL DEFAULT '© 2026 Paul English · ИП Петров П. П. · ИНН 000000000000',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("aboutBody", "aboutLead", "awards", "email", "footerLegal", "heroPhotoUrl", "id", "phone", "reviewsCount", "reviewsScore", "socials", "tagline", "teacherName", "teacherRole", "telegram", "updatedAt") SELECT "aboutBody", "aboutLead", "awards", "email", "footerLegal", "heroPhotoUrl", "id", "phone", "reviewsCount", "reviewsScore", "socials", "tagline", "teacherName", "teacherRole", "telegram", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WorkingSlot_weekday_time_key" ON "WorkingSlot"("weekday", "time");
