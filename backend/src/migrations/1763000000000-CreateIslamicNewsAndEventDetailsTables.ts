import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateIslamicNewsAndEventDetailsTables1763000000000
  implements MigrationInterface
{
  name = 'CreateIslamicNewsAndEventDetailsTables1763000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if islamic_news table exists
    const islamicNewsExists = await queryRunner.hasTable('islamic_news');
    if (!islamicNewsExists) {
      await queryRunner.createTable(
        new Table({
          name: 'islamic_news',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'title',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'content',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'link',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'image_url',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'source_id',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'source_name',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'source_url',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'language',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'country',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'category',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'keywords',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'pub_date',
              type: 'datetime',
              isNullable: true,
            },
            {
              name: 'video_url',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'is_archived',
              type: 'boolean',
              default: false,
            },
            {
              name: 'archive_date',
              type: 'datetime',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'datetime',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            },
            {
              name: 'updated_at',
              type: 'datetime',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
              onUpdate: 'CURRENT_TIMESTAMP(6)',
            },
          ],
        }),
        true,
      );
    }

    // Check if event_details table exists
    const eventDetailsExists = await queryRunner.hasTable('event_details');
    if (!eventDetailsExists) {
      await queryRunner.createTable(
        new Table({
          name: 'event_details',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'user_id',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'scholar_id',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'title',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'description',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'date',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'time',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'duration',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'location',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'guests',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'attachment',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'datetime',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            },
            {
              name: 'updated_at',
              type: 'datetime',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
              onUpdate: 'CURRENT_TIMESTAMP(6)',
            },
          ],
        }),
        true,
      );

      // Add foreign keys if users and scholars tables exist
      try {
        const usersTable = await queryRunner.getTable('users');
        const scholarsTable = await queryRunner.getTable('scholars');

        if (usersTable) {
          await queryRunner.createForeignKey(
            'event_details',
            new TableForeignKey({
              columnNames: ['user_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'users',
              onDelete: 'CASCADE',
            }),
          );
        }

        if (scholarsTable) {
          await queryRunner.createForeignKey(
            'event_details',
            new TableForeignKey({
              columnNames: ['scholar_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'scholars',
              onDelete: 'CASCADE',
            }),
          );
        }
      } catch (error) {
        console.log('Foreign keys could not be created, continuing...');
      }
    }

    // Ensure book_languages table exists with correct structure
    const bookLanguagesExists = await queryRunner.hasTable('book_languages');
    if (!bookLanguagesExists) {
      await queryRunner.createTable(
        new Table({
          name: 'book_languages',
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
              isNullable: false,
            },
            {
              name: 'languageId',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'pdfUrl',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
          ],
        }),
        true,
      );

      // Add foreign keys
      try {
        const booksTable = await queryRunner.getTable('books');
        const languagesTable = await queryRunner.getTable('languages');

        if (booksTable) {
          await queryRunner.createForeignKey(
            'book_languages',
            new TableForeignKey({
              columnNames: ['bookId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'books',
              onDelete: 'CASCADE',
            }),
          );
        }

        if (languagesTable) {
          await queryRunner.createForeignKey(
            'book_languages',
            new TableForeignKey({
              columnNames: ['languageId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'languages',
            }),
          );
        }
      } catch (error) {
        console.log(
          'Foreign keys for book_languages could not be created, continuing...',
        );
      }
    } else {
      // Table exists, check if it has the correct columns
      const table = await queryRunner.getTable('book_languages');
      if (table) {
        // Add languageId column if it doesn't exist
        if (!table.findColumnByName('languageId')) {
          try {
            await queryRunner.query(
              `ALTER TABLE \`book_languages\` ADD COLUMN \`languageId\` int NOT NULL`,
            );
            const languagesTable = await queryRunner.getTable('languages');
            if (languagesTable) {
              await queryRunner.createForeignKey(
                'book_languages',
                new TableForeignKey({
                  columnNames: ['languageId'],
                  referencedColumnNames: ['id'],
                  referencedTableName: 'languages',
                }),
              );
            }
          } catch (error) {
            console.log('Could not add languageId column to book_languages');
          }
        }

        // Add pdfUrl column if it doesn't exist
        if (!table.findColumnByName('pdfUrl')) {
          try {
            await queryRunner.query(
              `ALTER TABLE \`book_languages\` ADD COLUMN \`pdfUrl\` varchar(255) NULL`,
            );
          } catch (error) {
            console.log('Could not add pdfUrl column to book_languages');
          }
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    try {
      const eventDetailsTable = await queryRunner.getTable('event_details');
      if (eventDetailsTable) {
        const foreignKeys = eventDetailsTable.foreignKeys;
        for (const fk of foreignKeys) {
          await queryRunner.dropForeignKey('event_details', fk);
        }
      }
    } catch (error) {
      console.log('Could not drop foreign keys from event_details');
    }

    try {
      const bookLanguagesTable = await queryRunner.getTable('book_languages');
      if (bookLanguagesTable) {
        const foreignKeys = bookLanguagesTable.foreignKeys;
        for (const fk of foreignKeys) {
          await queryRunner.dropForeignKey('book_languages', fk);
        }
      }
    } catch (error) {
      console.log('Could not drop foreign keys from book_languages');
    }

    // Drop tables
    await queryRunner.dropTable('event_details', true);
    await queryRunner.dropTable('islamic_news', true);
    // Note: book_languages might be dropped by other migrations, so we don't drop it here
  }
}
