import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateChatTables1756673667925 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
