"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStocksTable1749000000002 = void 0;
class CreateStocksTable1749000000002 {
    constructor() {
        this.name = 'CreateStocksTable1749000000002';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`stocks\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`book_id\` int NULL,
                \`language_id\` int NULL,
                \`quantity\` int NOT NULL,
                \`unitPrice\` decimal(10,2) NOT NULL,
                \`warehouse_id\` int NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_books_stocks\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_languages_stocks\` FOREIGN KEY (\`language_id\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_warehouses_stocks\` FOREIGN KEY (\`warehouse_id\`) REFERENCES \`warehouses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`stocks\``);
    }
}
exports.CreateStocksTable1749000000002 = CreateStocksTable1749000000002;
//# sourceMappingURL=1749000000002-CreateStocksTable.js.map