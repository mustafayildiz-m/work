"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateScholarPostsTable1749000000004 = void 0;
class CreateScholarPostsTable1749000000004 {
    constructor() {
        this.name = 'CreateScholarPostsTable1749000000004';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`scholar_posts\``);
    }
}
exports.CreateScholarPostsTable1749000000004 = CreateScholarPostsTable1749000000004;
//# sourceMappingURL=1749000000004-CreateScholarPostsTable.js.map