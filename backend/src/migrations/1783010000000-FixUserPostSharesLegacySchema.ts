import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixUserPostSharesLegacySchema1783010000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_post_shares');
    if (!table) return;

    const postTypeColumn = table.findColumnByName('post_type');
    if (!postTypeColumn) {
      await queryRunner.addColumn(
        'user_post_shares',
        new TableColumn({
          name: 'post_type',
          type: 'varchar',
          length: '50',
          isNullable: false,
          default: "'user'",
        }),
      );
    }

    const postIdColumn = table.findColumnByName('post_id');
    if (postIdColumn && postIdColumn.type !== 'varchar') {
      await queryRunner.changeColumn(
        'user_post_shares',
        'post_id',
        new TableColumn({
          name: 'post_id',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
      );
    }

    const postIdForeignKey = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('post_id'),
    );
    if (postIdForeignKey) {
      await queryRunner.dropForeignKey('user_post_shares', postIdForeignKey);
    }

    const uniqueIndexNames = ['IDX_user_post_share_unique'];
    for (const indexName of uniqueIndexNames) {
      try {
        await queryRunner.query(
          `DROP INDEX \`${indexName}\` ON \`user_post_shares\``,
        );
      } catch (_) {
        // Index may not exist in some environments.
      }
    }

    // Legacy data cleanup:
    // 1) drop invalid rows with empty post_id
    // 2) de-duplicate rows by keeping the smallest id
    await queryRunner.query(
      "DELETE FROM `user_post_shares` WHERE `post_id` IS NULL OR TRIM(`post_id`) = ''",
    );
    await queryRunner.query(`
      DELETE ups1
      FROM user_post_shares ups1
      INNER JOIN user_post_shares ups2
        ON ups1.user_id = ups2.user_id
       AND ups1.post_id = ups2.post_id
       AND ups1.post_type = ups2.post_type
       AND ups1.id > ups2.id
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_user_post_share_unique` ON `user_post_shares` (`user_id`, `post_id`, `post_type`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        'DROP INDEX `IDX_user_post_share_unique` ON `user_post_shares`',
      );
    } catch (_) {
      // Ignore if missing.
    }

    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_user_post_share_unique` ON `user_post_shares` (`user_id`, `post_id`)',
    );
  }
}
