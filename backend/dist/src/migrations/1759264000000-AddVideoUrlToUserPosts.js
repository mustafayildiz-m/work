"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddVideoUrlToUserPosts1759264000000 = void 0;
const typeorm_1 = require("typeorm");
class AddVideoUrlToUserPosts1759264000000 {
    async up(queryRunner) {
        const table = await queryRunner.getTable('user_posts');
        const videoUrlColumn = table?.findColumnByName('video_url');
        if (!videoUrlColumn) {
            await queryRunner.addColumn('user_posts', new typeorm_1.TableColumn({
                name: 'video_url',
                type: 'varchar',
                length: '255',
                isNullable: true,
            }));
        }
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('user_posts', 'video_url');
    }
}
exports.AddVideoUrlToUserPosts1759264000000 = AddVideoUrlToUserPosts1759264000000;
//# sourceMappingURL=1759264000000-AddVideoUrlToUserPosts.js.map