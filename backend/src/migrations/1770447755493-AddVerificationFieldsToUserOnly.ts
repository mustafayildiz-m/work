import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationFieldsToUserOnly1770447755493 implements MigrationInterface {
    name = 'AddVerificationFieldsToUserOnly1770447755493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_f6b102769f893b3d2562a4c1c6c\` ON \`article_translations\``);
        await queryRunner.query(`DROP INDEX \`FK_711de461c8fcc1a9ff6864142dc\` ON \`book_translations\``);
        await queryRunner.query(`DROP INDEX \`FK_805a09bc0444e439b53dfc0b061\` ON \`book_translations\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverUrl\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverImage\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`author\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`publishDate\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverImage\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`author\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`publishDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_35efad6238b50c07ad5b20b827\` ON \`user_post_shares\` (\`user_id\`, \`post_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_posts\` ADD CONSTRAINT \`FK_441391a3d99f2320003357c8626\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article_translations\` ADD CONSTRAINT \`FK_f6b102769f893b3d2562a4c1c6c\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_translations\` ADD CONSTRAINT \`FK_4cfdbee090831904e931ca13a41\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_translations\` ADD CONSTRAINT \`FK_46a120cd82834485344bc515a05\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_805a09bc0444e439b53dfc0b061\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_711de461c8fcc1a9ff6864142dc\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scholar_post_translations\` ADD CONSTRAINT \`FK_2f41c5bab197e79cbefa0ada105\` FOREIGN KEY (\`postId\`) REFERENCES \`scholar_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_post_shares\` ADD CONSTRAINT \`FK_935d0c4a50497c07278e54fb1a3\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_post_shares\` ADD CONSTRAINT \`FK_ebb18b529c9f3a65e6995dd5203\` FOREIGN KEY (\`post_id\`) REFERENCES \`user_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_post_shares\` DROP FOREIGN KEY \`FK_ebb18b529c9f3a65e6995dd5203\``);
        await queryRunner.query(`ALTER TABLE \`user_post_shares\` DROP FOREIGN KEY \`FK_935d0c4a50497c07278e54fb1a3\``);
        await queryRunner.query(`ALTER TABLE \`scholar_post_translations\` DROP FOREIGN KEY \`FK_2f41c5bab197e79cbefa0ada105\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_711de461c8fcc1a9ff6864142dc\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_805a09bc0444e439b53dfc0b061\``);
        await queryRunner.query(`ALTER TABLE \`book_translations\` DROP FOREIGN KEY \`FK_46a120cd82834485344bc515a05\``);
        await queryRunner.query(`ALTER TABLE \`book_translations\` DROP FOREIGN KEY \`FK_4cfdbee090831904e931ca13a41\``);
        await queryRunner.query(`ALTER TABLE \`article_translations\` DROP FOREIGN KEY \`FK_f6b102769f893b3d2562a4c1c6c\``);
        await queryRunner.query(`ALTER TABLE \`user_posts\` DROP FOREIGN KEY \`FK_441391a3d99f2320003357c8626\``);
        await queryRunner.query(`DROP INDEX \`IDX_35efad6238b50c07ad5b20b827\` ON \`user_post_shares\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`publishDate\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`author\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverImage\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverUrl\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`description\` text COLLATE "utf8mb4_general_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`title\` varchar(255) COLLATE "utf8mb4_general_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`isActive\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`publishDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`author\` varchar(255) COLLATE "utf8mb4_general_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverImage\` varchar(255) COLLATE "utf8mb4_general_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverUrl\` varchar(255) COLLATE "utf8mb4_general_ci" NULL`);
        await queryRunner.query(`CREATE INDEX \`FK_805a09bc0444e439b53dfc0b061\` ON \`book_translations\` (\`languageId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_711de461c8fcc1a9ff6864142dc\` ON \`book_translations\` (\`bookId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_f6b102769f893b3d2562a4c1c6c\` ON \`article_translations\` (\`languageId\`)`);
    }

}
