-- AlterTable
ALTER TABLE `invoice_settings` ADD COLUMN `currencyFormat` VARCHAR(191) NOT NULL DEFAULT 'USD',
    ADD COLUMN `currencySymbol` VARCHAR(191) NOT NULL DEFAULT '$';
