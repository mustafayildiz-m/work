"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProfileFieldsToUsers1762300000000 = void 0;
class AddProfileFieldsToUsers1762300000000 {
    constructor() {
        this.name = 'AddProfileFieldsToUsers1762300000000';
    }
    async up(queryRunner) {
        const phoneNoExists = await queryRunner.hasColumn('users', 'phoneNo');
        if (!phoneNoExists) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`phoneNo\` varchar(50) NULL`);
        }
        const locationExists = await queryRunner.hasColumn('users', 'location');
        if (!locationExists) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`location\` varchar(255) NULL`);
        }
        const birthDateExists = await queryRunner.hasColumn('users', 'birthDate');
        if (!birthDateExists) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`birthDate\` date NULL`);
        }
    }
    async down(queryRunner) {
        const phoneNoExists = await queryRunner.hasColumn('users', 'phoneNo');
        if (phoneNoExists) {
            await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phoneNo\``);
        }
        const locationExists = await queryRunner.hasColumn('users', 'location');
        if (locationExists) {
            await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`location\``);
        }
        const birthDateExists = await queryRunner.hasColumn('users', 'birthDate');
        if (birthDateExists) {
            await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`birthDate\``);
        }
    }
}
exports.AddProfileFieldsToUsers1762300000000 = AddProfileFieldsToUsers1762300000000;
//# sourceMappingURL=1762300000000-AddProfileFieldsToUsers.js.map