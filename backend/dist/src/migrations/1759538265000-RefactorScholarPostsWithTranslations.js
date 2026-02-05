"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefactorScholarPostsWithTranslations1759538265000 = void 0;
class RefactorScholarPostsWithTranslations1759538265000 {
    constructor() {
        this.name = 'RefactorScholarPostsWithTranslations1759538265000';
    }
    async up(queryRunner) {
        const tableExists = await queryRunner.hasTable('scholar_post_translations');
        if (tableExists) {
            console.log('✅ scholar_post_translations tablosu zaten mevcut, migration atlanıyor.');
            return;
        }
        await queryRunner.query(`
            CREATE TABLE \`scholar_posts_backup\` AS SELECT * FROM \`scholar_posts\`
        `);
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
        await queryRunner.query(`
            ALTER TABLE \`scholar_posts\` 
            DROP COLUMN \`content\`,
            DROP COLUMN \`mediaUrls\`,
            DROP COLUMN \`fileUrls\`
        `);
        await queryRunner.query(`DROP TABLE \`scholar_posts_backup\``);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`scholar_posts\` 
            ADD COLUMN \`content\` text NULL,
            ADD COLUMN \`mediaUrls\` text NULL,
            ADD COLUMN \`fileUrls\` text NULL
        `);
        await queryRunner.query(`
            UPDATE \`scholar_posts\` sp
            INNER JOIN \`scholar_post_translations\` spt ON sp.id = spt.postId
            SET 
                sp.content = spt.content,
                sp.mediaUrls = spt.mediaUrls,
                sp.fileUrls = spt.fileUrls
            WHERE spt.language = 'tr'
        `);
        await queryRunner.query(`DROP TABLE \`scholar_post_translations\``);
    }
}
exports.RefactorScholarPostsWithTranslations1759538265000 = RefactorScholarPostsWithTranslations1759538265000;
//# sourceMappingURL=1759538265000-RefactorScholarPostsWithTranslations.js.map