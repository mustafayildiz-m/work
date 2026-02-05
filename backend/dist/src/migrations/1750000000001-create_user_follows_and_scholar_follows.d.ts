import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateUserFollowsAndScholarFollows1750000000001 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
