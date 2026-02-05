import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddSharedProfileToUserPosts1760100000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
