import * as fs from 'fs';
import * as path from 'path';

interface Scholar {
  fullName: string;
  biography: string;
  birthDate?: string;
  birthDateHijri?: string;
  deathDate?: string;
  deathDateHijri?: string;
  sources?: string[];
  rawHeaderLineNum: number;
}

const jsonPath = path.resolve(
  __dirname,
  '../src/data/scholars-v2.json',
);

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const scholars: Scholar[] = data.scholars;

console.log(`Toplam alim: ${scholars.length}\n`);

// ============ BİYOGRAFİ UZUNLUK DAĞILIMI ============
const bins = [
  { max: 500, count: 0, label: '0-500' },
  { max: 1000, count: 0, label: '501-1000' },
  { max: 2000, count: 0, label: '1001-2000' },
  { max: 5000, count: 0, label: '2001-5000' },
  { max: 10000, count: 0, label: '5001-10000' },
  { max: 25000, count: 0, label: '10001-25000' },
  { max: 65000, count: 0, label: '25001-65000 (TEXT sınırı)' },
  { max: Infinity, count: 0, label: '65000+ (LONGTEXT gerekir)' },
];

for (const s of scholars) {
  const len = s.biography.length;
  for (const bin of bins) {
    if (len <= bin.max) {
      bin.count++;
      break;
    }
  }
}

console.log('═══ BİYOGRAFİ UZUNLUK DAĞILIMI (karakter) ═══');
for (const b of bins) {
  const bar = '█'.repeat(Math.round((b.count / scholars.length) * 50));
  console.log(`  ${b.label.padEnd(28)} ${b.count.toString().padStart(5)} ${bar}`);
}

const tooLong = scholars.filter((s) => s.biography.length > 65000);
console.log(`\n65K+ char biyografili alimler (${tooLong.length}):`);
tooLong
  .sort((a, b) => b.biography.length - a.biography.length)
  .slice(0, 20)
  .forEach((s) => {
    console.log(
      `  ${s.biography.length.toString().padStart(7)} char  -  ${s.fullName}`,
    );
  });

// ============ TARİH KAPSAMI ============
const withBirth = scholars.filter((s) => s.birthDate);
const withDeath = scholars.filter((s) => s.deathDate);
const withBoth = scholars.filter((s) => s.birthDate && s.deathDate);
const noDate = scholars.filter((s) => !s.birthDate && !s.deathDate);

console.log(`\n═══ TARİH KAPSAMI ═══`);
console.log(`  Doğum tarihli: ${withBirth.length} / ${scholars.length}`);
console.log(`  Vefat tarihli: ${withDeath.length} / ${scholars.length}`);
console.log(`  Her ikisi de: ${withBoth.length}`);
console.log(`  Hiç tarih yok: ${noDate.length}`);

if (noDate.length > 0 && noDate.length < 30) {
  console.log(`\nTarihsiz alim örnekleri:`);
  noDate.slice(0, 10).forEach((s) => console.log(`  - ${s.fullName}`));
}

// ============ KAYNAK KAPSAMI ============
const withSources = scholars.filter((s) => (s.sources?.length ?? 0) > 0);
const noSources = scholars.filter((s) => !s.sources || s.sources.length === 0);
console.log(`\n═══ KAYNAK KAPSAMI ═══`);
console.log(`  Kaynaklı: ${withSources.length}`);
console.log(`  Kaynaksız: ${noSources.length}`);

if (noSources.length > 0 && noSources.length < 30) {
  console.log(`\nKaynaksız alim örnekleri:`);
  noSources.slice(0, 10).forEach((s) => console.log(`  - ${s.fullName}`));
}

// ============ FAMOUS ALİMLER ============
const famous = [
  'HANÎFE', 'HANEFÎ',
  'GAZÂLÎ', 'GAZALÎ',
  'BUHÂRÎ', 'BUHARÎ',
  'MÜSLİM',
  'EŞ’ARÎ',
  'MÂTÜRÎDÎ',
  'TİRMİZÎ',
  'NESÂÎ',
  'YESEVÎ',
  'ABDÜLKÂDİR GEYLÂN',
  'NAKŞİBEND',
  'BAYEZÎD-İ BİSTÂMÎ',
  'BİRGİVÎ',
  'AKŞEMSEDDÎN',
];

console.log(`\n═══ MEŞHUR ALİMLER (PDF'de var mı?) ═══`);
for (const name of famous) {
  const matches = scholars.filter((s) =>
    s.fullName.toUpperCase().includes(name.toUpperCase()),
  );
  console.log(`  "${name}": ${matches.length} eşleşme`);
  matches.slice(0, 3).forEach((s) => {
    console.log(
      `      → ${s.fullName} (bio: ${s.biography.length} char, dates: ${s.birthDate || '-'}/${s.deathDate || '-'})`,
    );
  });
}

// ============ DUPLICATE BAŞLIK ============
const nameMap = new Map<string, number>();
for (const s of scholars) {
  nameMap.set(s.fullName, (nameMap.get(s.fullName) || 0) + 1);
}
const duplicates = [...nameMap.entries()].filter(([_, c]) => c > 1);
console.log(`\n═══ TEKRARLAYAN BAŞLIK ═══`);
console.log(`  Toplam: ${duplicates.length}`);
duplicates.slice(0, 10).forEach(([n, c]) => console.log(`  ${c}x  ${n}`));

// ============ TOPLAM BOYUT ============
const totalChars = scholars.reduce((sum, s) => sum + s.biography.length, 0);
console.log(`\n═══ TOPLAM BOYUT ═══`);
console.log(`  Toplam karakter: ${totalChars.toLocaleString()}`);
console.log(`  Ortalama: ${Math.round(totalChars / scholars.length)} char/alim`);
console.log(`  JSON dosya boyutu: ${Math.round(fs.statSync(jsonPath).size / 1024 / 1024)} MB`);
