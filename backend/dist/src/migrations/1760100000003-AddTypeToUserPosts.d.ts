import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddTypeToUserPosts1760100000003 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
