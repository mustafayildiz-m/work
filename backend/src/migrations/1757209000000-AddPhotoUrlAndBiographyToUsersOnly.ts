import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoUrlAndBiographyToUsersOnly1757209000000
  implements MigrationInterface
{
  name = 'AddPhotoUrlAndBiographyToUsersOnly1757209000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if photoUrl column exists, if not add it
    const photoUrlExists = await queryRunner.hasColumn('users', 'photoUrl');
    if (!photoUrlExists) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`photoUrl\` varchar(255) NULL`,
      );
    }

    // Check if biography column exists, if not add it
    const biographyExists = await queryRunner.hasColumn('users', 'biography');
    if (!biographyExists) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`biography\` varchar(255) NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if photoUrl column exists, if yes drop it
    const photoUrlExists = await queryRunner.hasColumn('users', 'photoUrl');
    if (photoUrlExists) {
      await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`photoUrl\``);
    }

    // Check if biography column exists, if yes drop it
    const biographyExists = await queryRunner.hasColumn('users', 'biography');
    if (biographyExists) {
      await queryRunner.query(
        `ALTER TABLE \`users\` DROP COLUMN \`biography\``,
      );
    }
  }
}
