import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class MakeTranslationFieldsNullable1759538266000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
