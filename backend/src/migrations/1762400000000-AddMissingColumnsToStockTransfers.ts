import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumnsToStockTransfers1762400000000
  implements MigrationInterface
{
  name = 'AddMissingColumnsToStockTransfers1762400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Önce kolonların var olup olmadığını kontrol et
    const table = await queryRunner.getTable('stock_transfers');

    // cargoCompany kolonunu ekle (yoksa)
    if (!table?.findColumnByName('cargoCompany')) {
      await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`cargoCompany\` varchar(255) NULL
            `);
    }

    // trackingNumber kolonunu ekle (yoksa)
    if (!table?.findColumnByName('trackingNumber')) {
      await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`trackingNumber\` varchar(255) NULL
            `);
    }

    // estimatedDeliveryDate kolonunu ekle (yoksa)
    if (!table?.findColumnByName('estimatedDeliveryDate')) {
      await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`estimatedDeliveryDate\` date NULL
            `);
    }

    // cargoFee kolonunu ekle (yoksa)
    if (!table?.findColumnByName('cargoFee')) {
      await queryRunner.query(`
                ALTER TABLE \`stock_transfers\` 
                ADD COLUMN \`cargoFee\` decimal(10,2) NULL
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Kolonları geri al (varsa)
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
