"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissingColumnsToStockTransfers1762400000000 = void 0;
class AddMissingColumnsToStockTransfers1762400000000 {
    constructor() {
        this.name = 'AddMissingColumnsToStockTransfers1762400000000';
    }
    async up(queryRunner) {
        const table = await queryRunner.getTable('stock_transfers');
        if (!table?.findColumnByName('cargoCompany')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`cargoCompany\` varchar(255) NULL
            `);
        }
        if (!table?.findColumnByName('trackingNumber')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`trackingNumber\` varchar(255) NULL
            `);
        }
        if (!table?.findColumnByName('estimatedDeliveryDate')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`estimatedDeliveryDate\` date NULL
            `);
        }
        if (!table?.findColumnByName('cargoFee')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`cargoFee\` decimal(10,2) NULL
            `);
        }
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable('stock_transfers');
        if (table?.findColumnByName('cargoFee')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                DROP COLUMN \`cargoFee\`
            `);
        }
        if (table?.findColumnByName('estimatedDeliveryDate')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                DROP COLUMN \`estimatedDeliveryDate\`
            `);
        }
        if (table?.findColumnByName('trackingNumber')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                DROP COLUMN \`trackingNumber\`
            `);
        }
        if (table?.findColumnByName('cargoCompany')) {
            await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                DROP COLUMN \`cargoCompany\`
            `);
        }
    }
}
exports.AddMissingColumnsToStockTransfers1762400000000 = AddMissingColumnsToStockTransfers1762400000000;
//# sourceMappingURL=1762400000000-AddMissingColumnsToStockTransfers.js.map