import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixChatTableColumnTypes1756674100000
  implements MigrationInterface
{
  name = 'FixChatTableColumnTypes1756674100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if messages table exists and has string columns
    const messagesExists = await queryRunner.hasTable('messages');
    if (messagesExists) {
      // Change senderId and receiverId from varchar to int
      await queryRunner.query(
        `ALTER TABLE \`messages\` MODIFY \`senderId\` int NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE \`messages\` MODIFY \`receiverId\` int NOT NULL`,
      );
    }

    // Check if conversations table exists and has string columns
    const conversationsExists = await queryRunner.hasTable('conversations');
    if (conversationsExists) {
      // Change participant1Id and participant2Id from varchar to int
      await queryRunner.query(
        `ALTER TABLE \`conversations\` MODIFY \`participant1Id\` int NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE \`conversations\` MODIFY \`participant2Id\` int NOT NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const messagesExists = await queryRunner.hasTable('messages');
    if (messagesExists) {
      await queryRunner.query(
        `ALTER TABLE \`messages\` MODIFY \`senderId\` varchar(36) NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE \`messages\` MODIFY \`receiverId\` varchar(36) NOT NULL`,
      );
    }

    const conversationsExists = await queryRunner.hasTable('conversations');
    if (conversationsExists) {
      await queryRunner.query(
        `ALTER TABLE \`conversations\` MODIFY \`participant1Id\` varchar(36) NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE \`conversations\` MODIFY \`participant2Id\` varchar(36) NOT NULL`,
      );
    }
  }
}
