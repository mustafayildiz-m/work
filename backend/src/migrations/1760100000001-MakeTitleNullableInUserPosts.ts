import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTitleNullableInUserPosts1760100000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make title column nullable
    await queryRunner.query(
      `ALTER TABLE user_posts MODIFY COLUMN title VARCHAR(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: make title column NOT NULL
    await queryRunner.query(
      `ALTER TABLE user_posts MODIFY COLUMN title VARCHAR(255) NOT NULL`,
    );
  }
}
