"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSharedBookToUserPosts1760100000002 = void 0;
class AddSharedBookToUserPosts1760100000002 {
    constructor() {
        this.name = 'AddSharedBookToUserPosts1760100000002';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user_posts\` 
            ADD COLUMN \`shared_book_id\` int NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_shared_book_id\` ON \`user_posts\` (\`shared_book_id\`)
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_shared_book_id\` ON \`user_posts\``);
        await queryRunner.query(`ALTER TABLE \`user_posts\` DROP COLUMN \`shared_book_id\``);
    }
}
exports.AddSharedBookToUserPosts1760100000002 = AddSharedBookToUserPosts1760100000002;
//# sourceMappingURL=1760100000002-AddSharedBookToUserPosts.js.map