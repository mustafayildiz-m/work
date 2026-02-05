import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteFields1759106279512 implements MigrationInterface {
  name = 'AddSoftDeleteFields1759106279512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Conversations tablosuna soft delete alanları ekle
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD \`deletedByParticipant1\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD \`deletedByParticipant2\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD \`deletedAtParticipant1\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD \`deletedAtParticipant2\` timestamp NULL`,
    );

    // Messages tablosuna soft delete alanları ekle
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`deletedBySender\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`deletedByReceiver\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`deletedAtSender\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`deletedAtReceiver\` timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Messages tablosundan soft delete alanlarını kaldır
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`deletedAtReceiver\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`deletedAtSender\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`deletedByReceiver\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`deletedBySender\``,
    );

    // Conversations tablosundan soft delete alanlarını kaldır
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP COLUMN \`deletedAtParticipant2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP COLUMN \`deletedAtParticipant1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP COLUMN \`deletedByParticipant2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP COLUMN \`deletedByParticipant1\``,
    );
  }
}
