import { MigrationInterface, QueryRunner } from "typeorm";
export declare class ChangeScholarDatesToText1747437000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
