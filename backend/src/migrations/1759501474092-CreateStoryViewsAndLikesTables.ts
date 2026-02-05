import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoryViewsAndLikesTables1759501474092
  implements MigrationInterface
{
  name = 'CreateStoryViewsAndLikesTables1759501474092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_711de461c8fcc1a9ff6864142dc\``,
    );
    await queryRunner.query(
      `CREATE TABLE \`story_views\` (\`id\` int NOT NULL AUTO_INCREMENT, \`story_id\` int NOT NULL, \`user_id\` int NOT NULL, \`viewed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3b8ffe2eee1959849d3dd21bc3\` (\`story_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`story_likes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`story_id\` int NOT NULL, \`user_id\` int NOT NULL, \`liked_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4c05956e2f1fe1a23339a255cc\` (\`story_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`author\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverImage\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverUrl\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`books\` DROP COLUMN \`publishDate\``,
    );
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`summary\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP COLUMN \`pdfUrl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` DROP COLUMN \`isActive\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD \`pdfUrl\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`coverUrl\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`coverImage\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`author\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`publishDate\` date NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`books\` ADD \`summary\` text NULL`);
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` CHANGE \`bookId\` \`bookId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_805a09bc0444e439b53dfc0b061\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` CHANGE \`languageId\` \`languageId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_711de461c8fcc1a9ff6864142dc\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_805a09bc0444e439b53dfc0b061\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` ADD CONSTRAINT \`FK_e30910f5c5e7cefc96f92d17331\` FOREIGN KEY (\`story_id\`) REFERENCES \`scholar_stories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` ADD CONSTRAINT \`FK_957569250010b2ec66127999d15\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_likes\` ADD CONSTRAINT \`FK_a68f51aa0d901bbc019c65572b3\` FOREIGN KEY (\`story_id\`) REFERENCES \`scholar_stories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_likes\` ADD CONSTRAINT \`FK_7743f7540a7b66554a614e181e4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`story_likes\` DROP FOREIGN KEY \`FK_7743f7540a7b66554a614e181e4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_likes\` DROP FOREIGN KEY \`FK_a68f51aa0d901bbc019c65572b3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` DROP FOREIGN KEY \`FK_957569250010b2ec66127999d15\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`story_views\` DROP FOREIGN KEY \`FK_e30910f5c5e7cefc96f92d17331\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_805a09bc0444e439b53dfc0b061\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_711de461c8fcc1a9ff6864142dc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` CHANGE \`languageId\` \`languageId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_805a09bc0444e439b53dfc0b061\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` CHANGE \`bookId\` \`bookId\` int NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`summary\``);
    await queryRunner.query(
      `ALTER TABLE \`books\` DROP COLUMN \`publishDate\``,
    );
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`author\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverImage\``);
    await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverUrl\``);
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP COLUMN \`pdfUrl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` DROP COLUMN \`isActive\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` ADD \`isActive\` tinyint NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`languages\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD \`pdfUrl\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`books\` ADD \`summary\` text NULL`);
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`publishDate\` date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`coverUrl\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`coverImage\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`books\` ADD \`author\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4c05956e2f1fe1a23339a255cc\` ON \`story_likes\``,
    );
    await queryRunner.query(`DROP TABLE \`story_likes\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_3b8ffe2eee1959849d3dd21bc3\` ON \`story_views\``,
    );
    await queryRunner.query(`DROP TABLE \`story_views\``);
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_711de461c8fcc1a9ff6864142dc\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
