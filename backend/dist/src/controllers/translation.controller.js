"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const translation_service_1 = require("../services/translation.service");
const translate_text_dto_1 = require("../dto/translate-text.dto");
let TranslationController = class TranslationController {
    constructor(translationService) {
        this.translationService = translationService;
    }
    async translate(translateDto) {
        const { text, targetLangCode, sourceLangCode } = translateDto;
        if (text.length > 500) {
            const translatedText = await this.translationService.translateLongText(text, targetLangCode, sourceLangCode);
            return {
                success: true,
                translatedText,
                originalLength: text.length,
                translatedLength: translatedText.length,
            };
        }
        else {
            const translatedText = await this.translationService.translateText(text, targetLangCode, sourceLangCode);
            return {
                success: true,
                translatedText,
                originalLength: text.length,
                translatedLength: translatedText.length,
            };
        }
    }
};
exports.TranslationController = TranslationController;
__decorate([
    (0, common_1.Post)('translate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [translate_text_dto_1.TranslateTextDto]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "translate", null);
exports.TranslationController = TranslationController = __decorate([
    (0, common_1.Controller)('translation'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [translation_service_1.TranslationService])
], TranslationController);
//# sourceMappingURL=translation.controller.js.map