/*
  Warnings:

  - Added the required column `companyId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `companyId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `products_companyId_idx` ON `products`(`companyId`);
