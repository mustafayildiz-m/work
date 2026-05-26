import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Country } from '../countries/entities/country.entity';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  private normalizeAlpha2(value: string | undefined): string | undefined {
    if (!value) return value;
    return value.toUpperCase().slice(0, 2);
  }

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    try {
      if (createCountryDto.alpha2) {
        createCountryDto.alpha2 = this.normalizeAlpha2(createCountryDto.alpha2)!;
      }
      if (createCountryDto.alpha3) {
        createCountryDto.alpha3 = createCountryDto.alpha3.toUpperCase();
      }
      const country = this.countryRepository.create(createCountryDto);
      return await this.countryRepository.save(country);
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
      relations: ['primaryLanguage'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { id },
      relations: ['primaryLanguage'],
    });
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }
    return country;
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
  ): Promise<Country> {
    try {
      await this.findOne(id);

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
}
