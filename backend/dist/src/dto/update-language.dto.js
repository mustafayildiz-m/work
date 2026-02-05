"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLanguageDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_language_dto_1 = require("./create-language.dto");
class UpdateLanguageDto extends (0, mapped_types_1.PartialType)(create_language_dto_1.CreateLanguageDto) {
}
exports.UpdateLanguageDto = UpdateLanguageDto;
//# sourceMappingURL=update-language.dto.js.map