import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Country } from '../countries/entities/country.entity';
import { CountryLanguage } from '../countries/entities/country-language.entity';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(CountryLanguage)
    private readonly countryLanguageRepository: Repository<CountryLanguage>,
  ) {}

  private normalizeAlpha2(value: string | undefined): string | undefined {
    if (!value) return value;
    return value.toUpperCase().slice(0, 2);
  }

  /** Coerce multipart/form-data string values before DB writes */
  private normalizeFormFields(dto: CreateCountryDto | UpdateCountryDto): void {
    const raw = dto as Record<string, unknown>;

    if (raw.primaryLanguageId !== undefined && raw.primaryLanguageId !== '') {
      dto.primaryLanguageId = Number(raw.primaryLanguageId);
    }
    if (raw.displayOrder !== undefined && raw.displayOrder !== '') {
      dto.displayOrder = Number(raw.displayOrder);
    }
    if (raw.isActive !== undefined) {
      dto.isActive =
        raw.isActive === true ||
        raw.isActive === 'true' ||
        raw.isActive === '1';
    }
  }

  async create(
    createCountryDto: CreateCountryDto,
    languageIds?: number[],
  ): Promise<Country> {
    try {
      this.normalizeFormFields(createCountryDto);
      if (createCountryDto.alpha2) {
        createCountryDto.alpha2 = this.normalizeAlpha2(createCountryDto.alpha2)!;
      }
      if (createCountryDto.alpha3) {
        createCountryDto.alpha3 = createCountryDto.alpha3.toUpperCase();
      }
      const country = this.countryRepository.create(createCountryDto);
      const saved = await this.countryRepository.save(country);

      if (languageIds?.length) {
        await this.syncCountryLanguages(
          saved.id,
          languageIds,
          Number(createCountryDto.primaryLanguageId) || undefined,
        );
      }

      return this.findOne(saved.id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Bu ülke kodu (alpha2) zaten kayıtlı.',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Country[]> {
    return this.countryRepository.find({
      where: { isActive: true },
      relations: ['primaryLanguage', 'countryLanguages', 'countryLanguages.language'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { id },
      relations: ['primaryLanguage', 'countryLanguages', 'countryLanguages.language'],
    });
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
    return country;
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
    languageIds?: number[],
  ): Promise<Country> {
    try {
      await this.findOne(id);
      this.normalizeFormFields(updateCountryDto);

      if (updateCountryDto.alpha2) {
        updateCountryDto.alpha2 = this.normalizeAlpha2(updateCountryDto.alpha2)!;
        const duplicate = await this.countryRepository.findOne({
          where: { alpha2: updateCountryDto.alpha2, id: Not(id) },
        });
        if (duplicate) {
          throw new ConflictException(
            'Bu alpha2 kodu başka bir ülkede kullanılıyor.',
          );
        }
      }

      if (updateCountryDto.alpha3) {
        updateCountryDto.alpha3 = updateCountryDto.alpha3.toUpperCase();
      }

      await this.countryRepository.update(id, updateCountryDto);

      if (languageIds !== undefined) {
        await this.syncCountryLanguages(
          id,
          languageIds,
          Number(updateCountryDto.primaryLanguageId) || undefined,
        );
      }

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Bu alpha2 kodu zaten mevcut.');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const country = await this.findOne(id);
    const result = await this.countryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
    return { message: `${country.name} ülkesi başarıyla silindi.` };
  }

  /**
   * Replaces all country_languages rows for the given country.
   * The language matching primaryLanguageId is marked isPrimary=true.
   */
  private async syncCountryLanguages(
    countryId: number,
    languageIds: number[],
    primaryLanguageId?: number,
  ): Promise<void> {
    await this.countryLanguageRepository.delete({ countryId });

    if (!languageIds.length) return;

    const unique = [...new Set(languageIds)];
    const rows = unique.map((langId, idx) =>
      this.countryLanguageRepository.create({
        countryId,
        languageId: langId,
        isPrimary: primaryLanguageId ? langId === primaryLanguageId : idx === 0,
        displayOrder: idx,
      }),
    );

    await this.countryLanguageRepository.save(rows);
  }
}
