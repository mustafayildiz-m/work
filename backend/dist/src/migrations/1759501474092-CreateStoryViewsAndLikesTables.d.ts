import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateStoryViewsAndLikesTables1759501474092 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
