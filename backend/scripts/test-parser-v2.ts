import * as path from 'path';
import { parseScholarsPDF } from '../src/services/scholars-pdf-parser-v2';

const TARGETS = [
  'SADREDDÎN BEKRÎ', // Bizim test alimimiz
  'İMAM EBU HANİFE',
  'İMÂM-I AZAM',
  'GAZALİ',
  'ABDÜLKADİR GEYLÂNÎ',
  'AHMED YESEVÎ',
  'MEVLÂNÂ CELÂLEDDÎN',
  'EBU HANİFE',
  'BUHARİ',
  'SADREDDÎN-İ KONEVÎ',
];

async function main() {
  const pdfPath = path.resolve(__dirname, '../../islam_alimleri.pdf');

  console.log(`🚀 Parser V2 test başlıyor: ${pdfPath}\n`);

  const result = await parseScholarsPDF(pdfPath);

  console.log(`📊 PARSE İSTATİSTİKLERİ:`);
  console.log(`   Toplam başlık: ${result.stats.totalHeaders}`);
  console.log(`   Kabul: ${result.stats.accepted}`);
  console.log(`   Red: ${result.stats.rejected}`);
  console.log(`   Red sebepleri:`, result.stats.rejectedReasons);
  console.log('');

  // Hedef alimleri bul
  for (const target of TARGETS) {
    const found = result.scholars.find((s) =>
      s.fullName.toUpperCase().includes(target.toUpperCase()),
    );

    if (!found) {
      console.log(`❌ BULUNAMADI: ${target}`);
      continue;
    }

    console.log('═'.repeat(80));
    console.log(`📖 ${found.fullName}`);
    console.log('═'.repeat(80));
    console.log(`📅 Doğum:  ${found.birthDateHijri ?? '-'} h (m. ${found.birthDate ?? '-'})`);
    console.log(`💀 Vefât:  ${found.deathDateHijri ?? '-'} h (m. ${found.deathDate ?? '-'})`);
    console.log(`📚 Kaynak sayısı: ${found.sources?.length ?? 0}`);
    console.log(`📝 Biyografi (${found.biography.length} char):`);
    console.log('');
    // İlk 800 karakter
    const preview = found.biography.substring(0, 1500);
    console.log(preview);
    if (found.biography.length > 1500) {
      console.log(`\n... [+${found.biography.length - 1500} karakter daha]`);
    }
    console.log('');
  }
}

main().catch(console.error);
