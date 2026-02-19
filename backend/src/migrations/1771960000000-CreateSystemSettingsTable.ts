import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSystemSettingsTable1771960000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'system_settings',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'key',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'value',
                        type: 'text',
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true,
        );

        // Initial setting for post approval
        await queryRunner.query(
            "INSERT INTO system_settings (`key`, `value`, `description`) VALUES ('post_approval_enabled', 'true', 'Kullanıcı postlarının admin onayına düşüp düşmeyeceğini belirler.')",
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('system_settings');
    }
}
