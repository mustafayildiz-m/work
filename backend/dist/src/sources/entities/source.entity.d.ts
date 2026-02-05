import { Scholar } from '../../scholars/entities/scholar.entity';
export declare class Source {
    id: number;
    content: string;
    url: string;
    scholar: Scholar;
    createdAt: Date;
    updatedAt: Date;
}
