import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetPasswordFields1770449000000 implements MigrationInterface {
    name = 'AddResetPasswordFields1770449000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("users");

        if (table) {
            if (!table.findColumnByName("resetPasswordToken")) {
                await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetPasswordToken\` varchar(255) NULL`);
            }
            if (!table.findColumnByName("resetPasswordExpires")) {
                await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetPasswordExpires\` timestamp NULL`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetPasswordExpires\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetPasswordToken\``);
    }
}
