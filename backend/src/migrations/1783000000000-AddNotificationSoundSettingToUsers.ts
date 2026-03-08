import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNotificationSoundSettingToUsers1783000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'notificationSoundEnabled',
        type: 'tinyint',
        width: 1,
        isNullable: false,
        default: 1,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'notificationSoundEnabled');
  }
}
