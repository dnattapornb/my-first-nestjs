/*
  Warnings:

  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `VarChar(191)`.
  - You are about to alter the column `first_name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `VarChar(191)`.
  - You are about to alter the column `last_name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `first_name` VARCHAR(191) NULL,
    MODIFY `last_name` VARCHAR(191) NULL;
