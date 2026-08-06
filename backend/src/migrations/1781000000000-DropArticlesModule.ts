import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropArticlesModule1781000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userPostsTable = await queryRunner.getTable('user_posts');
    const sharedArticleColumn = userPostsTable?.findColumnByName('shared_article_id');
    if (sharedArticleColumn) {
      await queryRunner.dropColumn('user_posts', 'shared_article_id');
    }

    const dropTables = [
      'article_page_translations',
      'article_pages',
      'article_translations',
      'articles',
    ];

    for (const table of dropTables) {
      const exists = await queryRunner.hasTable(table);
      if (exists) {
        await queryRunner.dropTable(table, true, true, true);
      }
    }
  }

  public async down(): Promise<void> {
    // Kitapçık modülü kaldırıldı; geri alma desteklenmiyor.
  }
}
