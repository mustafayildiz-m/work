import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddMissingTablesAndColumns1746965102865 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
