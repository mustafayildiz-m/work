declare class CreateScholarBookDto {
    title: string;
    description?: string;
    coverUrl?: string;
    pdfUrl?: string;
}
declare class CreateSourceDto {
    content: string;
    url?: string;
}
export declare class CreateScholarDto {
    fullName: string;
    lineage?: string;
    birthDate?: string;
    deathDate?: string;
    biography: string;
    photoUrl?: string;
    coverImage?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    locationDescription?: string;
    ownBooks?: CreateScholarBookDto[];
    sources?: CreateSourceDto[];
    relatedBooks?: number[];
}
export {};
