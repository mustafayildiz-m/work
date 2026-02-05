import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatTables1756673667925 implements MigrationInterface {
  name = 'CreateChatTables1756673667925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if tables already exist
    const messagesExists = await queryRunner.hasTable('messages');
    const conversationsExists = await queryRunner.hasTable('conversations');

    if (!messagesExists) {
      await queryRunner.query(
        `CREATE TABLE \`messages\` (\`id\` varchar(36) NOT NULL, \`content\` text NOT NULL, \`status\` enum ('sent', 'delivered', 'read') NOT NULL DEFAULT 'sent', \`senderId\` int NOT NULL, \`receiverId\` int NOT NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
      );
    }

    if (!conversationsExists) {
      await queryRunner.query(
        `CREATE TABLE \`conversations\` (\`id\` varchar(36) NOT NULL, \`participant1Id\` int NOT NULL, \`participant2Id\` int NOT NULL, \`lastMessageAt\` timestamp NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
      );
    }

    // Add foreign key constraints if tables were created
    if (!messagesExists) {
      await queryRunner.query(
        `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_2db9cf2b3ca111742793f6c37ce\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_acf951a58e3b9611dd96ce89042\` FOREIGN KEY (\`receiverId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    if (!conversationsExists) {
      await queryRunner.query(
        `ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_920822df89de614a7d3c239b259\` FOREIGN KEY (\`participant1Id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_faf08edf3ad07ff4a95e62b9969\` FOREIGN KEY (\`participant2Id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints first
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_faf08edf3ad07ff4a95e62b9969\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_920822df89de614a7d3c239b259\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_acf951a58e3b9611dd96ce89042\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_2db9cf2b3ca111742793f6c37ce\``,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE \`conversations\``);
    await queryRunner.query(`DROP TABLE \`messages\``);
  }
}
