"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePodcastTable1730726400000 = void 0;
const typeorm_1 = require("typeorm");
class CreatePodcastTable1730726400000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'podcasts',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'title',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'audioUrl',
                    type: 'varchar',
                    length: '500',
                    isNullable: true,
                },
                {
                    name: 'coverImage',
                    type: 'varchar',
                    length: '500',
                    isNullable: true,
                },
                {
                    name: 'duration',
                    type: 'int',
                    isNullable: true,
                },
                {
                    name: 'author',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'language',
                    type: 'varchar',
                    length: '50',
                    default: "'tr'",
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'isFeatured',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'listenCount',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'likeCount',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'category',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                },
                {
                    name: 'publishDate',
                    type: 'date',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('podcasts');
    }
}
exports.CreatePodcastTable1730726400000 = CreatePodcastTable1730726400000;
//# sourceMappingURL=1730726400000-CreatePodcastTable.js.map