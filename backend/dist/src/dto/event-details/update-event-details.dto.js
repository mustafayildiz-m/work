"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEventDetailsDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_event_details_dto_1 = require("./create-event-details.dto");
class UpdateEventDetailsDto extends (0, mapped_types_1.PartialType)(create_event_details_dto_1.CreateEventDetailsDto) {
}
exports.UpdateEventDetailsDto = UpdateEventDetailsDto;
//# sourceMappingURL=update-event-details.dto.js.map