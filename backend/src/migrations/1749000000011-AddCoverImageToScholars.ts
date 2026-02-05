import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverImageToScholars1749000000011
  implements MigrationInterface
{
  name = 'AddCoverImageToScholars1749000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`scholars\` ADD COLUMN \`coverImage\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`scholars\` DROP COLUMN \`coverImage\``,
    );
  }
}
