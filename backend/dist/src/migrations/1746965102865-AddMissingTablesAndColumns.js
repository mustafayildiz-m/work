"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissingTablesAndColumns1746965102865 = void 0;
class AddMissingTablesAndColumns1746965102865 {
    constructor() {
        this.name = 'AddMissingTablesAndColumns1746965102865';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`scholar_own_books\` DROP FOREIGN KEY \`FK_scholar_own_books_scholar\``);
        await queryRunner.query(`ALTER TABLE \`sources\` DROP FOREIGN KEY \`FK_sources_scholar\``);
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` DROP FOREIGN KEY \`FK_scholar_related_books_book\``);
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` DROP FOREIGN KEY \`FK_scholar_related_books_scholar\``);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'user', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_languages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`bookId\` int NOT NULL, \`language\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`bookId\` int NOT NULL, \`categoryName\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`publishDate\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`summary\``);
        await queryRunner.query(`CREATE INDEX \`IDX_4441e00d0375beae4274df51bb\` ON \`scholar_related_books\` (\`scholar_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_71a0d5c8131a501ac5b10c6900\` ON \`scholar_related_books\` (\`book_id\`)`);
        await queryRunner.query(`ALTER TABLE \`scholar_own_books\` ADD CONSTRAINT \`FK_d08cc9436cf4a9d299c21ebc417\` FOREIGN KEY (\`scholar_id\`) REFERENCES \`scholars\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sources\` ADD CONSTRAINT \`FK_0e57eac098d35f453f611e6374b\` FOREIGN KEY (\`scholar_id\`) REFERENCES \`scholars\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_711de461c8fcc1a9ff6864142dc\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` ADD CONSTRAINT \`FK_4441e00d0375beae4274df51bb7\` FOREIGN KEY (\`scholar_id\`) REFERENCES \`scholars\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` ADD CONSTRAINT \`FK_71a0d5c8131a501ac5b10c6900f\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` DROP FOREIGN KEY \`FK_71a0d5c8131a501ac5b10c6900f\``);
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` DROP FOREIGN KEY \`FK_4441e00d0375beae4274df51bb7\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_711de461c8fcc1a9ff6864142dc\``);
        await queryRunner.query(`ALTER TABLE \`sources\` DROP FOREIGN KEY \`FK_0e57eac098d35f453f611e6374b\``);
        await queryRunner.query(`ALTER TABLE \`scholar_own_books\` DROP FOREIGN KEY \`FK_d08cc9436cf4a9d299c21ebc417\``);
        await queryRunner.query(`DROP INDEX \`IDX_71a0d5c8131a501ac5b10c6900\` ON \`scholar_related_books\``);
        await queryRunner.query(`DROP INDEX \`IDX_4441e00d0375beae4274df51bb\` ON \`scholar_related_books\``);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`summary\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`publishDate\` date NULL`);
        await queryRunner.query(`DROP TABLE \`book_categories\``);
        await queryRunner.query(`DROP TABLE \`book_languages\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` ADD CONSTRAINT \`FK_scholar_related_books_scholar\` FOREIGN KEY (\`scholar_id\`) REFERENCES \`scholars\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scholar_related_books\` ADD CONSTRAINT \`FK_scholar_related_books_book\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sources\` ADD CONSTRAINT \`FK_sources_scholar\` FOREIGN KEY (\`scholar_id\`) REFERENCES \`scholars\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scholar_own_books\` ADD CONSTRAINT \`FK_scholar_own_books_scholar\` FOREIGN KEY (\`scholar_id\`) REFERENCES \`scholars\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
exports.AddMissingTablesAndColumns1746965102865 = AddMissingTablesAndColumns1746965102865;
//# sourceMappingURL=1746965102865-AddMissingTablesAndColumns.js.map