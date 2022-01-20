-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "barcode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_products" ("barcode", "createdAt", "id", "name", "price", "updatedAt", "uuid") SELECT "barcode", "createdAt", "id", "name", "price", "updatedAt", "uuid" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_products_1" ON "products"("uuid");
Pragma writable_schema=0;
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_products_2" ON "products"("name");
Pragma writable_schema=0;
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_products_3" ON "products"("barcode");
Pragma writable_schema=0;
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
