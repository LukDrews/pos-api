/*
  Warnings:

  - You are about to drop the column `orderUuid` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `transactionUuid` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "userUuid" TEXT NOT NULL,
    "amount" INTEGER,
    "transactionUuid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_transactionUuid_fkey" FOREIGN KEY ("transactionUuid") REFERENCES "Transaction" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("amount", "createdAt", "updatedAt", "userUuid", "uuid") SELECT "amount", "createdAt", "updatedAt", "userUuid", "uuid" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_uuid_key" ON "Order"("uuid");
CREATE UNIQUE INDEX "Order_transactionUuid_key" ON "Order"("transactionUuid");
CREATE TABLE "new_Transaction" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "userUuid" TEXT,
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "userUuid", "uuid") SELECT "amount", "createdAt", "userUuid", "uuid" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_uuid_key" ON "Transaction"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
