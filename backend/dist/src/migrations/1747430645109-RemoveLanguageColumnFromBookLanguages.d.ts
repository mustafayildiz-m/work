import { MigrationInterface, QueryRunner } from "typeorm";
export declare class RemoveLanguageColumnFromBookLanguages1747430645109 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
