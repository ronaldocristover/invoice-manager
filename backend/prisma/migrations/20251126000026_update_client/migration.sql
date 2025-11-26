-- AlterTable
ALTER TABLE `invoice_settings` ADD COLUMN `enableSignature` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `signatureImageUrl` VARCHAR(191) NULL,
    ADD COLUMN `signatureText` VARCHAR(191) NULL;
