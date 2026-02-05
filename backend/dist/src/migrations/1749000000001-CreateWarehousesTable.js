"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWarehousesTable1749000000001 = void 0;
class CreateWarehousesTable1749000000001 {
    constructor() {
        this.name = 'CreateWarehousesTable1749000000001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`warehouses\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`location\` varchar(255) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`warehouses\``);
    }
}
exports.CreateWarehousesTable1749000000001 = CreateWarehousesTable1749000000001;
//# sourceMappingURL=1749000000001-CreateWarehousesTable.js.map