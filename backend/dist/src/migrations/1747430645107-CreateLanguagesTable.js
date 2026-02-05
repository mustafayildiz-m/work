"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLanguagesTable1747430645107 = void 0;
class CreateLanguagesTable1747430645107 {
    constructor() {
        this.name = 'CreateLanguagesTable1747430645107';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`languages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(10) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_languages_code\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_languages_code\` ON \`languages\``);
        await queryRunner.query(`DROP TABLE \`languages\``);
    }
}
exports.CreateLanguagesTable1747430645107 = CreateLanguagesTable1747430645107;
//# sourceMappingURL=1747430645107-CreateLanguagesTable.js.map