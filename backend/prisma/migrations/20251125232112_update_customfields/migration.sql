-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `customFields` JSON NULL,
    ADD COLUMN `discount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `shipping` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `terms` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `invoice_settings` (
    `id` VARCHAR(191) NOT NULL,
    `invoicePrefix` VARCHAR(191) NOT NULL DEFAULT 'INV',
    `invoiceTheme` VARCHAR(191) NOT NULL DEFAULT 'default',
    `logoUrl` VARCHAR(191) NULL,
    `enableTax` BOOLEAN NOT NULL DEFAULT true,
    `enableShipping` BOOLEAN NOT NULL DEFAULT false,
    `enableDiscount` BOOLEAN NOT NULL DEFAULT false,
    `defaultTax` DOUBLE NOT NULL DEFAULT 0,
    `defaultNotes` VARCHAR(191) NULL,
    `defaultTerms` VARCHAR(191) NULL,
    `customFields` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
