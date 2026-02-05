"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserPostShareTable1759538264000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserPostShareTable1759538264000 {
    constructor() {
        this.name = 'CreateUserPostShareTable1759538264000';
    }
    async up(queryRunner) {
        const tableExists = await queryRunner.hasTable('user_post_shares');
        if (!tableExists) {
            await queryRunner.createTable(new typeorm_1.Table({
                name: 'user_post_shares',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'user_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'post_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'post_type',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }), true);
        }
        else {
            const table = await queryRunner.getTable('user_post_shares');
            if (!table?.findColumnByName('post_type')) {
                await queryRunner.query(`
                    ALTER TABLE \`user_post_shares\` 
                    ADD COLUMN \`post_type\` varchar(50) NOT NULL DEFAULT 'user_post'
                `);
            }
        }
        try {
            await queryRunner.query(`
                CREATE UNIQUE INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\` (\`user_id\`, \`post_id\`, \`post_type\`)
            `);
        }
        catch (error) {
            const table = await queryRunner.getTable('user_post_shares');
            const hasPostType = table?.findColumnByName('post_type');
            if (hasPostType) {
                try {
                    await queryRunner.query(`DROP INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\``);
                    await queryRunner.query(`
                        CREATE UNIQUE INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\` (\`user_id\`, \`post_id\`, \`post_type\`)
                    `);
                }
                catch (err) {
                    console.log('Index already exists or error creating index:', err);
                }
            }
            else {
                try {
                    await queryRunner.query(`
                        CREATE UNIQUE INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\` (\`user_id\`, \`post_id\`)
                    `);
                }
                catch (err) {
                    console.log('Could not create index:', err);
                }
            }
        }
        await queryRunner.query(`
            ALTER TABLE \`user_post_shares\` 
            ADD CONSTRAINT \`FK_user_post_share_user\` 
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('user_post_shares');
    }
}
exports.CreateUserPostShareTable1759538264000 = CreateUserPostShareTable1759538264000;
//# sourceMappingURL=1759538264000-CreateUserPostShareTable.js.map