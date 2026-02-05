"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserPostSharesTable1751000000003 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserPostSharesTable1751000000003 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "user_post_shares",
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
        await queryRunner.dropTable("user_post_shares");
    }
}
exports.CreateUserPostSharesTable1751000000003 = CreateUserPostSharesTable1751000000003;
//# sourceMappingURL=1751000000003-create_user_post_shares.js.map