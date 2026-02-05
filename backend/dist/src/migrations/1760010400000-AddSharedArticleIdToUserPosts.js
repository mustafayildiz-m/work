"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSharedArticleIdToUserPosts1760010400000 = void 0;
const typeorm_1 = require("typeorm");
class AddSharedArticleIdToUserPosts1760010400000 {
    async up(queryRunner) {
        const table = await queryRunner.getTable('user_posts');
        const hasColumn = table?.findColumnByName('shared_article_id');
        if (!hasColumn) {
            await queryRunner.addColumn('user_posts', new typeorm_1.TableColumn({
                name: 'shared_article_id',
                type: 'int',
                isNullable: true,
            }));
        }
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('user_posts', 'shared_article_id');
    }
}
exports.AddSharedArticleIdToUserPosts1760010400000 = AddSharedArticleIdToUserPosts1760010400000;
//# sourceMappingURL=1760010400000-AddSharedArticleIdToUserPosts.js.map