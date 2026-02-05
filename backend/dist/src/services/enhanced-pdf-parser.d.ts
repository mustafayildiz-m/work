export interface ParserConfig {
    minNameLength: number;
    maxNameLength: number;
    minWordCount: number;
    maxWordCount: number;
    datePatterns: RegExp[];
    lineageKeywords: string[];
    excludePatterns: RegExp[];
    alternativeNameSupport: boolean;
    confidenceThreshold: number;
}
export interface ScholarData {
    fullName: string;
    alternativeName?: string;
    lineage?: string;
    birthDate?: string;
    deathDate?: string;
    birthDateHijri?: string;
    deathDateHijri?: string;
    biography: string;
    photoUrl?: string;
    coverImage?: string;
    locationName?: string;
    locationDescription?: string;
    confidence?: number;
    rawLine?: string;
}
export declare class PDFSpecificScholarParser {
    private pdfPath;
    private outputPath;
    private config;
    private compiledPatterns;
    constructor(pdfPath: string, outputPath: string, config?: Partial<ParserConfig>);
    private compilePatterns;
    parsePDF(): Promise<string>;
    private extractAlternativeName;
    private hasKnownScholarPatterns;
    private isValidScholarName;
    private extractDatesFromBiography;
    private extractLineage;
    private calculateConfidence;
    extractScholars(text: string): ScholarData[];
    saveToFile(scholars: ScholarData[]): Promise<void>;
    process(): Promise<ScholarData[]>;
    testWithYourExamples(): void;
    static processMultiplePDFs(pdfPaths: string[], outputDir: string, config?: Partial<ParserConfig>): Promise<ScholarData[]>;
}
export declare function testPDFParser(): Promise<ScholarData[]>;
