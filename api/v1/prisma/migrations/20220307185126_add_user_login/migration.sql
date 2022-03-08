-- CreateTable
CREATE TABLE "UserLogin" (
    "userUuid" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserLogin_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLogin_userUuid_key" ON "UserLogin"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "UserLogin_username_key" ON "UserLogin"("username");
