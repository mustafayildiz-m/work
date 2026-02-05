import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSharedArticleIdToUserPosts1760010400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('user_posts');
    const hasColumn = table?.findColumnByName('shared_article_id');

    if (!hasColumn) {
      await queryRunner.addColumn(
        'user_posts',
        new TableColumn({
          name: 'shared_article_id',
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_posts', 'shared_article_id');
  }
}
