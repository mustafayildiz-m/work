import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorScholarPostsWithTranslations1759538265000
  implements MigrationInterface
{
  name = 'RefactorScholarPostsWithTranslations1759538265000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tablo zaten varsa migration'ı atla
    const tableExists = await queryRunner.hasTable('scholar_post_translations');
    if (tableExists) {
      console.log(
        '✅ scholar_post_translations tablosu zaten mevcut, migration atlanıyor.',
      );
      return;
    }

    // Mevcut verileri yedekle ve yeni yapıya taşı
    await queryRunner.query(`
            CREATE TABLE \`scholar_posts_backup\` AS SELECT * FROM \`scholar_posts\`
        `);

    // Yeni translations tablosunu oluştur
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`scholar_post_translations\` (
                \`id\` varchar(36) NOT NULL,
                \`postId\` varchar(36) NOT NULL,
                \`language\` varchar(5) NOT NULL,
                \`content\` text NULL,
                \`mediaUrls\` text NULL,
                \`fileUrls\` text NULL,
                \`status\` enum('draft', 'pending', 'approved') NULL,
                \`translatedBy\` int NULL,
                \`approvedBy\` int NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`unique_post_lang\` (\`postId\`, \`language\`),
                CONSTRAINT \`FK_scholar_post_translations_post\` FOREIGN KEY (\`postId\`) REFERENCES \`scholar_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);

    // Mevcut scholar_posts verilerini translations tablosuna taşı (Türkçe olarak)
    await queryRunner.query(`
            INSERT INTO \`scholar_post_translations\` 
            (\`id\`, \`postId\`, \`language\`, \`content\`, \`mediaUrls\`, \`fileUrls\`, \`status\`, \`createdAt\`, \`updatedAt\`)
            SELECT 
                UUID() as id,
                \`id\` as postId,
                'tr' as language,
                \`content\`,
                \`mediaUrls\`,
                \`fileUrls\`,
                'approved' as status,
                \`createdAt\`,
                \`updatedAt\`
            FROM \`scholar_posts_backup\`
            WHERE \`content\` IS NOT NULL OR \`mediaUrls\` IS NOT NULL OR \`fileUrls\` IS NOT NULL
        `);

    // scholar_posts tablosundan content, mediaUrls, fileUrls kolonlarını kaldır
    await queryRunner.query(`
            ALTER TABLE \`scholar_posts\` 
            DROP COLUMN \`content\`,
            DROP COLUMN \`mediaUrls\`,
            DROP COLUMN \`fileUrls\`
        `);

    // Yedek tabloyu sil
    await queryRunner.query(`DROP TABLE \`scholar_posts_backup\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Geri alma: content, mediaUrls, fileUrls kolonlarını geri ekle
    await queryRunner.query(`
            ALTER TABLE \`scholar_posts\` 
            ADD COLUMN \`content\` text NULL,
            ADD COLUMN \`mediaUrls\` text NULL,
            ADD COLUMN \`fileUrls\` text NULL
        `);

    // Türkçe çevirileri geri taşı
    await queryRunner.query(`
            UPDATE \`scholar_posts\` sp
            INNER JOIN \`scholar_post_translations\` spt ON sp.id = spt.postId
            SET 
                sp.content = spt.content,
                sp.mediaUrls = spt.mediaUrls,
                sp.fileUrls = spt.fileUrls
            WHERE spt.language = 'tr'
        `);

    // Translations tablosunu sil
    await queryRunner.query(`DROP TABLE \`scholar_post_translations\``);
  }
}
