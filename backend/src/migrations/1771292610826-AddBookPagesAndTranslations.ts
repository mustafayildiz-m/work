import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookPagesAndTranslations1771292610826 implements MigrationInterface {
    name = 'AddBookPagesAndTranslations1771292610826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book_pages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`bookId\` int NOT NULL, \`pageNumber\` int NOT NULL, \`content\` longtext NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_5473f4254d74fbb203c6463408\` (\`bookId\`, \`pageNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_page_translations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`pageId\` int NOT NULL, \`languageId\` int NOT NULL, \`content\` longtext NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_0540f3e404e31eae474dd42884\` (\`pageId\`, \`languageId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`book_pages\` ADD CONSTRAINT \`FK_b882d99c7dbf30e5e8c3a4f6823\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_page_translations\` ADD CONSTRAINT \`FK_396d63e88c639dd5973468d73a8\` FOREIGN KEY (\`pageId\`) REFERENCES \`book_pages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_page_translations\` ADD CONSTRAINT \`FK_8c89d53da04b31ccb1366e5834c\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_page_translations\` DROP FOREIGN KEY \`FK_8c89d53da04b31ccb1366e5834c\``);
        await queryRunner.query(`ALTER TABLE \`book_page_translations\` DROP FOREIGN KEY \`FK_396d63e88c639dd5973468d73a8\``);
        await queryRunner.query(`ALTER TABLE \`book_pages\` DROP FOREIGN KEY \`FK_b882d99c7dbf30e5e8c3a4f6823\``);
        await queryRunner.query(`DROP INDEX \`IDX_0540f3e404e31eae474dd42884\` ON \`book_page_translations\``);
        await queryRunner.query(`DROP TABLE \`book_page_translations\``);
        await queryRunner.query(`DROP INDEX \`IDX_5473f4254d74fbb203c6463408\` ON \`book_pages\``);
        await queryRunner.query(`DROP TABLE \`book_pages\``);
    }

}
