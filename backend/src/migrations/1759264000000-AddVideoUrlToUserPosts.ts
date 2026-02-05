import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVideoUrlToUserPosts1759264000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if video_url column already exists
    const table = await queryRunner.getTable('user_posts');
    const videoUrlColumn = table?.findColumnByName('video_url');

    if (!videoUrlColumn) {
      await queryRunner.addColumn(
        'user_posts',
        new TableColumn({
          name: 'video_url',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_posts', 'video_url');
  }
}
