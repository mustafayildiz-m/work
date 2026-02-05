import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';

@Injectable()
export class ScholarPostsSeeder {
  constructor(
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
    @InjectRepository(ScholarPost)
    private readonly scholarPostRepository: Repository<ScholarPost>,
  ) {}

  async seed() {
    console.log('🌱 Starting scholar posts seeding...');

    // Her alim için söz paylaşımları
    const scholarPosts = {
      1: [
        // İmam-ı Azam Ebu Hanife
        {
          content:
            'İlim öğrenmek, namaz kılmaktan daha faziletlidir. Çünkü ilim, hem kendine hem de başkalarına faydalıdır.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Allah'ın rızasını kazanmak için çalışan kimse, dünyada da ahirette de mutlu olur.",
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Fıkıh, Allah'ın emirlerini ve yasaklarını bilmektir. Bu ilim olmadan ibadetlerin kabul olması mümkün değildir.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      2: [
        // İmam Malik bin Enes
        {
          content:
            'Medine halkının ameli, bizim için delildir. Onların yaptığını yapmak, terk ettiğini terk etmek gerekir.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "İlim, Allah'tan korkmakla başlar. Allah'tan korkmayanın ilmi, kendisine fayda vermez.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      3: [
        // İmam Şafii
        {
          content:
            "Kur'an'ı anlamak için Arap dilini bilmek şarttır. Arapça bilmeyen, Kur'an'ı tam anlayamaz.",
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "İlim öğrenmek isteyen, önce kendini tanımalıdır. Kendini tanıyan, Allah'ı tanır.",
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Fıkıh usulü, şer'i hükümleri çıkarmanın yollarını öğretir. Bu olmadan doğru hüküm verilemez.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      4: [
        // İmam Ahmed bin Hanbel
        {
          content:
            'Hadis, dinin temelidir. Hadis olmadan din olmaz. Bu yüzden hadis öğrenmek farzdır.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Allah'ın dininde bid'at çıkarmak, dini bozmaktır. Bid'atçılar, dini tahrif ederler.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      5: [
        // İmam Gazali
        {
          content:
            "İlim, kalbi aydınlatır. Kalbi aydınlanan, Allah'ı görür gibi bilir.",
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            'Dünya, ahiret tarlasıdır. Burada ne ekersen, orada onu biçersin.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Tasavvuf, kalbi temizlemek ve Allah'a yaklaşmaktır. Bu olmadan gerçek iman olmaz.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      6: [
        // İbn Sina
        {
          content:
            'Tıp, insan sağlığını koruma sanatıdır. Sağlık, en büyük nimettir.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Felsefe, varlığın hakikatini araştırmaktır. Bu araştırma, Allah'ı tanımaya götürür.",
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content: "İlim, insanı kemale erdirir. Kemal, Allah'a yakınlıktır.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      7: [
        // İbn Rüşd
        {
          content:
            "Felsefe ve din, aynı hakikati farklı yollardan arar. İkisi de Allah'ı tanımaya götürür.",
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Akıl, Allah'ın insana verdiği en büyük nimettir. Aklı kullanmak, ibadettir.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      8: [
        // İmam Buhari
        {
          content:
            "Hadis, Peygamber'in sözü, fiili ve takriridir. Bu üçü de dinin kaynağıdır.",
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            'Hadis ricali, dinin koruyucularıdır. Onlar olmasa, din bozulurdu.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            'Sahih hadis, kesin bilgi verir. Bu bilgi olmadan din olmaz.',
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      9: [
        // İmam Müslim
        {
          content:
            'Hadis ilmi, dinin en önemli ilmidir. Bu ilim olmadan fıkıh olmaz.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "Hadis öğrenmek, Peygamber'i tanımaktır. Peygamber'i tanımak, Allah'ı tanımaktır.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
      10: [
        // Mevlana Celaleddin Rumi
        {
          content:
            'Aşk, her şeyin anahtarıdır. Aşk olmadan hiçbir şey anlaşılmaz.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            'Gel, ne olursan ol, gel! Kafir, putperest, ateist olsan da gel! Bizim dergahımız umutsuzluk dergahı değil.',
          mediaUrls: [],
          fileUrls: [],
        },
        {
          content:
            "İnsan, aynada kendini görür. Allah'ı görmek isteyen, kendi kalbine baksın.",
          mediaUrls: [],
          fileUrls: [],
        },
      ],
    };

    for (const [scholarId, posts] of Object.entries(scholarPosts)) {
      try {
        // Scholar'ı bul
        const scholar = await this.scholarRepository.findOne({
          where: { id: parseInt(scholarId) },
        });

        if (!scholar) {
          console.log(`⚠️  Scholar not found: ID ${scholarId}`);
          continue;
        }

        // Her post için oluştur
        for (const postData of posts) {
          const post = this.scholarPostRepository.create({
            ...postData,
            scholar: scholar,
            scholarId: parseInt(scholarId),
          });

          await this.scholarPostRepository.save(post);
          console.log(
            `✅ Added post for ${scholar.fullName}: "${postData.content.substring(0, 50)}..."`,
          );
        }
      } catch (error) {
        console.error(
          `❌ Error adding posts for scholar ID ${scholarId}:`,
          error.message,
        );
      }
    }

    console.log('🎉 Scholar posts seeding completed!');
  }
}
