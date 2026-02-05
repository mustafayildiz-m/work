import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class FixScholarCascadeDelete1746965300000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
