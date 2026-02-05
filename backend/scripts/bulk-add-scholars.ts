import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScholarsService } from '../src/scholars/scholars.service';
import { CreateScholarDto } from '../src/scholars/dto/create-scholar.dto';

// Toplu âlim ekleme script'i
async function bulkAddScholars() {
  console.log('📚 Toplu Âlim Ekleme Script\'i Başlatılıyor...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const scholarsService = app.get(ScholarsService);

  // Eklenecek âlimler listesi
  const scholarsToAdd: CreateScholarDto[] = [
    {
      fullName: 'İMÂM-I EŞ\'ARÎ',
      lineage: 'Ebû\'l-Hasen el-Eşʿarî, (Ebu\'l-Hasan Ali bin İsmail el-Eşarî)',
      birthDate: '260',
      deathDate: '324',
      biography: 'Ehl-i sünnet kelamının kurucularından. Tam adı Ebû\'l-Hasen Ali bin İsmail el-Eşʿarî (rh.). Basra\'da doğdu, Bağdat\'ta vefat etti. Mu\'tezile\'den Ehl-i sünnete rücû etti. Eş\'arîlik mezhebinin imamıdır. El-İbane, Makalâtü\'l-İslâmiyyîn gibi eserleri meşhurdur.',
      photoUrl: 'uploads/coverImage/coverImage.jpg',
      coverImage: 'uploads/coverImage/coverImage.jpg',
      locationName: 'Basra → Bağdat'
    },
    {
      fullName: 'İMÂM-I MÂTURÎDÎ',
      lineage: 'Ebû Mansûr el-Mâturîdî (Muhammed bin Muhammed bin Mahmûd)',
      birthDate: '280',
      deathDate: '333',
      biography: 'Ehl-i sünnet kelamının büyük imamlarından. Semerkand\'da doğdu ve vefat etti. Mâturîdîlik mezhebinin kurucusu. Kitâbü\'t-Tevhîd, Te\'vîlâtü\'l-Kur\'ân gibi eserleri meşhurdur.',
      photoUrl: 'uploads/coverImage/coverImage.jpg',
      coverImage: 'uploads/coverImage/coverImage.jpg',
      locationName: 'Semerkand'
    },
    {
      fullName: 'İMÂM-I GAZÂLÎ',
      lineage: 'Ebû Hâmid Muhammed bin Muhammed el-Gazâlî',
      birthDate: '450',
      deathDate: '505',
      biography: 'İslam düşüncesinin en büyük âlimlerinden. Tus\'ta doğdu, aynı yerde vefat etti. İhyâu Ulûmi\'d-Dîn, Kimyâ-yı Saâdet gibi eserleri meşhurdur. "Hüccetü\'l-İslâm" lakabıyla anılır.',
      photoUrl: 'uploads/coverImage/coverImage.jpg',
      coverImage: 'uploads/coverImage/coverImage.jpg',
      locationName: 'Tus'
    },
    {
      fullName: 'İMÂM-I RABBÂNÎ',
      lineage: 'Ahmed bin Abdülehad es-Serhendî (Müceddid-i Elf-i Sânî)',
      birthDate: '971',
      deathDate: '1034',
      biography: 'Nakşibendî tarikatının büyük imamı. Serhend\'de doğdu ve vefat etti. Mektûbât, Reddü\'r-Râfizî gibi eserleri meşhurdur. "Müceddid-i Elf-i Sânî" lakabıyla anılır.',
      photoUrl: 'uploads/coverImage/coverImage.jpg',
      coverImage: 'uploads/coverImage/coverImage.jpg',
      locationName: 'Serhend'
    },
    {
      fullName: 'İMÂM-I BİRGİVÎ',
      lineage: 'Muhammed bin Pîr Ali el-Birgivî',
      birthDate: '929',
      deathDate: '981',
      biography: 'Osmanlı döneminin büyük âlimlerinden. Balıkesir\'de doğdu ve vefat etti. Tarîkat-ı Muhammediyye, Vasiyetnâme gibi eserleri meşhurdur.',
      photoUrl: 'uploads/coverImage/coverImage.jpg',
      coverImage: 'uploads/coverImage/coverImage.jpg',
      locationName: 'Balıkesir'
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  console.log(`📝 ${scholarsToAdd.length} âlim ekleniyor...`);

  for (const scholarData of scholarsToAdd) {
    try {
      // Mevcut âlimi kontrol et
      const existingScholars = await scholarsService.findAll();
      const exists = existingScholars.some(s => 
        s.fullName.toLowerCase().trim() === scholarData.fullName.toLowerCase().trim()
      );

      if (exists) {
        console.log(`⏭️ Atlandı: ${scholarData.fullName} (zaten mevcut)`);
        continue;
      }

      const created = await scholarsService.create(scholarData);
      console.log(`✅ Eklendi: ${created.fullName} (ID: ${created.id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Hata: ${scholarData.fullName} - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Sonuçlar:`);
  console.log(`   ✅ Başarılı: ${successCount} âlim`);
  console.log(`   ❌ Hatalı: ${errorCount} âlim`);

  // Toplam sayıyı kontrol et
  const finalCount = await scholarsService.findAll();
  console.log(`📈 Veritabanındaki toplam âlim sayısı: ${finalCount.length}`);

  console.log('\n✅ Toplu ekleme işlemi tamamlandı!');
  await app.close();
}

bulkAddScholars().catch(console.error);
