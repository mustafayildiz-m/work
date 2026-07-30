import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryController } from '../controllers/country.controller';
import { CountryService } from '../services/country.service';
import { Country } from '../countries/entities/country.entity';
import { CountryLanguage } from '../countries/entities/country-language.entity';
import { Language } from '../languages/entities/language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country, CountryLanguage, Language])],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
