import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddLanguageIdToBookLanguages1747430645108 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
