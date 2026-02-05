"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePodcastDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_podcast_dto_1 = require("./create-podcast.dto");
class UpdatePodcastDto extends (0, mapped_types_1.PartialType)(create_podcast_dto_1.CreatePodcastDto) {
}
exports.UpdatePodcastDto = UpdatePodcastDto;
//# sourceMappingURL=update-podcast.dto.js.map