import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusToUserFollows1780000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user_follows',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['pending', 'accepted'],
        default: "'pending'",
      }),
    );
    
    // Mevcut tüm takip kayıtlarını 'accepted' yapalım ki sistem bozulmasın
    await queryRunner.query(`UPDATE user_follows SET status = 'accepted'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_follows', 'status');
  }
}
