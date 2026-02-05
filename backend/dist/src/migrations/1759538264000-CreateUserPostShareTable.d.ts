import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateUserPostShareTable1759538264000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
