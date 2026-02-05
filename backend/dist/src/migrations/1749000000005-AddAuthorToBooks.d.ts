import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddAuthorToBooks1749000000005 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
