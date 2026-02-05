"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const multilanguage_books_seeder_1 = require("../src/seeders/multilanguage-books-seeder");
async function runSeeder() {
    console.log('🌱 Starting multilanguage books seeder...');
    console.log('📚 This will add 60 books in multiple languages...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(multilanguage_books_seeder_1.MultiLanguageBooksSeeder);
    try {
        await seeder.seed();
        console.log('✅ Multilanguage books seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
    }
    finally {
        await app.close();
    }
}
runSeeder();
//# sourceMappingURL=seed-multilanguage-books.js.map