import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSharedNewsletterIdToUserPosts1760400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_posts');
    const hasColumn = table?.findColumnByName('shared_newsletter_id');

    if (!hasColumn) {
      await queryRunner.addColumn(
        'user_posts',
        new TableColumn({
          name: 'shared_newsletter_id',
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_posts', 'shared_newsletter_id');
  }
}
