import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CountryService } from '../services/country.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';

const flagUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = 'uploads/country_flags';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `country-flag-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Sadece resim dosyaları yükleyebilirsiniz (JPG, PNG, GIF, WebP, SVG)',
        ),
        false,
      );
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('flag', flagUploadOptions))
  create(
    @Body() createCountryDto: CreateCountryDto,
    @Body('languageIds') rawLangIds: string | string[] | undefined,
    @UploadedFile() flag?: Express.Multer.File,
  ) {
    if (flag) {
      createCountryDto.flagUrl = `/uploads/country_flags/${flag.filename}`;
    }
    const languageIds = this.parseLangIds(rawLangIds);
    return this.countryService.create(createCountryDto, languageIds);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('flag', flagUploadOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto,
    @Body('languageIds') rawLangIds: string | string[] | undefined,
    @UploadedFile() flag?: Express.Multer.File,
  ) {
    if (flag) {
      updateCountryDto.flagUrl = `/uploads/country_flags/${flag.filename}`;
    }
    const languageIds = rawLangIds !== undefined
      ? this.parseLangIds(rawLangIds)
      : undefined;
    return this.countryService.update(id, updateCountryDto, languageIds);
  }

  private parseLangIds(raw: string | string[] | undefined): number[] {
    if (!raw) return [];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
      } catch {}
      return raw.split(',').map(Number).filter(Boolean);
    }
    return raw.map(Number).filter(Boolean);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.remove(id);
  }
}
