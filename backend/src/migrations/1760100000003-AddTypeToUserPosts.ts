import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToUserPosts1760100000003 implements MigrationInterface {
  name = 'AddTypeToUserPosts1760100000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add type column
    await queryRunner.query(`
            ALTER TABLE \`user_posts\` 
            ADD COLUMN \`type\` varchar(255) NULL
        `);

    // Set default type for existing posts
    await queryRunner.query(`
            UPDATE \`user_posts\` 
            SET \`type\` = 'user' 
            WHERE \`type\` IS NULL
        `);

    // Add index for better performance
    await queryRunner.query(`
            CREATE INDEX \`IDX_user_posts_type\` ON \`user_posts\` (\`type\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(
      `DROP INDEX \`IDX_user_posts_type\` ON \`user_posts\``,
    );

    // Drop column
    await queryRunner.query(`ALTER TABLE \`user_posts\` DROP COLUMN \`type\``);
  }
}
