import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddCoverImageToScholars1749000000011 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
