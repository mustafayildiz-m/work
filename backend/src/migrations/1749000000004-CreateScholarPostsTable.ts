import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScholarPostsTable1749000000004
  implements MigrationInterface
{
  name = 'CreateScholarPostsTable1749000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`scholar_posts\` (
                \`id\` varchar(36) NOT NULL,
                \`content\` text NULL,
                \`mediaUrls\` text NULL,
                \`fileUrls\` text NULL,
                \`scholarId\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_scholar_posts_scholar\` FOREIGN KEY (\`scholarId\`) REFERENCES \`scholars\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`scholar_posts\``);
  }
}
