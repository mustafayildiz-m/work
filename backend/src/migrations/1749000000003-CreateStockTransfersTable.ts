import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockTransfersTable1749000000003
  implements MigrationInterface
{
  name = 'CreateStockTransfersTable1749000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`stock_transfers\``);
  }
}
