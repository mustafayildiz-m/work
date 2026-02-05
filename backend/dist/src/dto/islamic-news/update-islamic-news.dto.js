"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIslamicNewsDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_islamic_news_dto_1 = require("./create-islamic-news.dto");
class UpdateIslamicNewsDto extends (0, mapped_types_1.PartialType)(create_islamic_news_dto_1.CreateIslamicNewsDto) {
}
exports.UpdateIslamicNewsDto = UpdateIslamicNewsDto;
//# sourceMappingURL=update-islamic-news.dto.js.map