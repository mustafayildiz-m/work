"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserFollowsAndScholarFollows1750000000001 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserFollowsAndScholarFollows1750000000001 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user_follows',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                { name: 'follower_id', type: 'int' },
                { name: 'following_id', type: 'int' },
            ],
            foreignKeys: [
                {
                    columnNames: ['follower_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                },
                {
                    columnNames: ['following_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                },
            ],
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user_scholar_follows',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                { name: 'user_id', type: 'int' },
                { name: 'scholar_id', type: 'int' },
            ],
            foreignKeys: [
                {
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                },
                {
                    columnNames: ['scholar_id'],
                    referencedTableName: 'scholars',
                    referencedColumnNames: ['id'],
                },
            ],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('user_scholar_follows');
        await queryRunner.dropTable('user_follows');
    }
}
exports.CreateUserFollowsAndScholarFollows1750000000001 = CreateUserFollowsAndScholarFollows1750000000001;
//# sourceMappingURL=1750000000001-create_user_follows_and_scholar_follows.js.map