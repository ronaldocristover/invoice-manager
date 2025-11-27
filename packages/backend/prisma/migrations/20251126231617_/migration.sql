-- AlterTable
ALTER TABLE `invoice_settings` ADD COLUMN `companyAddress` VARCHAR(191) NULL,
    ADD COLUMN `companyEmail` VARCHAR(191) NULL,
    ADD COLUMN `companyName` VARCHAR(191) NULL,
    ADD COLUMN `companyPhone` VARCHAR(191) NULL;
