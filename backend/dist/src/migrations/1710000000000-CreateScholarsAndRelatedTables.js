"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateScholarsAndRelatedTables1710000000000 = void 0;
class CreateScholarsAndRelatedTables1710000000000 {
    constructor() {
        this.name = 'CreateScholarsAndRelatedTables1710000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE scholars (
                id int NOT NULL AUTO_INCREMENT,
                fullName varchar(255) NOT NULL,
                lineage text NULL,
                birthDate date NULL,
                deathDate date NULL,
                biography text NOT NULL,
                photoUrl varchar(255) NULL,
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE scholar_own_books (
                id int NOT NULL AUTO_INCREMENT,
                title varchar(255) NOT NULL,
                description text NULL,
                coverUrl varchar(255) NULL,
                scholar_id int NULL,
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE books (
                id int NOT NULL AUTO_INCREMENT,
                title varchar(255) NOT NULL,
                description text NULL,
                coverUrl varchar(255) NULL,
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE sources (
                id int NOT NULL AUTO_INCREMENT,
                content text NOT NULL,
                url varchar(255) NULL,
                scholar_id int NULL,
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE scholar_related_books (
                scholar_id int NOT NULL,
                book_id int NOT NULL,
                PRIMARY KEY (scholar_id, book_id)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE scholar_own_books
            ADD CONSTRAINT FK_scholar_own_books_scholar
            FOREIGN KEY (scholar_id) REFERENCES scholars(id)
            ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE sources
            ADD CONSTRAINT FK_sources_scholar
            FOREIGN KEY (scholar_id) REFERENCES scholars(id)
            ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE scholar_related_books
            ADD CONSTRAINT FK_scholar_related_books_scholar
            FOREIGN KEY (scholar_id) REFERENCES scholars(id)
            ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE scholar_related_books
            ADD CONSTRAINT FK_scholar_related_books_book
            FOREIGN KEY (book_id) REFERENCES books(id)
            ON DELETE CASCADE
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE scholar_related_books DROP FOREIGN KEY FK_scholar_related_books_book`);
        await queryRunner.query(`ALTER TABLE scholar_related_books DROP FOREIGN KEY FK_scholar_related_books_scholar`);
        await queryRunner.query(`ALTER TABLE sources DROP FOREIGN KEY FK_sources_scholar`);
        await queryRunner.query(`ALTER TABLE scholar_own_books DROP FOREIGN KEY FK_scholar_own_books_scholar`);
        await queryRunner.query(`DROP TABLE scholar_related_books`);
        await queryRunner.query(`DROP TABLE sources`);
        await queryRunner.query(`DROP TABLE books`);
        await queryRunner.query(`DROP TABLE scholar_own_books`);
        await queryRunner.query(`DROP TABLE scholars`);
    }
}
exports.CreateScholarsAndRelatedTables1710000000000 = CreateScholarsAndRelatedTables1710000000000;
//# sourceMappingURL=1710000000000-CreateScholarsAndRelatedTables.js.map