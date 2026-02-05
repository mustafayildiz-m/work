import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddSoftDeleteFields1759106279512 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
