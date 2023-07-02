-- CreateTable
CREATE TABLE `Chat` (
    `uuid` VARCHAR(191) NOT NULL,
    `remember` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` VARCHAR(32) NULL,
    `name` VARCHAR(255) NOT NULL,
    `systemPrompt` TEXT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prompt` (
    `uuid` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(3) NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `isBusy` BOOLEAN NOT NULL DEFAULT false,
    `isSuccessful` BOOLEAN NOT NULL DEFAULT false,
    `role` VARCHAR(16) NULL,
    `prompt` TEXT NULL,
    `chatUUID` VARCHAR(191) NOT NULL,

    INDEX `chatUUID`(`chatUUID`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_ibfk_1` FOREIGN KEY (`chatUUID`) REFERENCES `Chat`(`uuid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

