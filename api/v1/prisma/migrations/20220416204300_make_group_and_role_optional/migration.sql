-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "roleUuid" TEXT,
    "groupUuid" TEXT,
    "barcode" TEXT,
    "imagePath" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleUuid_fkey" FOREIGN KEY ("roleUuid") REFERENCES "Role" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_groupUuid_fkey" FOREIGN KEY ("groupUuid") REFERENCES "Group" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("balance", "barcode", "birthDate", "createdAt", "firstName", "groupUuid", "imagePath", "lastName", "roleUuid", "updatedAt", "uuid") SELECT "balance", "barcode", "birthDate", "createdAt", "firstName", "groupUuid", "imagePath", "lastName", "roleUuid", "updatedAt", "uuid" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
CREATE UNIQUE INDEX "User_barcode_key" ON "User"("barcode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
