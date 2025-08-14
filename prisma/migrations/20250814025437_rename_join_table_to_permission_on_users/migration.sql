/*
  Warnings:

  - You are about to drop the `users_on_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `users_on_permissions` DROP FOREIGN KEY `users_on_permissions_permission_id_fkey`;

-- DropForeignKey
ALTER TABLE `users_on_permissions` DROP FOREIGN KEY `users_on_permissions_user_id_fkey`;

-- DropTable
DROP TABLE `users_on_permissions`;

-- CreateTable
CREATE TABLE `permission_on_users` (
    `user_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permission_on_users_user_id_permission_id_key`(`user_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `permission_on_users` ADD CONSTRAINT `permission_on_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permission_on_users` ADD CONSTRAINT `permission_on_users_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
