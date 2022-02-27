/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "roleUuid" TEXT NOT NULL,
    "groupUuid" TEXT NOT NULL,
    "barcode" TEXT,
    "imagePath" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleUuid_fkey" FOREIGN KEY ("roleUuid") REFERENCES "Role" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_groupUuid_fkey" FOREIGN KEY ("groupUuid") REFERENCES "Group" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("balance", "barcode", "birthDate", "createdAt", "firstName", "groupUuid", "lastName", "roleUuid", "updatedAt", "uuid") SELECT "balance", "barcode", "birthDate", "createdAt", "firstName", "groupUuid", "lastName", "roleUuid", "updatedAt", "uuid" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
CREATE UNIQUE INDEX "User_barcode_key" ON "User"("barcode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
