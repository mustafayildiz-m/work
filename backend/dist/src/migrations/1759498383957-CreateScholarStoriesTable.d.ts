import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateScholarStoriesTable1759498383957 implements MigrationInterface {
    name: string;
    private safeDropColumn;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
