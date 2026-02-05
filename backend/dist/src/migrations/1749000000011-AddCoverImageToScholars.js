"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCoverImageToScholars1749000000011 = void 0;
class AddCoverImageToScholars1749000000011 {
    constructor() {
        this.name = 'AddCoverImageToScholars1749000000011';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`scholars\` ADD COLUMN \`coverImage\` varchar(255) NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`scholars\` DROP COLUMN \`coverImage\``);
    }
}
exports.AddCoverImageToScholars1749000000011 = AddCoverImageToScholars1749000000011;
//# sourceMappingURL=1749000000011-AddCoverImageToScholars.js.map