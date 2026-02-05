import { CreateScholarPostDto, CreateTranslationDto } from './create-scholar-post.dto';
declare const UpdateScholarPostDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateScholarPostDto>>;
export declare class UpdateScholarPostDto extends UpdateScholarPostDto_base {
}
declare const UpdateTranslationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTranslationDto>>;
export declare class UpdateTranslationDto extends UpdateTranslationDto_base {
    id?: string;
}
export {};
