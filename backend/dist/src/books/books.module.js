"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const books_controller_1 = require("./books.controller");
const book_categories_controller_1 = require("./book-categories.controller");
const books_service_1 = require("./books.service");
const book_entity_1 = require("./entities/book.entity");
const book_translation_entity_1 = require("./entities/book-translation.entity");
const upload_module_1 = require("../upload/upload.module");
const book_category_entity_1 = require("./entities/book-category.entity");
let BooksModule = class BooksModule {
};
exports.BooksModule = BooksModule;
exports.BooksModule = BooksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([book_entity_1.Book, book_translation_entity_1.BookTranslation, book_category_entity_1.BookCategory]),
            upload_module_1.UploadModule,
        ],
        controllers: [books_controller_1.BooksController, book_categories_controller_1.BookCategoriesController],
        providers: [books_service_1.BooksService],
        exports: [books_service_1.BooksService],
    })
], BooksModule);
//# sourceMappingURL=books.module.js.map