import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddMissingColumnsToStockTransfers1762400000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
