"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const languages_seeder_1 = require("../src/seeders/languages-seeder");
async function runSeeder() {
    console.log('🌱 Starting language seeder...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(languages_seeder_1.LanguagesSeeder);
    try {
        await seeder.seed();
        console.log('✅ Language seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
    }
    finally {
        await app.close();
    }
}
runSeeder();
//# sourceMappingURL=seed-languages.js.map