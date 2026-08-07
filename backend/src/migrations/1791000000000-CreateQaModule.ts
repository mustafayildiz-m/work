import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateQaModule1791000000000 implements MigrationInterface {
  name = 'CreateQaModule1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'qa_categories',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'parentId', type: 'int', isNullable: true },
          { name: 'order', type: 'int', default: 0 },
          { name: 'isActive', type: 'tinyint', default: 1 },
          { name: 'iconUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'qa_categories',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedTableName: 'qa_categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'qa_category_translations',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'categoryId', type: 'int' },
          { name: 'languageId', type: 'int' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('qa_category_translations', [
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedTableName: 'qa_categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['languageId'],
        referencedTableName: 'languages',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'qa_tags',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'qa_tag_translations',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'tagId', type: 'int' },
          { name: 'languageId', type: 'int' },
          { name: 'name', type: 'varchar', length: '100' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('qa_tag_translations', [
      new TableForeignKey({
        columnNames: ['tagId'],
        referencedTableName: 'qa_tags',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['languageId'],
        referencedTableName: 'languages',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'qa_items',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'categoryId', type: 'int', isNullable: true },
          { name: 'order', type: 'int', default: 0 },
          { name: 'sourceReference', type: 'varchar', length: '500', isNullable: true },
          { name: 'sourceBookletName', type: 'varchar', length: '255', isNullable: true },
          { name: 'sourceSection', type: 'varchar', length: '255', isNullable: true },
          { name: 'isActive', type: 'tinyint', default: 1 },
          { name: 'viewCount', type: 'int', default: 0 },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'qa_items',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedTableName: 'qa_categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'qa_item_translations',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'qaItemId', type: 'int' },
          { name: 'languageId', type: 'int' },
          { name: 'question', type: 'text' },
          { name: 'answer', type: 'text' },
          { name: 'keywords', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('qa_item_translations', [
      new TableForeignKey({
        columnNames: ['qaItemId'],
        referencedTableName: 'qa_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['languageId'],
        referencedTableName: 'languages',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'qa_item_tags',
        columns: [
          { name: 'qaItemId', type: 'int' },
          { name: 'tagId', type: 'int' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'qa_item_tags',
      new TableIndex({ columnNames: ['qaItemId', 'tagId'], isUnique: true }),
    );

    await queryRunner.createForeignKeys('qa_item_tags', [
      new TableForeignKey({
        columnNames: ['qaItemId'],
        referencedTableName: 'qa_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['tagId'],
        referencedTableName: 'qa_tags',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    // Full-text index for search performance
    await queryRunner.query(
      `ALTER TABLE qa_item_translations ADD FULLTEXT INDEX IDX_QA_ITEM_TRANS_FULLTEXT (question, answer, keywords)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('qa_item_tags', true);
    await queryRunner.dropTable('qa_item_translations', true);
    await queryRunner.dropTable('qa_items', true);
    await queryRunner.dropTable('qa_tag_translations', true);
    await queryRunner.dropTable('qa_tags', true);
    await queryRunner.dropTable('qa_category_translations', true);
    await queryRunner.dropTable('qa_categories', true);
  }
}
