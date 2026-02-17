import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeBookTitleNullable1771289430000 implements MigrationInterface {
    name = 'MakeBookTitleNullable1771289430000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // books tablosundaki title ve description alanlarını nullable yapıyoruz
        // Çünkü asıl veriler book_translations tablosunda tutuluyor
        await queryRunner.query(`ALTER TABLE \`books\` MODIFY \`title\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` MODIFY \`description\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Geri alma (rollback) durumunda alanları tekrar NOT NULL yapıyoruz
        // Dikkat: Eğer boş kayıtlar varsa bu işlem hata verecektir
        await queryRunner.query(`ALTER TABLE \`books\` MODIFY \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` MODIFY \`description\` text NOT NULL`);
    }
}
