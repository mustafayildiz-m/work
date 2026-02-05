"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const religious_books_seeder_1 = require("../src/seeders/religious-books-seeder");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(religious_books_seeder_1.ReligiousBooksSeeder);
    try {
        await seeder.seed();
        console.log('✅ Seeding tamamlandı!');
    }
    catch (error) {
        console.error('❌ Seeding sırasında hata:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed-religious-books.js.map