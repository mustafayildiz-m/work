import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserVerificationFieldsClean1770448000000 implements MigrationInterface {
    name = 'AddUserVerificationFieldsClean1770448000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Safe check for columns
        const table = await queryRunner.getTable("users");

        if (table) {
            if (!table.findColumnByName("isVerified")) {
                await queryRunner.query(`ALTER TABLE \`users\` ADD \`isVerified\` tinyint NOT NULL DEFAULT 0`);
            }
            if (!table.findColumnByName("verificationToken")) {
                await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationToken\` varchar(255) NULL`);
            }
            if (!table.findColumnByName("verificationTokenExpires")) {
                await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationTokenExpires\` timestamp NULL`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationTokenExpires\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationToken\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isVerified\``);
    }
}
