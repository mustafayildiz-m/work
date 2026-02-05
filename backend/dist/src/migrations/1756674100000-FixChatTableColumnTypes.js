"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixChatTableColumnTypes1756674100000 = void 0;
class FixChatTableColumnTypes1756674100000 {
    constructor() {
        this.name = 'FixChatTableColumnTypes1756674100000';
    }
    async up(queryRunner) {
        const messagesExists = await queryRunner.hasTable('messages');
        if (messagesExists) {
            await queryRunner.query(`ALTER TABLE \`messages\` MODIFY \`senderId\` int NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`messages\` MODIFY \`receiverId\` int NOT NULL`);
        }
        const conversationsExists = await queryRunner.hasTable('conversations');
        if (conversationsExists) {
            await queryRunner.query(`ALTER TABLE \`conversations\` MODIFY \`participant1Id\` int NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`conversations\` MODIFY \`participant2Id\` int NOT NULL`);
        }
    }
    async down(queryRunner) {
        const messagesExists = await queryRunner.hasTable('messages');
        if (messagesExists) {
            await queryRunner.query(`ALTER TABLE \`messages\` MODIFY \`senderId\` varchar(36) NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`messages\` MODIFY \`receiverId\` varchar(36) NOT NULL`);
        }
        const conversationsExists = await queryRunner.hasTable('conversations');
        if (conversationsExists) {
            await queryRunner.query(`ALTER TABLE \`conversations\` MODIFY \`participant1Id\` varchar(36) NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`conversations\` MODIFY \`participant2Id\` varchar(36) NOT NULL`);
        }
    }
}
exports.FixChatTableColumnTypes1756674100000 = FixChatTableColumnTypes1756674100000;
//# sourceMappingURL=1756674100000-FixChatTableColumnTypes.js.map