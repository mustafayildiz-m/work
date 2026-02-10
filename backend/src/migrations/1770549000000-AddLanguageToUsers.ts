import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddLanguageToUsers1770549000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("users", new TableColumn({
            name: "language",
            type: "varchar",
            length: "10",
            isNullable: true,
            default: "'tr'"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "language");
    }

}
