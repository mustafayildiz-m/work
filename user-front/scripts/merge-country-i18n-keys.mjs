/**
 * Adds common.countrySelector, books.untitledBook, articles.countrySelector,
 * podcasts.countrySelector to locale JSON files where missing (merge-only).
 *
 * Usage: node scripts/merge-country-i18n-keys.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, '../src/i18n/messages');

/** @type {Record<string, Record<string, unknown>>} */
const BY_LOCALE = {
  de: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — noch keine Sprache zugewiesen',
        noLanguageShort: '—',
        flagAlt: 'Flagge {country}',
      },
    },
    books: { untitledBook: 'Buch ohne Titel' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} Artikel',
        buttonLabel: '{language} — Artikel anzeigen',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} Podcasts',
        buttonLabel: '{language} — Podcasts anhören',
        availableLine: '{count} Podcasts verfügbar',
      },
    },
  },
  fr: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — aucune langue attribuée pour le moment',
        noLanguageShort: '—',
        flagAlt: 'Drapeau {country}',
      },
    },
    books: { untitledBook: 'Livre sans titre' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} articles',
        buttonLabel: '{language} — voir les articles',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcasts',
        buttonLabel: '{language} — écouter les podcasts',
        availableLine: '{count} podcasts disponibles',
      },
    },
  },
  es: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — aún no hay idioma asignado',
        noLanguageShort: '—',
        flagAlt: 'Bandera de {country}',
      },
    },
    books: { untitledBook: 'Libro sin título' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} artículos',
        buttonLabel: '{language} — ver artículos',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcasts',
        buttonLabel: '{language} — escuchar podcasts',
        availableLine: '{count} podcasts disponibles',
      },
    },
  },
  it: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — nessuna lingua assegnata',
        noLanguageShort: '—',
        flagAlt: 'Bandiera {country}',
      },
    },
    books: { untitledBook: 'Libro senza titolo' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} articoli',
        buttonLabel: '{language} — vedi articoli',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcast',
        buttonLabel: '{language} — ascolta i podcast',
        availableLine: '{count} podcast disponibili',
      },
    },
  },
  pt: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — ainda sem idioma atribuído',
        noLanguageShort: '—',
        flagAlt: 'Bandeira {country}',
      },
    },
    books: { untitledBook: 'Livro sem título' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} artigos',
        buttonLabel: '{language} — ver artigos',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcasts',
        buttonLabel: '{language} — ouvir podcasts',
        availableLine: '{count} podcasts disponíveis',
      },
    },
  },
  ar: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — لم يُعيَّن لغة بعد',
        noLanguageShort: '—',
        flagAlt: 'علم {country}',
      },
    },
    books: { untitledBook: 'كتاب بلا عنوان' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} مقال',
        buttonLabel: '{language} — عرض المقالات',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} بودكاست',
        buttonLabel: '{language} — الاستماع إلى البودكاست',
        availableLine: '{count} بودكاست متوفرة',
      },
    },
  },
  ru: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — язык пока не назначен',
        noLanguageShort: '—',
        flagAlt: 'Флаг {country}',
      },
    },
    books: { untitledBook: 'Без названия' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} статей',
        buttonLabel: '{language} — смотреть статьи',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} подкастов',
        buttonLabel: '{language} — слушать подкасты',
        availableLine: 'Доступно подкастов: {count}',
      },
    },
  },
  uk: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — мову ще не призначено',
        noLanguageShort: '—',
        flagAlt: 'Прапор {country}',
      },
    },
    books: { untitledBook: 'Без назви' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} статей',
        buttonLabel: '{language} — переглянути статті',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} подкастів',
        buttonLabel: '{language} — слухати подкасти',
        availableLine: 'Доступно подкастів: {count}',
      },
    },
  },
  pl: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — jeszcze nie przypisano języka',
        noLanguageShort: '—',
        flagAlt: 'Flaga {country}',
      },
    },
    books: { untitledBook: 'Książka bez tytułu' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} artykułów',
        buttonLabel: '{language} — zobacz artykuły',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcastów',
        buttonLabel: '{language} — słuchaj podcastów',
        availableLine: 'Dostępnych podcastów: {count}',
      },
    },
  },
  cs: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — zatím není přiřazen jazyk',
        noLanguageShort: '—',
        flagAlt: 'Vlajka {country}',
      },
    },
    books: { untitledBook: 'Bez názvu' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} článků',
        buttonLabel: '{language} — zobrazit články',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcastů',
        buttonLabel: '{language} — poslouchat podcasty',
        availableLine: 'K dispozici podcastů: {count}',
      },
    },
  },
  sk: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — zatiaľ nie je priradený jazyk',
        noLanguageShort: '—',
        flagAlt: 'Vlajka {country}',
      },
    },
    books: { untitledBook: 'Bez názvu' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} článkov',
        buttonLabel: '{language} — zobraziť články',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcastov',
        buttonLabel: '{language} — počúvať podcasty',
        availableLine: 'K dispozícii podcastov: {count}',
      },
    },
  },
  sl: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — jezik še ni dodeljen',
        noLanguageShort: '—',
        flagAlt: 'Zastava {country}',
      },
    },
    books: { untitledBook: 'Brez naslova' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} člankov',
        buttonLabel: '{language} — ogled člankov',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcastov',
        buttonLabel: '{language} — poslušaj podcaste',
        availableLine: 'Na voljo podcastov: {count}',
      },
    },
  },
  hu: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — még nincs nyelv hozzárendelve',
        noLanguageShort: '—',
        flagAlt: '{country} zászlaja',
      },
    },
    books: { untitledBook: 'Cím nélküli könyv' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} cikk',
        buttonLabel: '{language} — cikkek megtekintése',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcast',
        buttonLabel: '{language} — podcastok hallgatása',
        availableLine: '{count} podcast érhető el',
      },
    },
  },
  ro: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — încă nu este atribuită o limbă',
        noLanguageShort: '—',
        flagAlt: 'Steagul {country}',
      },
    },
    books: { untitledBook: 'Carte fără titlu' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} articole',
        buttonLabel: '{language} — vezi articolele',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcasturi',
        buttonLabel: '{language} — ascultă podcasturi',
        availableLine: '{count} podcasturi disponibile',
      },
    },
  },
  bg: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — все още няма зададен език',
        noLanguageShort: '—',
        flagAlt: 'Флаг на {country}',
      },
    },
    books: { untitledBook: 'Книга без заглавие' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} статии',
        buttonLabel: '{language} — виж статии',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} подкаста',
        buttonLabel: '{language} — слушай подкасти',
        availableLine: 'Налични подкасти: {count}',
      },
    },
  },
  sr: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — jezik još nije dodeljen',
        noLanguageShort: '—',
        flagAlt: 'Zastava {country}',
      },
    },
    books: { untitledBook: 'Knjiga bez naslova' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} članaka',
        buttonLabel: '{language} — pogledaj članke',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podkasta',
        buttonLabel: '{language} — slušaj podkaste',
        availableLine: 'Dostupno podkasta: {count}',
      },
    },
  },
  mk: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — сè уште нема доделен јазик',
        noLanguageShort: '—',
        flagAlt: 'Знаме на {country}',
      },
    },
    books: { untitledBook: 'Книга без наслов' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} написи',
        buttonLabel: '{language} — види написи',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} подкасти',
        buttonLabel: '{language} — слушај подкасти',
        availableLine: 'Достапни подкасти: {count}',
      },
    },
  },
  hy: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — լեզու դեռ չի նշված',
        noLanguageShort: '—',
        flagAlt: '{country} դրոշ',
      },
    },
    books: { untitledBook: 'Անանուն գիրք' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} հոդված',
        buttonLabel: '{language} — դիտել հոդվածները',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} փոդքասթ',
        buttonLabel: '{language} — լսել փոդքասթները',
        availableLine: 'Հասանելի է {count} փոդքասթ',
      },
    },
  },
  ku: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — hîna ziman ne hatiye girêdan',
        noLanguageShort: '—',
        flagAlt: 'Alaya {country}',
      },
    },
    books: { untitledBook: 'Pirtûkê bê sernav' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} gotar',
        buttonLabel: '{language} — gotaran bibîne',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} podcast',
        buttonLabel: '{language} — podcastan guh bide',
        availableLine: '{count} podcast hene',
      },
    },
  },
  zh: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — 尚未分配语言',
        noLanguageShort: '—',
        flagAlt: '{country}国旗',
      },
    },
    books: { untitledBook: '无标题图书' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} 篇文章',
        buttonLabel: '{language} — 查看文章',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} 个播客',
        buttonLabel: '{language} — 收听播客',
        availableLine: '有 {count} 个播客可用',
      },
    },
  },
  ja: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — 言語がまだ設定されていません',
        noLanguageShort: '—',
        flagAlt: '{country}の国旗',
      },
    },
    books: { untitledBook: 'タイトルなし' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} 件の記事',
        buttonLabel: '{language} — 記事を見る',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} 件のポッドキャスト',
        buttonLabel: '{language} — ポッドキャストを聴く',
        availableLine: '利用可能：{count} 件のポッドキャスト',
      },
    },
  },
  ko: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — 아직 언어가 지정되지 않았습니다',
        noLanguageShort: '—',
        flagAlt: '{country} 국기',
      },
    },
    books: { untitledBook: '제목 없는 도서' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count}개 글',
        buttonLabel: '{language} — 글 보기',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count}개 팟캐스트',
        buttonLabel: '{language} — 팟캐스트 듣기',
        availableLine: '이용 가능한 팟캐스트 {count}개',
      },
    },
  },
  hi: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — अभी तक कोई भाषा असाइन नहीं है',
        noLanguageShort: '—',
        flagAlt: '{country} का झंडा',
      },
    },
    books: { untitledBook: 'शीर्षकहीन पुस्तक' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} लेख',
        buttonLabel: '{language} — लेख देखें',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} पॉडकास्ट',
        buttonLabel: '{language} — पॉडकास्ट सुनें',
        availableLine: '{count} पॉडकास्ट उपलब्ध हैं',
      },
    },
  },
  te: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — ఇంకా భాష కేటాయించబడలేదు',
        noLanguageShort: '—',
        flagAlt: '{country} జండా',
      },
    },
    books: { untitledBook: 'శీర్షిక లేని పుస్తకం' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} వ్యాసాలు',
        buttonLabel: '{language} — వ్యాసాలను చూడండి',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} పాడ్‌కాస్ట్‌లు',
        buttonLabel: '{language} — పాడ్‌కాస్ట్‌లు వినండి',
        availableLine: '{count} పాడ్‌కాస్ట్‌లు అందుబాటులో ఉన్నాయి',
      },
    },
  },
  kn: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — ಇನ್ನೂ ಭಾಷೆಯನ್ನು ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ',
        noLanguageShort: '—',
        flagAlt: '{country} ಧ್ವಜ',
      },
    },
    books: { untitledBook: 'ಶೀರ್ಷಿಕೆ ರಹಿತ ಪುಸ್ತಕ' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} ಲೇಖನಗಳು',
        buttonLabel: '{language} — ಲೇಖನಗಳನ್ನು ನೋಡಿ',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} ಪಾಡ್ಕಾಸ್ಟ್‌ಗಳು',
        buttonLabel: '{language} — ಪಾಡ್ಕಾಸ್ಟ್‌ಗಳನ್ನು ಕೇಳಿ',
        availableLine: '{count} ಪಾಡ್ಕಾಸ್ಟ್‌ಗಳು ಲಭ್ಯವಿದೆ',
      },
    },
  },
  ml: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — ഭാഷ ഇതുവരെ നിയോഗിച്ചിട്ടില്ല',
        noLanguageShort: '—',
        flagAlt: '{country} പതാക',
      },
    },
    books: { untitledBook: 'ശീർഷകമില്ലാത്ത പുസ്തകം' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} ലേഖനങ്ങൾ',
        buttonLabel: '{language} — ലേഖനങ്ങൾ കാണുക',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} പോഡ്‌ക്കാസ്റ്റുകൾ',
        buttonLabel: '{language} — പോഡ്‌ക്കാസ്റ്റുകൾ കേൾക്കുക',
        availableLine: '{count} പോഡ്‌ക്കാസ്റ്റുകൾ ലഭ്യമാണ്',
      },
    },
  },
  mr: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — अद्याप भाषा नियुक्त केलेली नाही',
        noLanguageShort: '—',
        flagAlt: '{country} ध्वज',
      },
    },
    books: { untitledBook: 'शीर्षक नसलेले पुस्तक' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} लेख',
        buttonLabel: '{language} — लेख पहा',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} पॉडकास्ट',
        buttonLabel: '{language} — पॉडकास्ट ऐका',
        availableLine: '{count} पॉडकास्ट उपलब्ध आहेत',
      },
    },
  },
  gu: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — હજુ સુધી ભાષા સોંપાઈ નથી',
        noLanguageShort: '—',
        flagAlt: '{country} નો ધ્વજ',
      },
    },
    books: { untitledBook: 'શીર્ષક વગરનું પુસ્તક' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} લેખો',
        buttonLabel: '{language} — લેખ જુઓ',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} પોડકાસ્ટ',
        buttonLabel: '{language} — પોડકાસ્ટ સાંભળો',
        availableLine: '{count} પોડકાસ્ટ ઉપલબ્ધ છે',
      },
    },
  },
  or: {
    common: {
      countrySelector: {
        tooltipNoLanguage: '{country} — ଏ ପର୍ଯ୍ୟନ୍ତ ଭାଷା ନିର୍ଦ୍ଧିଷ୍ଟ ହୋଇନାହିଁ',
        noLanguageShort: '—',
        flagAlt: '{country}ର ପତାକା',
      },
    },
    books: { untitledBook: 'ଶିରୋନାମାହିନ ବହି' },
    articles: {
      countrySelector: {
        itemsCountPhrase: '{count} ପ୍ରବନ୍ଧ',
        buttonLabel: '{language} — ପ୍ରବନ୍ଧ ଦେଖନ୍ତୁ',
      },
    },
    podcasts: {
      countrySelector: {
        itemsCountPhrase: '{count} ପଡ୍‌କାଷ୍ଟ',
        buttonLabel: '{language} — ପଡ୍‌କାଷ୍ଟ ଶୁଣନ୍ତୁ',
        availableLine: '{count} ପଡ୍‌କାଷ୍ଟ ଉପଲବ୍ଧ ଅଛି',
      },
    },
  },
};

const EN_FALLBACK = {
  common: {
    countrySelector: {
      tooltipNoLanguage: '{country} — no language assigned yet',
      noLanguageShort: '—',
      flagAlt: '{country} flag',
    },
  },
  books: { untitledBook: 'Untitled book' },
  articles: {
    countrySelector: {
      itemsCountPhrase: '{count} articles',
      buttonLabel: '{language} — view articles',
    },
  },
  podcasts: {
    countrySelector: {
      itemsCountPhrase: '{count} podcasts',
      buttonLabel: '{language} — listen to podcasts',
      availableLine: '{count} podcasts available',
    },
  },
};

/** Merge `patch` into `target` only for keys that are missing (shallow + recurse objects). */
function mergeMissing(target, patch) {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) return;
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    if (!(key in target)) {
      target[key] =
        pv !== null && typeof pv === 'object' && !Array.isArray(pv)
          ? JSON.parse(JSON.stringify(pv))
          : pv;
      continue;
    }
    const tv = target[key];
    if (
      pv !== null &&
      typeof pv === 'object' &&
      !Array.isArray(pv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      mergeMissing(tv, pv);
    }
  }
}

const files = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'));
let updated = 0;
for (const file of files) {
  const code = path.basename(file, '.json');
  if (code === 'en' || code === 'tr') continue;

  const full = path.join(MESSAGES_DIR, file);
  const raw = fs.readFileSync(full, 'utf8');
  const data = JSON.parse(raw);
  const patch = BY_LOCALE[code] ?? EN_FALLBACK;

  const before = JSON.stringify(data);
  mergeMissing(data, patch);
  if (JSON.stringify(data) !== before) {
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8');
    updated++;
  }
}

console.log(`merge-country-i18n-keys: updated ${updated} locale file(s); skipped en, tr`);
