"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSoftDeleteFields1759106279512 = void 0;
class AddSoftDeleteFields1759106279512 {
    constructor() {
        this.name = 'AddSoftDeleteFields1759106279512';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD \`deletedByParticipant1\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD \`deletedByParticipant2\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD \`deletedAtParticipant1\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD \`deletedAtParticipant2\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD \`deletedBySender\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD \`deletedByReceiver\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD \`deletedAtSender\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD \`deletedAtReceiver\` timestamp NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`deletedAtReceiver\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`deletedAtSender\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`deletedByReceiver\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`deletedBySender\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP COLUMN \`deletedAtParticipant2\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP COLUMN \`deletedAtParticipant1\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP COLUMN \`deletedByParticipant2\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP COLUMN \`deletedByParticipant1\``);
    }
}
exports.AddSoftDeleteFields1759106279512 = AddSoftDeleteFields1759106279512;
//# sourceMappingURL=1759106279512-AddSoftDeleteFields.js.map