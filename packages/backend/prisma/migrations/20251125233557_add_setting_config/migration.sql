-- AlterTable
ALTER TABLE `invoice_settings` ADD COLUMN `defaultFont` VARCHAR(191) NOT NULL DEFAULT 'Helvetica',
    ADD COLUMN `enableWatermark` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `pdfNameFormat` VARCHAR(191) NOT NULL DEFAULT 'invoice-{invoiceNumber}',
    ADD COLUMN `watermarkColor` VARCHAR(191) NOT NULL DEFAULT '#CCCCCC',
    ADD COLUMN `watermarkSize` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `watermarkText` VARCHAR(191) NULL;
