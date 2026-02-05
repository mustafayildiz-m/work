"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStockTransfersTable1749000000003 = void 0;
class CreateStockTransfersTable1749000000003 {
    constructor() {
        this.name = 'CreateStockTransfersTable1749000000003';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`stock_transfers\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`stockId\` int NULL,
                \`fromWarehouseId\` int NULL,
                \`toWarehouseId\` int NULL,
                \`quantity\` int NOT NULL,
                \`status\` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
                \`notes\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_stock_transfer_stock\` FOREIGN KEY (\`stockId\`) REFERENCES \`stocks\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT \`FK_stock_transfer_from_warehouse\` FOREIGN KEY (\`fromWarehouseId\`) REFERENCES \`warehouses\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT \`FK_stock_transfer_to_warehouse\` FOREIGN KEY (\`toWarehouseId\`) REFERENCES \`warehouses\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`stock_transfers\``);
    }
}
exports.CreateStockTransfersTable1749000000003 = CreateStockTransfersTable1749000000003;
//# sourceMappingURL=1749000000003-CreateStockTransfersTable.js.map