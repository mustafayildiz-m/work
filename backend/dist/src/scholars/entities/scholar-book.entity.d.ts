import { Scholar } from './scholar.entity';
export declare class ScholarBook {
    id: number;
    title: string;
    description: string;
    coverUrl: string;
    pdfUrl: string;
    scholar: Scholar;
    createdAt: Date;
    updatedAt: Date;
}
