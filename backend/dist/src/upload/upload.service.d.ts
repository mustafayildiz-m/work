import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): Promise<string>;
    uploadPdf(file: Express.Multer.File): Promise<string>;
}
