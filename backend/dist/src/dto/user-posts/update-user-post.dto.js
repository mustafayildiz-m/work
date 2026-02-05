"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserPostDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_user_post_dto_1 = require("./create-user-post.dto");
class UpdateUserPostDto extends (0, mapped_types_1.PartialType)(create_user_post_dto_1.CreateUserPostDto) {
}
exports.UpdateUserPostDto = UpdateUserPostDto;
//# sourceMappingURL=update-user-post.dto.js.map