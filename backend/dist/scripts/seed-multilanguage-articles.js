"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const multilanguage_articles_seeder_1 = require("../src/seeders/multilanguage-articles-seeder");
async function runSeeder() {
    console.log('🌱 Starting multilanguage articles seeder...');
    console.log('📚 This will add 70 articles in multiple languages...');
    console.log('⚠️  Make sure you have books and languages in your database first!');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(multilanguage_articles_seeder_1.MultiLanguageArticlesSeeder);
    try {
        await seeder.seed();
        console.log('✅ Multilanguage articles seeding completed successfully!');
        console.log('🎉 You now have articles in Turkish, English, and Arabic!');
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
    }
    finally {
        await app.close();
    }
}
runSeeder();
//# sourceMappingURL=seed-multilanguage-articles.js.map