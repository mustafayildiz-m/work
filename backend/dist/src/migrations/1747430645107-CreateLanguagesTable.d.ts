import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateLanguagesTable1747430645107 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
