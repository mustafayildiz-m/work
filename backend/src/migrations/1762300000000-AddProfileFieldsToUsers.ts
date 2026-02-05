import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileFieldsToUsers1762300000000
  implements MigrationInterface
{
  name = 'AddProfileFieldsToUsers1762300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if phoneNo column exists, if not add it
    const phoneNoExists = await queryRunner.hasColumn('users', 'phoneNo');
    if (!phoneNoExists) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`phoneNo\` varchar(50) NULL`,
      );
    }

    // Check if location column exists, if not add it
    const locationExists = await queryRunner.hasColumn('users', 'location');
    if (!locationExists) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`location\` varchar(255) NULL`,
      );
    }

    // Check if birthDate column exists, if not add it
    const birthDateExists = await queryRunner.hasColumn('users', 'birthDate');
    if (!birthDateExists) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`birthDate\` date NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if phoneNo column exists, if yes drop it
    const phoneNoExists = await queryRunner.hasColumn('users', 'phoneNo');
    if (phoneNoExists) {
      await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phoneNo\``);
    }

    // Check if location column exists, if yes drop it
    const locationExists = await queryRunner.hasColumn('users', 'location');
    if (locationExists) {
      await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`location\``);
    }

    // Check if birthDate column exists, if yes drop it
    const birthDateExists = await queryRunner.hasColumn('users', 'birthDate');
    if (birthDateExists) {
      await queryRunner.query(
        `ALTER TABLE \`users\` DROP COLUMN \`birthDate\``,
      );
    }
  }
}
