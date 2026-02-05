import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSharedBookToUserPosts1760100000002
  implements MigrationInterface
{
  name = 'AddSharedBookToUserPosts1760100000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add shared_book_id column
    await queryRunner.query(`
            ALTER TABLE \`user_posts\` 
            ADD COLUMN \`shared_book_id\` int NULL
        `);

    // Add index for better performance
    await queryRunner.query(`
            CREATE INDEX \`IDX_shared_book_id\` ON \`user_posts\` (\`shared_book_id\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(
      `DROP INDEX \`IDX_shared_book_id\` ON \`user_posts\``,
    );

    // Drop column
    await queryRunner.query(
      `ALTER TABLE \`user_posts\` DROP COLUMN \`shared_book_id\``,
    );
  }
}
