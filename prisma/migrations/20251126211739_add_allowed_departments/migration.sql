-- CreateTable
CREATE TABLE "AllowedDepartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "AllowedDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedDepartment_name_key" ON "AllowedDepartment"("name");

-- CreateIndex
CREATE INDEX "AllowedDepartment_name_idx" ON "AllowedDepartment"("name");

-- CreateIndex
CREATE INDEX "AllowedDepartment_isActive_idx" ON "AllowedDepartment"("isActive");
