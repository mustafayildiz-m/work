"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSharedProfileToUserPosts1760100000000 = void 0;
const typeorm_1 = require("typeorm");
class AddSharedProfileToUserPosts1760100000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('user_posts', new typeorm_1.TableColumn({
            name: 'shared_profile_type',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.addColumn('user_posts', new typeorm_1.TableColumn({
            name: 'shared_profile_id',
            type: 'int',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('user_posts', 'shared_profile_id');
        await queryRunner.dropColumn('user_posts', 'shared_profile_type');
    }
}
exports.AddSharedProfileToUserPosts1760100000000 = AddSharedProfileToUserPosts1760100000000;
//# sourceMappingURL=1760100000000-AddSharedProfileToUserPosts.js.map