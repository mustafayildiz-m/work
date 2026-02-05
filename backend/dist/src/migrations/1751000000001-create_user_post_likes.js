"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserPostLikesTable1751000000001 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserPostLikesTable1751000000001 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "user_post_likes",
            columns: [
                { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "user_id", type: "int" },
                { name: "post_id", type: "int" },
                { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" }
            ],
            foreignKeys: [
                { columnNames: ["user_id"], referencedTableName: "users", referencedColumnNames: ["id"] },
                { columnNames: ["post_id"], referencedTableName: "user_posts", referencedColumnNames: ["id"] }
            ]
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("user_post_likes");
    }
}
exports.CreateUserPostLikesTable1751000000001 = CreateUserPostLikesTable1751000000001;
//# sourceMappingURL=1751000000001-create_user_post_likes.js.map