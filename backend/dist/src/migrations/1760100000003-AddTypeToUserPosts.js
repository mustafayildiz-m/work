"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTypeToUserPosts1760100000003 = void 0;
class AddTypeToUserPosts1760100000003 {
    constructor() {
        this.name = 'AddTypeToUserPosts1760100000003';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user_posts\` 
            ADD COLUMN \`type\` varchar(255) NULL
        `);
        await queryRunner.query(`
            UPDATE \`user_posts\` 
            SET \`type\` = 'user' 
            WHERE \`type\` IS NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_user_posts_type\` ON \`user_posts\` (\`type\`)
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_user_posts_type\` ON \`user_posts\``);
        await queryRunner.query(`ALTER TABLE \`user_posts\` DROP COLUMN \`type\``);
    }
}
exports.AddTypeToUserPosts1760100000003 = AddTypeToUserPosts1760100000003;
//# sourceMappingURL=1760100000003-AddTypeToUserPosts.js.map