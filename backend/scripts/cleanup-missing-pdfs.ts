import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BooksService } from '../src/books/books.service';
import { Repository } from 'typeorm';
import { BookTranslation } from '../src/books/entities/book-translation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function cleanupMissingPdfs() {
    console.log('🧹 Starting cleanup script for books with missing PDFs...');

    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        // Repository'lere eriş
        const bookTranslationRepo = app.get<Repository<BookTranslation>>(getRepositoryToken(BookTranslation));
        const booksService = app.get(BooksService);

        // Tüm translationları getir (pdfUrl olanları)
        const translations = await bookTranslationRepo.find({
            relations: ['book'],
        });

        console.log(`📚 Found ${translations.length} translations to check.`);
        let removedCount = 0;
        const removedBookIds = new Set<number>();

        for (const trans of translations) {
            if (!trans.pdfUrl) continue;

            // pdfUrl genellikle "/uploads/pdfs/..." başlar. process.cwd() backend köküdür.
            // Eğer pdfUrl başta "/" ile başlıyorsa path.join doğru çalışır.
            // Eğer tam URL ise (http://...) o zaman yerel dosya değildir, atla.
            if (trans.pdfUrl.startsWith('http')) {
                continue;
            }

            const pdfPath = path.join(process.cwd(), trans.pdfUrl);

            if (!fs.existsSync(pdfPath)) {
                console.warn(`❌ Missing PDF found: Book ID ${trans.bookId}, Lang ${trans.languageId}, Path: ${trans.pdfUrl}`);

                // Bu translation'ı sil
                await bookTranslationRepo.remove(trans);
                removedCount++;
                removedBookIds.add(trans.bookId);
            }
        }

        console.log(`✅ Removed ${removedCount} translations with missing PDFs.`);

        // Eğer bir kitabın hiç translation'ı kalmadıysa, o kitabı da silebiliriz
        if (removedBookIds.size > 0) {
            console.log('🔍 Checking for orphan books (books with no translations)...');
            let removedBooksCount = 0;

            for (const bookId of removedBookIds) {
                // Kitabı tekrar getir, güncel translation sayısına bak
                const book = await booksService.findOne(bookId);

                if (!book || !book.translations || book.translations.length === 0) {
                    console.warn(`🗑️ Deleting orphan book ID: ${bookId} (No translations left)`);
                    await booksService.remove(bookId);
                    removedBooksCount++;
                }
            }
            console.log(`✅ Removed ${removedBooksCount} orphan books.`);
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await app.close();
    }
}

cleanupMissingPdfs();
