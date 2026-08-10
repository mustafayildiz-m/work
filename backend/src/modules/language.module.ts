import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageController } from '../controllers/language.controller';
import { LanguageService } from '../services/language.service';
import { Language } from '../languages/entities/language.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { Qa300LanguagesSeeder } from '../seeders/qa-300-languages-seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Language, BookTranslation])],
  controllers: [LanguageController],
  providers: [LanguageService, Qa300LanguagesSeeder],
  exports: [LanguageService, Qa300LanguagesSeeder],
})
export class LanguageModule {}
