import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddLocationFieldsToScholars1747436000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
