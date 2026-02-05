"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserPostsAndComments1750000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserPostsAndComments1750000000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "user_posts",
            columns: [
                { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "user_id", type: "int" },
                { name: "title", type: "varchar", length: "255" },
                { name: "content", type: "text" },
                { name: "image_url", type: "varchar", length: "255", isNullable: true },
                { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" },
                { name: "updated_at", type: "datetime", default: "CURRENT_TIMESTAMP" }
            ],
            foreignKeys: [
                { columnNames: ["user_id"], referencedTableName: "users", referencedColumnNames: ["id"] }
            ]
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: "user_post_comments",
            columns: [
                { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "post_id", type: "int" },
                { name: "user_id", type: "int" },
                { name: "content", type: "text" },
                { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" }
            ],
            foreignKeys: [
                { columnNames: ["post_id"], referencedTableName: "user_posts", referencedColumnNames: ["id"] },
                { columnNames: ["user_id"], referencedTableName: "users", referencedColumnNames: ["id"] }
            ]
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("user_post_comments");
        await queryRunner.dropTable("user_posts");
    }
}
exports.CreateUserPostsAndComments1750000000000 = CreateUserPostsAndComments1750000000000;
//# sourceMappingURL=1750000000000-create_user_posts_and_comments.js.map