import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';

@Injectable()
export class LanguagesSeeder {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async seed() {
    console.log('🌱 Starting languages seeding...');

    // En çok konuşulan 100+ dil ve diğer önemli diller
    const languages = [
      // İlk 30 dil
      { name: 'Türkçe', code: 'tr' },
      { name: 'İngilizce', code: 'en' },
      { name: 'Arapça', code: 'ar' },
      { name: 'Farsça', code: 'fa' },
      { name: 'Urduca', code: 'ur' },
      { name: 'Almanca', code: 'de' },
      { name: 'Fransızca', code: 'fr' },
      { name: 'İspanyolca', code: 'es' },
      { name: 'İtalyanca', code: 'it' },
      { name: 'Rusça', code: 'ru' },
      { name: 'Çince', code: 'zh' },
      { name: 'Japonca', code: 'ja' },
      { name: 'Korece', code: 'ko' },
      { name: 'Hollandaca', code: 'nl' },
      { name: 'Portekizce', code: 'pt' },
      { name: 'İsveççe', code: 'sv' },
      { name: 'Norveççe', code: 'no' },
      { name: 'Danca', code: 'da' },
      { name: 'Fince', code: 'fi' },
      { name: 'Yunanca', code: 'el' },
      { name: 'İbranice', code: 'he' },
      { name: 'Hintçe', code: 'hi' },
      { name: 'Bengalce', code: 'bn' },
      { name: 'Tamilce', code: 'ta' },
      { name: 'Tayca', code: 'th' },
      { name: 'Vietnamca', code: 'vi' },
      { name: 'Endonezyaca', code: 'id' },
      { name: 'Malayca', code: 'ms' },
      { name: 'Tagalog', code: 'tl' },
      { name: 'Swahili', code: 'sw' },

      // 30 yeni dil
      { name: 'Kazakça', code: 'kk' },
      { name: 'Özbekçe', code: 'uz' },
      { name: 'Kırgızca', code: 'ky' },
      { name: 'Türkmence', code: 'tk' },
      { name: 'Azerbaycan Türkçesi', code: 'az' },
      { name: 'Tatarca', code: 'tt' },
      { name: 'Başkurtça', code: 'ba' },
      { name: 'Çuvaşça', code: 'cv' },
      { name: 'Yakutça', code: 'sah' },
      { name: 'Buryatça', code: 'bua' },
      { name: 'Kalmıkça', code: 'xal' },
      { name: 'Tuva Türkçesi', code: 'tyv' },
      { name: 'Hakasça', code: 'kjh' },
      { name: 'Altayca', code: 'alt' },
      { name: 'Şorca', code: 'cjs' },
      { name: 'Dolganca', code: 'dlg' },
      { name: 'Tofalarca', code: 'kim' },
      { name: 'Gagavuzca', code: 'gag' },
      { name: 'Karaimce', code: 'kdr' },
      { name: 'Çuvaşça', code: 'cv' },
      { name: 'Kırım Tatar Türkçesi', code: 'crh' },
      { name: 'Karaçay-Balkarca', code: 'krc' },
      { name: 'Kumukça', code: 'kum' },
      { name: 'Nogayca', code: 'nog' },
      { name: 'Karakalpakça', code: 'kaa' },
      { name: 'Çağatay Türkçesi', code: 'chg' },
      { name: 'Osmanlı Türkçesi', code: 'ota' },
      { name: 'Eski Türkçe', code: 'otk' },
      { name: 'Uygur Türkçesi', code: 'ug' },
      { name: 'Salarca', code: 'slr' },

      // Resimdeki eksik diller
      { name: 'Peştuca', code: 'ps' },
      { name: 'Hausa', code: 'ha' },
      { name: 'Igbo', code: 'ig' },
      { name: 'Yoruba', code: 'yo' },
      { name: 'Luganda', code: 'lg' },
      { name: 'Rohingya', code: 'rhg' },
      { name: 'Katalanca', code: 'ca' },

      // En çok konuşulan 100 dil listesinden eksik diller
      // Hindistan dilleri
      { name: 'Marathi', code: 'mr' },
      { name: 'Telugu', code: 'te' },
      { name: 'Gujarati', code: 'gu' },
      { name: 'Malayalam', code: 'ml' },
      { name: 'Kannada', code: 'kn' },
      { name: 'Odia', code: 'or' },

      // Avrupa dilleri
      { name: 'Ukraynaca', code: 'uk' },
      { name: 'Kürtçe', code: 'ku' },
      { name: 'Rumence', code: 'ro' },
      { name: 'Bulgarca', code: 'bg' },
      { name: 'Sırpça', code: 'sr' },
      { name: 'Macarca', code: 'hu' },
      { name: 'Çekçe', code: 'cs' },
      { name: 'Lehçe', code: 'pl' },
      { name: 'Slovakça', code: 'sk' },
      { name: 'Slovence', code: 'sl' },
      { name: 'Makedonca', code: 'mk' },
      { name: 'Ermenice', code: 'hy' },

      // Asya dilleri
      { name: 'Myanmar', code: 'my' },
      { name: 'Lao', code: 'lo' },
      { name: 'Khmer', code: 'km' },
      { name: 'Sinhala', code: 'si' },
      { name: 'Moğolca', code: 'mn' },
      { name: 'Cava', code: 'jv' },

      // Afrika dilleri
      { name: 'Zulu', code: 'zu' },
      { name: 'Xhosa', code: 'xh' },
      { name: 'Shona', code: 'sn' },
      { name: 'Amharic', code: 'am' },
      { name: 'Bambara', code: 'bm' },
      { name: 'Fulah', code: 'ff' },
      { name: 'Lingala', code: 'ln' },
      { name: 'Kikongo', code: 'kg' },
      { name: 'Rundi', code: 'rn' },
      { name: 'Somalice', code: 'so' },
      { name: 'Fon', code: 'fon' },

      // Diğer diller
      { name: 'Esperanto', code: 'eo' },
      { name: 'Baskça', code: 'eu' },
    ];

    for (const languageData of languages) {
      try {
        // Dilin zaten var olup olmadığını kontrol et
        const existingLanguage = await this.languageRepository.findOne({
          where: [{ name: languageData.name }, { code: languageData.code }],
        });

        if (existingLanguage) {
          console.log(
            `⚠️  Language already exists: ${languageData.name} (${languageData.code})`,
          );
          continue;
        }

        // Dili oluştur
        const language = this.languageRepository.create({
          ...languageData,
          isActive: true,
        });

        await this.languageRepository.save(language);
        console.log(
          `✅ Added language: ${languageData.name} (${languageData.code})`,
        );
      } catch (error) {
        console.error(
          `❌ Error adding language ${languageData.name}:`,
          error.message,
        );
      }
    }

    console.log('🎉 Languages seeding completed!');
  }
}
