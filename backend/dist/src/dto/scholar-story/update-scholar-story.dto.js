"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScholarStoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_scholar_story_dto_1 = require("./create-scholar-story.dto");
class UpdateScholarStoryDto extends (0, mapped_types_1.PartialType)(create_scholar_story_dto_1.CreateScholarStoryDto) {
}
exports.UpdateScholarStoryDto = UpdateScholarStoryDto;
//# sourceMappingURL=update-scholar-story.dto.js.map