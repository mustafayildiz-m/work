"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeTitleNullableInUserPosts1760100000001 = void 0;
class MakeTitleNullableInUserPosts1760100000001 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE user_posts MODIFY COLUMN title VARCHAR(255) NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE user_posts MODIFY COLUMN title VARCHAR(255) NOT NULL`);
    }
}
exports.MakeTitleNullableInUserPosts1760100000001 = MakeTitleNullableInUserPosts1760100000001;
//# sourceMappingURL=1760100000001-MakeTitleNullableInUserPosts.js.map