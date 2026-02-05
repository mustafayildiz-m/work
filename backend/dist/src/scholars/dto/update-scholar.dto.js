"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScholarDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_scholar_dto_1 = require("./create-scholar.dto");
class UpdateScholarDto extends (0, mapped_types_1.PartialType)(create_scholar_dto_1.CreateScholarDto) {
}
exports.UpdateScholarDto = UpdateScholarDto;
//# sourceMappingURL=update-scholar.dto.js.map