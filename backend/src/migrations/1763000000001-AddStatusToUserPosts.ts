import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToUserPosts1763000000001 implements MigrationInterface {
  name = 'AddStatusToUserPosts1763000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add status column with enum
    await queryRunner.query(`
      ALTER TABLE \`user_posts\` 
      ADD COLUMN \`status\` enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'
    `);

    // Add approved_by column
    await queryRunner.query(`
      ALTER TABLE \`user_posts\` 
      ADD COLUMN \`approved_by\` int NULL
    `);

    // Update existing posts to approved status (for backward compatibility)
    await queryRunner.query(`
      UPDATE \`user_posts\` 
      SET \`status\` = 'approved' 
      WHERE \`status\` = 'pending'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_posts\` DROP COLUMN \`approved_by\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_posts\` DROP COLUMN \`status\``,
    );
  }
}
