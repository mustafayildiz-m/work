import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddSharedBookToUserPosts1760100000002 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
