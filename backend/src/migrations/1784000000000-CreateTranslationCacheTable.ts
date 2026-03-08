import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTranslationCacheTable1784000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'translation_cache',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'sourceTextHash',
            type: 'varchar',
            length: '32',
          },
          {
            name: 'targetLangCode',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'sourceLangCode',
            type: 'varchar',
            length: '20',
            default: "'auto'",
          },
          {
            name: 'translatedText',
            type: 'longtext',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'translation_cache',
      new TableIndex({
        name: 'IDX_translation_cache_lookup',
        columnNames: ['sourceTextHash', 'targetLangCode', 'sourceLangCode'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('translation_cache');
  }
}
