"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicProfileModule = void 0;
const common_1 = require("@nestjs/common");
const public_profile_controller_1 = require("../controllers/public-profile.controller");
const users_module_1 = require("../users/users.module");
const scholars_module_1 = require("../scholars/scholars.module");
const books_module_1 = require("../books/books.module");
let PublicProfileModule = class PublicProfileModule {
};
exports.PublicProfileModule = PublicProfileModule;
exports.PublicProfileModule = PublicProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, scholars_module_1.ScholarsModule, books_module_1.BooksModule],
        controllers: [public_profile_controller_1.PublicProfileController],
    })
], PublicProfileModule);
//# sourceMappingURL=public-profile.module.js.map