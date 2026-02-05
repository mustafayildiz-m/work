"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const regional_books_seeder_1 = require("../src/seeders/regional-books-seeder");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(regional_books_seeder_1.RegionalBooksSeeder);
    await seeder.seed();
    await app.close();
}
bootstrap().catch(console.error);
//# sourceMappingURL=seed-regional-books.js.map