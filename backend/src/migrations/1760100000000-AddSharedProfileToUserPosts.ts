import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSharedProfileToUserPosts1760100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add shared_profile_type column
    await queryRunner.addColumn(
      'user_posts',
      new TableColumn({
        name: 'shared_profile_type',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add shared_profile_id column
    await queryRunner.addColumn(
      'user_posts',
      new TableColumn({
        name: 'shared_profile_id',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_posts', 'shared_profile_id');
    await queryRunner.dropColumn('user_posts', 'shared_profile_type');
  }
}
