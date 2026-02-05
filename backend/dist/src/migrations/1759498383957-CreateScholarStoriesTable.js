"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateScholarStoriesTable1759498383957 = void 0;
class CreateScholarStoriesTable1759498383957 {
    constructor() {
        this.name = 'CreateScholarStoriesTable1759498383957';
    }
    async safeDropColumn(queryRunner, tableName, columnName) {
        try {
            const table = await queryRunner.getTable(tableName);
            if (table && table.findColumnByName(columnName)) {
                await queryRunner.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
            }
        }
        catch (error) {
            console.log(`Column ${tableName}.${columnName} does not exist, skipping drop`);
        }
    }
    async up(queryRunner) {
        try {
            await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_711de461c8fcc1a9ff6864142dc\``);
        }
        catch (error) {
            console.log('Foreign key FK_711de461c8fcc1a9ff6864142dc does not exist, skipping drop');
        }
        try {
            await queryRunner.query(`CREATE TABLE \`scholar_stories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`video_url\` varchar(500) NULL, \`thumbnail_url\` varchar(500) NULL, \`duration\` int NULL, \`language\` varchar(50) NOT NULL DEFAULT 'tr', \`is_active\` tinyint NOT NULL DEFAULT 1, \`is_featured\` tinyint NOT NULL DEFAULT 0, \`view_count\` int NOT NULL DEFAULT '0', \`like_count\` int NOT NULL DEFAULT '0', \`scholar_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        }
        catch (error) {
            console.log('Table scholar_stories already exists, skipping creation');
        }
        await this.safeDropColumn(queryRunner, 'books', 'author');
        await this.safeDropColumn(queryRunner, 'books', 'coverImage');
        await this.safeDropColumn(queryRunner, 'books', 'coverUrl');
        await this.safeDropColumn(queryRunner, 'books', 'createdAt');
        await this.safeDropColumn(queryRunner, 'books', 'publishDate');
        await this.safeDropColumn(queryRunner, 'books', 'summary');
        await this.safeDropColumn(queryRunner, 'books', 'updatedAt');
        await this.safeDropColumn(queryRunner, 'book_languages', 'pdfUrl');
        await this.safeDropColumn(queryRunner, 'languages', 'createdAt');
        await this.safeDropColumn(queryRunner, 'languages', 'isActive');
        await this.safeDropColumn(queryRunner, 'languages', 'updatedAt');
        try {
            await queryRunner.query(`ALTER TABLE \`languages\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`);
        }
        catch (error) {
            console.log('Column languages.isActive already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`languages\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        }
        catch (error) {
            console.log('Column languages.createdAt already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`languages\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        }
        catch (error) {
            console.log('Column languages.updatedAt already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`book_languages\` ADD \`pdfUrl\` varchar(255) NULL`);
        }
        catch (error) {
            console.log('Column book_languages.pdfUrl already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverUrl\` varchar(255) NULL`);
        }
        catch (error) {
            console.log('Column books.coverUrl already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverImage\` varchar(255) NULL`);
        }
        catch (error) {
            console.log('Column books.coverImage already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`books\` ADD \`author\` varchar(255) NULL`);
        }
        catch (error) {
            console.log('Column books.author already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`books\` ADD \`publishDate\` date NULL`);
        }
        catch (error) {
            console.log('Column books.publishDate already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`books\` ADD \`summary\` text NULL`);
        }
        catch (error) {
            console.log('Column books.summary already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`books\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        }
        catch (error) {
            console.log('Column books.createdAt already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`books\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        }
        catch (error) {
            console.log('Column books.updatedAt already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`scholars\` DROP COLUMN \`biography\``);
        }
        catch (error) {
            console.log('Column scholars.biography does not exist, skipping drop');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`scholars\` ADD \`biography\` text NOT NULL`);
        }
        catch (error) {
            console.log('Column scholars.biography already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_805a09bc0444e439b53dfc0b061\``);
        }
        catch (error) {
            console.log('Foreign key FK_805a09bc0444e439b53dfc0b061 does not exist, skipping drop');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`book_languages\` CHANGE \`languageId\` \`languageId\` int NOT NULL`);
        }
        catch (error) {
            console.log('Could not change book_languages.languageId, column may not exist or type already correct');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`book_languages\` CHANGE \`bookId\` \`bookId\` int NULL`);
        }
        catch (error) {
            console.log('Could not change book_languages.bookId, column may not exist or type already correct');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_711de461c8fcc1a9ff6864142dc\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
        catch (error) {
            console.log('Foreign key FK_711de461c8fcc1a9ff6864142dc already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_805a09bc0444e439b53dfc0b061\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        catch (error) {
            console.log('Foreign key FK_805a09bc0444e439b53dfc0b061 already exists, skipping add');
        }
        try {
            await queryRunner.query(`ALTER TABLE \`scholar_stories\` ADD CONSTRAINT \`FK_91ce4af53b8aa6f13f65bf2c6f5\` FOREIGN KEY (\`scholar_id\`) REFERENCES \`scholars\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
        catch (error) {
            console.log('Foreign key FK_91ce4af53b8aa6f13f65bf2c6f5 already exists, skipping add');
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`scholar_stories\` DROP FOREIGN KEY \`FK_91ce4af53b8aa6f13f65bf2c6f5\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_805a09bc0444e439b53dfc0b061\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_711de461c8fcc1a9ff6864142dc\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` CHANGE \`bookId\` \`bookId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`book_languages\` CHANGE \`languageId\` \`languageId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_805a09bc0444e439b53dfc0b061\` FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scholars\` DROP COLUMN \`biography\``);
        await queryRunner.query(`ALTER TABLE \`scholars\` ADD \`biography\` longtext NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`summary\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`publishDate\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`author\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverImage\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`coverUrl\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP COLUMN \`pdfUrl\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`languages\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`isActive\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`languages\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD \`pdfUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`summary\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`publishDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`coverImage\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD \`author\` varchar(255) NULL`);
        await queryRunner.query(`DROP TABLE \`scholar_stories\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_711de461c8fcc1a9ff6864142dc\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
exports.CreateScholarStoriesTable1759498383957 = CreateScholarStoriesTable1759498383957;
//# sourceMappingURL=1759498383957-CreateScholarStoriesTable.js.map