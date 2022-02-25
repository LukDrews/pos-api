-- CreateTable
CREATE TABLE "Transaction" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "userUuid" TEXT,
    "orderUuid" TEXT,
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_orderUuid_fkey" FOREIGN KEY ("orderUuid") REFERENCES "Order" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);

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
    "imageUrl" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleUuid_fkey" FOREIGN KEY ("roleUuid") REFERENCES "Role" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_groupUuid_fkey" FOREIGN KEY ("groupUuid") REFERENCES "Group" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("barcode", "birthDate", "createdAt", "firstName", "groupUuid", "imageUrl", "lastName", "roleUuid", "updatedAt", "uuid") SELECT "barcode", "birthDate", "createdAt", "firstName", "groupUuid", "imageUrl", "lastName", "roleUuid", "updatedAt", "uuid" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
CREATE UNIQUE INDEX "User_barcode_key" ON "User"("barcode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_uuid_key" ON "Transaction"("uuid");
