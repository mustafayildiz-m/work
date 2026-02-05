import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class MakeTitleNullableInUserPosts1760100000001 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
