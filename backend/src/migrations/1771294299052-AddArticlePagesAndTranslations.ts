import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class AddArticlePagesAndTranslations1771294299052 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create article_pages table
        await queryRunner.createTable(new Table({
            name: "article_pages",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "articleId",
                    type: "int"
                },
                {
                    name: "pageNumber",
                    type: "int"
                },
                {
                    name: "content",
                    type: "mediumtext", // Store original content if needed
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create article_page_translations table
        await queryRunner.createTable(new Table({
            name: "article_page_translations",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "pageId",
                    type: "int"
                },
                {
                    name: "languageId",
                    type: "int"
                },
                {
                    name: "content",
                    type: "mediumtext"
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Foreign keys for article_pages
        await queryRunner.createForeignKey("article_pages", new TableForeignKey({
            columnNames: ["articleId"],
            referencedColumnNames: ["id"],
            referencedTableName: "articles",
            onDelete: "CASCADE"
        }));

        // Foreign keys for article_page_translations
        await queryRunner.createForeignKey("article_page_translations", new TableForeignKey({
            columnNames: ["pageId"],
            referencedColumnNames: ["id"],
            referencedTableName: "article_pages",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("article_page_translations", new TableForeignKey({
            columnNames: ["languageId"],
            referencedColumnNames: ["id"],
            referencedTableName: "languages",
            onDelete: "CASCADE"
        }));

        // Index for faster lookups
        await queryRunner.createIndex("article_pages", new TableIndex({
            name: "IDX_ARTICLE_PAGE",
            columnNames: ["articleId", "pageNumber"]
        }));

        await queryRunner.createIndex("article_page_translations", new TableIndex({
            name: "IDX_ARTICLE_PAGE_LANG",
            columnNames: ["pageId", "languageId"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("article_page_translations");
        await queryRunner.dropTable("article_pages");
    }

}
