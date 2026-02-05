import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class ScholarRelatedBooksSeeder {
  constructor(
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async seed() {
    console.log('🌱 Starting scholar related books seeding...');

    // Tüm scholar'ları ve kitapları al (kitapları translations ile birlikte)
    const scholars = await this.scholarRepository.find();
    const books = await this.bookRepository.find({
      relations: ['translations'],
    });

    // Test scholar'ını filtrele (id: 12)
    const realScholars = scholars.filter((scholar) => scholar.id !== 12);
    const realBooks = books.filter((book) => book.id !== 16); // Test kitabını filtrele

    console.log(
      `Found ${realScholars.length} scholars and ${realBooks.length} books`,
    );

    // Her scholar için rastgele kitaplar seç
    for (const scholar of realScholars) {
      try {
        // Scholar'ın mevcut related books'larını al
        const scholarWithBooks = await this.scholarRepository.findOne({
          where: { id: scholar.id },
          relations: ['relatedBooks'],
        });

        if (!scholarWithBooks) {
          console.log(`⚠️  Scholar not found: ${scholar.fullName}`);
          continue;
        }

        // Rastgele 3-7 kitap seç (mevcut kitapları hariç tut)
        const currentBookIds =
          scholarWithBooks.relatedBooks?.map((book) => book.id) || [];
        const availableBooks = realBooks.filter(
          (book) => !currentBookIds.includes(book.id),
        );

        const numberOfBooks = Math.floor(Math.random() * 5) + 3; // 3-7 arası
        const selectedBooks = this.getRandomBooks(
          availableBooks,
          numberOfBooks,
        );

        if (selectedBooks.length === 0) {
          console.log(`⚠️  No available books for ${scholar.fullName}`);
          continue;
        }

        // Scholar'a kitapları ata
        scholarWithBooks.relatedBooks = selectedBooks;
        await this.scholarRepository.save(scholarWithBooks);

        // Kitap başlıklarını al (ilk translation'dan)
        const bookTitles = selectedBooks
          .map(
            (b) =>
              (b as any).translations?.[0]?.title ||
              b.author ||
              `Book #${b.id}`,
          )
          .join(', ');
        console.log(
          `✅ Added ${selectedBooks.length} books to ${scholar.fullName}: ${bookTitles}`,
        );
      } catch (error) {
        console.error(
          `❌ Error adding books to ${scholar.fullName}:`,
          error.message,
        );
      }
    }

    console.log('🎉 Scholar related books seeding completed!');
  }

  private getRandomBooks(books: Book[], count: number): Book[] {
    const shuffled = [...books].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, books.length));
  }
}
