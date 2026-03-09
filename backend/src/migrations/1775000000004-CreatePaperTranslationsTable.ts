import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePaperTranslationsTable1775000000004
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'paper_translations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'paperId',
            type: 'int',
          },
          {
            name: 'languageCode',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'intro',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'longtext',
            isNullable: true,
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

    await queryRunner.createForeignKey(
      'paper_translations',
      new TableForeignKey({
        name: 'FK_paper_translations_paper',
        columnNames: ['paperId'],
        referencedTableName: 'papers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'paper_translations',
      new TableIndex({
        name: 'IDX_paper_translations_lookup',
        columnNames: ['paperId', 'languageCode'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'paper_translations',
      'FK_paper_translations_paper',
    );
    await queryRunner.dropTable('paper_translations');
  }
}
