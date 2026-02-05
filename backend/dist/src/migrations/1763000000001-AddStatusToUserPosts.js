"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStatusToUserPosts1763000000001 = void 0;
class AddStatusToUserPosts1763000000001 {
    constructor() {
        this.name = 'AddStatusToUserPosts1763000000001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE \`user_posts\` 
      ADD COLUMN \`status\` enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'
    `);
        await queryRunner.query(`
      ALTER TABLE \`user_posts\` 
      ADD COLUMN \`approved_by\` int NULL
    `);
        await queryRunner.query(`
      UPDATE \`user_posts\` 
      SET \`status\` = 'approved' 
      WHERE \`status\` = 'pending'
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user_posts\` DROP COLUMN \`approved_by\``);
        await queryRunner.query(`ALTER TABLE \`user_posts\` DROP COLUMN \`status\``);
    }
}
exports.AddStatusToUserPosts1763000000001 = AddStatusToUserPosts1763000000001;
//# sourceMappingURL=1763000000001-AddStatusToUserPosts.js.map