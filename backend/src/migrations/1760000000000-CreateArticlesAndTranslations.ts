import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateArticlesAndTranslations1760000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Articles tablosunu oluştur
    await queryRunner.createTable(
      new Table({
        name: 'articles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'bookId',
            type: 'int',
          },
          {
            name: 'author',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'publishDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'coverImage',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'orderIndex',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 2. Article_translations tablosunu oluştur
    await queryRunner.createTable(
      new Table({
        name: 'article_translations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'articleId',
            type: 'int',
          },
          {
            name: 'languageId',
            type: 'int',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'pdfUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // 3. Foreign Key: articles -> books
    await queryRunner.createForeignKey(
      'articles',
      new TableForeignKey({
        columnNames: ['bookId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'books',
        onDelete: 'CASCADE',
      }),
    );

    // 4. Foreign Key: article_translations -> articles
    await queryRunner.createForeignKey(
      'article_translations',
      new TableForeignKey({
        columnNames: ['articleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'articles',
        onDelete: 'CASCADE',
      }),
    );

    // 5. Foreign Key: article_translations -> languages
    await queryRunner.createForeignKey(
      'article_translations',
      new TableForeignKey({
        columnNames: ['languageId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'languages',
        onDelete: 'CASCADE',
      }),
    );

    console.log('✅ Articles ve ArticleTranslations tabloları oluşturuldu');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Foreign key'leri sil
    const articleTranslationsTable = await queryRunner.getTable(
      'article_translations',
    );
    const articlesForeignKeys = articleTranslationsTable?.foreignKeys.filter(
      (fk) =>
        fk.columnNames.indexOf('articleId') !== -1 ||
        fk.columnNames.indexOf('languageId') !== -1,
    );
    if (articlesForeignKeys) {
      for (const fk of articlesForeignKeys) {
        await queryRunner.dropForeignKey('article_translations', fk);
      }
    }

    const articlesTable = await queryRunner.getTable('articles');
    const bookForeignKey = articlesTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('bookId') !== -1,
    );
    if (bookForeignKey) {
      await queryRunner.dropForeignKey('articles', bookForeignKey);
    }

    // Tabloları sil
    await queryRunner.dropTable('article_translations');
    await queryRunner.dropTable('articles');

    console.log('✅ Articles ve ArticleTranslations tabloları silindi');
  }
}
