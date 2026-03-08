import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateNotificationsTable1780000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "notifications",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "user_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "title",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "message",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "is_read",
                        type: "tinyint",
                        default: 0,
                    },
                    {
                        name: "related_user_id",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        precision: 6,
                        default: "current_timestamp(6)",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        precision: 6,
                        default: "current_timestamp(6)",
                        onUpdate: "current_timestamp(6)",
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            "notifications",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "notifications",
            new TableForeignKey({
                columnNames: ["related_user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("notifications");
        if (table) {
            const foreignKey1 = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("user_id") !== -1
            );
            const foreignKey2 = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("related_user_id") !== -1
            );
            if (foreignKey1) await queryRunner.dropForeignKey("notifications", foreignKey1);
            if (foreignKey2) await queryRunner.dropForeignKey("notifications", foreignKey2);
        }
        await queryRunner.dropTable("notifications");
    }
}
