import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from '../dto/stock/create-stock.dto';
import { UpdateStockDto } from '../dto/stock/update-stock.dto';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async create(createStockDto: CreateStockDto) {
    const existing = await this.stockRepository.findOne({
      where: {
        book: { id: createStockDto.bookId },
        language: { id: createStockDto.languageId },
        warehouse: { id: createStockDto.warehouseId },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Bu kitap, dil ve depo kombinasyonu için zaten bir stok kaydı var.',
      );
    }
    const stock = this.stockRepository.create({
      quantity: createStockDto.quantity,
      unitPrice: createStockDto.unitPrice,
      book: { id: createStockDto.bookId },
      language: { id: createStockDto.languageId },
      warehouse: { id: createStockDto.warehouseId },
    });
    return this.stockRepository.save(stock);
  }

  async findAll(
    bookName?: string,
    languageId?: string,
    warehouseId?: string,
    lowStock?: string,
  ) {
    try {
      const queryBuilder = this.stockRepository
        .createQueryBuilder('stock')
        .leftJoinAndSelect('stock.book', 'book')
        .leftJoin('book.translations', 'bookTranslations') // leftJoin kullan (eager loading zaten var)
        .addSelect([
          'bookTranslations.id',
          'bookTranslations.title',
          'bookTranslations.languageId',
        ]) // Sadece gerekli alanları seç
        .leftJoinAndSelect('stock.language', 'language')
        .leftJoinAndSelect('stock.warehouse', 'warehouse')
        .leftJoinAndSelect('stock.transfers', 'transfers')
        .leftJoinAndSelect('transfers.toWarehouse', 'toWarehouse');

      // Book name filter (search in translations or direct title)
      if (bookName) {
        queryBuilder.andWhere(
          '(bookTranslations.title LIKE :bookName OR book.title LIKE :bookName)',
          { bookName: `%${bookName}%` },
        );
      }

      // Language filter
      if (languageId && languageId !== 'all') {
        queryBuilder.andWhere('stock.languageId = :languageId', {
          languageId: +languageId,
        });
      }

      // Warehouse filter
      if (warehouseId && warehouseId !== 'all') {
        queryBuilder.andWhere('stock.warehouseId = :warehouseId', {
          warehouseId: +warehouseId,
        });
      }

      // Low stock filter (quantity < 10)
      if (lowStock === 'true') {
        queryBuilder.andWhere('stock.quantity < 10');
      }

      queryBuilder.orderBy('stock.id', 'DESC');

      const stocks = await queryBuilder.getMany();

      // Her stok için sadece pending transferleri filtrele
      return stocks.map((stock) => {
        // Null kontrolleri
        const safeStock = {
          ...stock,
          book: stock.book || null,
          language: stock.language || null,
          warehouse: stock.warehouse || null,
          pendingTransfers:
            stock.transfers?.filter((t) => t && t.status === 'pending') || [],
          transfers: undefined, // Tüm transferleri göndermemize gerek yok
        };
        return safeStock;
      });
    } catch (error) {
      console.error('Error in StocksService.findAll:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Query parameters:', {
        bookName,
        languageId,
        warehouseId,
        lowStock,
      });
      // Daha detaylı hata mesajı
      throw new Error(`Stocks listesi alınırken hata oluştu: ${error.message}`);
    }
  }

  findOne(id: number) {
    return this.stockRepository.findOne({
      where: { id },
      relations: ['book', 'language', 'warehouse'],
    });
  }

  async findByBook(bookId: number) {
    return this.stockRepository.find({
      where: { book: { id: bookId } },
      relations: ['language', 'warehouse'],
    });
  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    const stock = await this.findOne(id);
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    await this.stockRepository.update(id, updateStockDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const stock = await this.findOne(id);
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return this.stockRepository.remove(stock);
  }
}
