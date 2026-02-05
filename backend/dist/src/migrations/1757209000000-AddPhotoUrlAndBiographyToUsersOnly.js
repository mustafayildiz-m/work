"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPhotoUrlAndBiographyToUsersOnly1757209000000 = void 0;
class AddPhotoUrlAndBiographyToUsersOnly1757209000000 {
    constructor() {
        this.name = 'AddPhotoUrlAndBiographyToUsersOnly1757209000000';
    }
    async up(queryRunner) {
        const photoUrlExists = await queryRunner.hasColumn('users', 'photoUrl');
        if (!photoUrlExists) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`photoUrl\` varchar(255) NULL`);
        }
        const biographyExists = await queryRunner.hasColumn('users', 'biography');
        if (!biographyExists) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`biography\` varchar(255) NULL`);
        }
    }
    async down(queryRunner) {
        const photoUrlExists = await queryRunner.hasColumn('users', 'photoUrl');
        if (photoUrlExists) {
            await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`photoUrl\``);
        }
        const biographyExists = await queryRunner.hasColumn('users', 'biography');
        if (biographyExists) {
            await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`biography\``);
        }
    }
}
exports.AddPhotoUrlAndBiographyToUsersOnly1757209000000 = AddPhotoUrlAndBiographyToUsersOnly1757209000000;
//# sourceMappingURL=1757209000000-AddPhotoUrlAndBiographyToUsersOnly.js.map