#!/usr/bin/env node
/**
 * Updates menu.qa and qa.* keys in all user-front locale files.
 */
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../user-front/src/i18n/messages');

const QA_I18N = {
  tr: { menu: 'Soru-Cevap', title: 'Soru & Cevap', subtitle: 'Aradığınız soruların cevaplarını bulun', searchPlaceholder: 'Soru veya anahtar kelime arayın...', allCategories: 'Tümü', noResults: 'Bu dilde henüz soru-cevap bulunmamaktadır.', loadMore: 'Daha Fazla Göster', loading: 'Yükleniyor...', results: 'sonuç', errorLoading: 'Veriler yüklenemedi.' },
  en: { menu: 'Q&A', title: 'Questions & Answers', subtitle: 'Find answers to your questions', searchPlaceholder: 'Search for a question or keyword...', allCategories: 'All', noResults: 'No questions found in this language yet.', loadMore: 'Load More', loading: 'Loading...', results: 'results', errorLoading: 'Failed to load data.' },
  ar: { menu: 'سؤال وجواب', title: 'أسئلة وأجوبة', subtitle: 'ابحث عن إجابات لأسئلتك', searchPlaceholder: 'ابحث عن سؤال أو كلمة مفتاحية...', allCategories: 'الكل', noResults: 'لا توجد أسئلة بهذه اللغة بعد.', loadMore: 'عرض المزيد', loading: 'جاري التحميل...', results: 'نتيجة', errorLoading: 'تعذر تحميل البيانات.' },
  de: { menu: 'Fragen & Antworten', title: 'Fragen & Antworten', subtitle: 'Finden Sie Antworten auf Ihre Fragen', searchPlaceholder: 'Frage oder Stichwort suchen...', allCategories: 'Alle', noResults: 'In dieser Sprache wurden noch keine Fragen gefunden.', loadMore: 'Mehr laden', loading: 'Laden...', results: 'Ergebnisse', errorLoading: 'Daten konnten nicht geladen werden.' },
  fr: { menu: 'Questions-Réponses', title: 'Questions & Réponses', subtitle: 'Trouvez les réponses à vos questions', searchPlaceholder: 'Rechercher une question ou un mot-clé...', allCategories: 'Tous', noResults: 'Aucune question dans cette langue pour le moment.', loadMore: 'Charger plus', loading: 'Chargement...', results: 'résultats', errorLoading: 'Impossible de charger les données.' },
  es: { menu: 'Preguntas y respuestas', title: 'Preguntas y respuestas', subtitle: 'Encuentra respuestas a tus preguntas', searchPlaceholder: 'Buscar pregunta o palabra clave...', allCategories: 'Todos', noResults: 'Aún no hay preguntas en este idioma.', loadMore: 'Cargar más', loading: 'Cargando...', results: 'resultados', errorLoading: 'No se pudieron cargar los datos.' },
  it: { menu: 'Domande e risposte', title: 'Domande e risposte', subtitle: 'Trova risposte alle tue domande', searchPlaceholder: 'Cerca una domanda o parola chiave...', allCategories: 'Tutti', noResults: 'Nessuna domanda in questa lingua.', loadMore: 'Carica altro', loading: 'Caricamento...', results: 'risultati', errorLoading: 'Impossibile caricare i dati.' },
  pt: { menu: 'Perguntas e respostas', title: 'Perguntas e respostas', subtitle: 'Encontre respostas para suas perguntas', searchPlaceholder: 'Pesquisar pergunta ou palavra-chave...', allCategories: 'Todos', noResults: 'Ainda não há perguntas neste idioma.', loadMore: 'Carregar mais', loading: 'Carregando...', results: 'resultados', errorLoading: 'Falha ao carregar os dados.' },
  ru: { menu: 'Вопросы и ответы', title: 'Вопросы и ответы', subtitle: 'Найдите ответы на ваши вопросы', searchPlaceholder: 'Поиск вопроса или ключевого слова...', allCategories: 'Все', noResults: 'На этом языке пока нет вопросов.', loadMore: 'Загрузить ещё', loading: 'Загрузка...', results: 'результатов', errorLoading: 'Не удалось загрузить данные.' },
  ja: { menu: 'Q&A', title: '質問と回答', subtitle: '質問への回答を見つけましょう', searchPlaceholder: '質問またはキーワードを検索...', allCategories: 'すべて', noResults: 'この言語の質問はまだありません。', loadMore: 'もっと見る', loading: '読み込み中...', results: '件', errorLoading: 'データの読み込みに失敗しました。' },
  zh: { menu: '问答', title: '问答', subtitle: '查找您问题的答案', searchPlaceholder: '搜索问题或关键词...', allCategories: '全部', noResults: '此语言暂无问答内容。', loadMore: '加载更多', loading: '加载中...', results: '条结果', errorLoading: '数据加载失败。' },
  ko: { menu: 'Q&A', title: '질문과 답변', subtitle: '궁금한 점에 대한 답변을 찾아보세요', searchPlaceholder: '질문 또는 키워드 검색...', allCategories: '전체', noResults: '이 언어로 된 질문이 아직 없습니다.', loadMore: '더 보기', loading: '로딩 중...', results: '개 결과', errorLoading: '데이터를 불러오지 못했습니다.' },
  hi: { menu: 'प्रश्नोत्तर', title: 'प्रश्न और उत्तर', subtitle: 'अपने प्रश्नों के उत्तर खोजें', searchPlaceholder: 'प्रश्न या कीवर्ड खोजें...', allCategories: 'सभी', noResults: 'इस भाषा में अभी कोई प्रश्न नहीं है।', loadMore: 'और देखें', loading: 'लोड हो रहा है...', results: 'परिणाम', errorLoading: 'डेटा लोड नहीं हो सका।' },
  uk: { menu: 'Питання та відповіді', title: 'Питання та відповіді', subtitle: 'Знайдіть відповіді на свої запитання', searchPlaceholder: 'Пошук питання або ключового слова...', allCategories: 'Усі', noResults: 'Цією мовою ще немає питань.', loadMore: 'Завантажити ще', loading: 'Завантаження...', results: 'результатів', errorLoading: 'Не вдалося завантажити дані.' },
  ku: { menu: 'Pirs û Bersiv', title: 'Pirs û Bersiv', subtitle: 'Bersivên pirsgirêkên xwe bibînin', searchPlaceholder: 'Pirs an bihayekî lêgerîn...', allCategories: 'Hemû', noResults: 'Bi vî zimanî hê pirs tune ne.', loadMore: 'Zêdetir nîşan bide', loading: 'Tê barkirin...', results: 'encam', errorLoading: 'Daneyên nehatin barkirin.' },
  ro: { menu: 'Întrebări și răspunsuri', title: 'Întrebări și răspunsuri', subtitle: 'Găsiți răspunsuri la întrebările dvs.', searchPlaceholder: 'Căutați o întrebare sau cuvânt cheie...', allCategories: 'Toate', noResults: 'Nu există încă întrebări în această limbă.', loadMore: 'Încarcă mai mult', loading: 'Se încarcă...', results: 'rezultate', errorLoading: 'Datele nu au putut fi încărcate.' },
  bg: { menu: 'Въпроси и отговори', title: 'Въпроси и отговори', subtitle: 'Намерете отговори на вашите въпроси', searchPlaceholder: 'Търсене на въпрос или ключова дума...', allCategories: 'Всички', noResults: 'Все още няма въпроси на този език.', loadMore: 'Зареди още', loading: 'Зареждане...', results: 'резултата', errorLoading: 'Данните не можаха да бъдат заредени.' },
  sr: { menu: 'Питања и одговори', title: 'Питања и одговори', subtitle: 'Пronađite odgovore na svoja pitanja', searchPlaceholder: 'Pretražite pitanje ili ključnu reč...', allCategories: 'Sve', noResults: 'Još nema pitanja na ovom jeziku.', loadMore: 'Učitaj više', loading: 'Učitavanje...', results: 'rezultata', errorLoading: 'Podaci nisu učitani.' },
  hu: { menu: 'Kérdések és válaszok', title: 'Kérdések és válaszok', subtitle: 'Találja meg kérdéseire a válaszokat', searchPlaceholder: 'Kérdés vagy kulcsszó keresése...', allCategories: 'Összes', noResults: 'Ezen a nyelven még nincsenek kérdések.', loadMore: 'Továbbiak', loading: 'Betöltés...', results: 'eredmény', errorLoading: 'Az adatok betöltése sikertelen.' },
  cs: { menu: 'Otázky a odpovědi', title: 'Otázky a odpovědi', subtitle: 'Najděte odpovědi na své otázky', searchPlaceholder: 'Hledat otázku nebo klíčové slovo...', allCategories: 'Vše', noResults: 'V tomto jazyce zatím nejsou žádné otázky.', loadMore: 'Načíst více', loading: 'Načítání...', results: 'výsledků', errorLoading: 'Data se nepodařilo načíst.' },
  pl: { menu: 'Pytania i odpowiedzi', title: 'Pytania i odpowiedzi', subtitle: 'Znajdź odpowiedzi na swoje pytania', searchPlaceholder: 'Szukaj pytania lub słowa kluczowego...', allCategories: 'Wszystkie', noResults: 'Brak pytań w tym języku.', loadMore: 'Załaduj więcej', loading: 'Ładowanie...', results: 'wyników', errorLoading: 'Nie udało się załadować danych.' },
  sk: { menu: 'Otázky a odpovede', title: 'Otázky a odpovede', subtitle: 'Nájdite odpovede na svoje otázky', searchPlaceholder: 'Hľadať otázku alebo kľúčové slovo...', allCategories: 'Všetko', noResults: 'V tomto jazyku zatiaľ nie sú otázky.', loadMore: 'Načítať viac', loading: 'Načítava sa...', results: 'výsledkov', errorLoading: 'Údaje sa nepodarilo načítať.' },
  sl: { menu: 'Vprašanja in odgovori', title: 'Vprašanja in odgovori', subtitle: 'Poiščite odgovore na svoja vprašanja', searchPlaceholder: 'Iskanje vprašanja ali ključne besede...', allCategories: 'Vse', noResults: 'V tem jeziku še ni vprašanj.', loadMore: 'Naloži več', loading: 'Nalaganje...', results: 'rezultatov', errorLoading: 'Podatkov ni bilo mogoče naložiti.' },
  mk: { menu: 'Прашања и одговори', title: 'Прашања и одговори', subtitle: 'Најдете одговори на вашите прашања', searchPlaceholder: 'Пребарајте прашање или клучен збор...', allCategories: 'Сите', noResults: 'Сè уште нема прашања на овој јазик.', loadMore: 'Вчитај повеќе', loading: 'Се вчитува...', results: 'резултати', errorLoading: 'Податоците не можеа да се вчитаат.' },
  hy: { menu: 'Հարց ու պատասխան', title: 'Հարց ու պատասխան', subtitle: 'Գտեք պատասխաններ ձեր հարցերին', searchPlaceholder: 'Որոնել հարց կամ բանալի բառ...', allCategories: 'Բոլորը', noResults: 'Այս լեզվով դեռ հարցեր չկան։', loadMore: 'Բեռնել ավելին', loading: 'Բեռնվում է...', results: 'արդյունք', errorLoading: 'Տվյալները չհաջողվեց բեռնել։' },
  mr: { menu: 'प्रश्नोत्तरे', title: 'प्रश्न आणि उत्तरे', subtitle: 'आपल्या प्रश्नांची उत्तरे शोधा', searchPlaceholder: 'प्रश्न किंवा कीवर्ड शोधा...', allCategories: 'सर्व', noResults: 'या भाषेत अद्याप प्रश्न नाहीत.', loadMore: 'अजून दाखवा', loading: 'लोड होत आहे...', results: 'निकाल', errorLoading: 'डेटा लोड होऊ शकला नाही.' },
  te: { menu: 'ప్రశ్నోత్తరాలు', title: 'ప్రశ్నలు & సమాధానాలు', subtitle: 'మీ ప్రశ్నలకు సమాధానాలు కనుగొనండి', searchPlaceholder: 'ప్రశ్న లేదా కీవర్డ్ వెతకండి...', allCategories: 'అన్నీ', noResults: 'ఈ భాషలో ఇంకా ప్రశ్నలు లేవు.', loadMore: 'మరిన్ని చూపించు', loading: 'లోడ్ అవుతోంది...', results: 'ఫలితాలు', errorLoading: 'డేటా లోడ్ కాలేదు.' },
  gu: { menu: 'પ્રશ્નોત્તર', title: 'પ્રશ્નો અને જવાબો', subtitle: 'તમારા પ્રશ્નોના જવાબ શોધો', searchPlaceholder: 'પ્રશ્ન અથવા કીવર્ડ શોધો...', allCategories: 'બધા', noResults: 'આ ભાષામાં હજુ પ્રશ્નો નથી.', loadMore: 'વધુ લોડ કરો', loading: 'લોડ થઈ રહ્યું છે...', results: 'પરિણામો', errorLoading: 'ડેટા લોડ થઈ શક્યો નહીં.' },
  ml: { menu: 'ചോദ്യോത്തരങ്ങൾ', title: 'ചോദ്യങ്ങളും ഉത്തരങ്ങളും', subtitle: 'നിങ്ങളുടെ ചോദ്യങ്ങൾക്കുള്ള ഉത്തരങ്ങൾ കണ്ടെത്തുക', searchPlaceholder: 'ചോദ്യം അല്ലെങ്കിൽ കീവേഡ് തിരയുക...', allCategories: 'എല്ലാം', noResults: 'ഈ ഭാഷയിൽ ഇതുവരെ ചോദ്യങ്ങളില്ല.', loadMore: 'കൂടുതൽ കാണിക്കുക', loading: 'ലോഡ് ചെയ്യുന്നു...', results: 'ഫലങ്ങൾ', errorLoading: 'ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.' },
  kn: { menu: 'ಪ್ರಶ್ನೋತ್ತರ', title: 'ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಉತ್ತರಗಳು', subtitle: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳ ಉತ್ತರಗಳನ್ನು ಹುಡುಕಿ', searchPlaceholder: 'ಪ್ರಶ್ನೆ ಅಥವಾ ಕೀವರ್ಡ್ ಹುಡುಕಿ...', allCategories: 'ಎಲ್ಲಾ', noResults: 'ಈ ಭಾಷೆಯಲ್ಲಿ ಇನ್ನೂ ಪ್ರಶ್ನೆಗಳಿಲ್ಲ.', loadMore: 'ಇನ್ನಷ್ಟು ತೋರಿಸಿ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', results: 'ಫಲಿತಾಂಶಗಳು', errorLoading: 'ಡೇಟಾ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' },
  or: { menu: 'ପ୍ରଶ୍ନୋତ୍ତର', title: 'ପ୍ରଶ୍ନ ଏବଂ ଉତ୍ତର', subtitle: 'ଆପଣଙ୍କ ପ୍ରଶ୍ନର ଉତ୍ତର ଖୋଜନ୍ତୁ', searchPlaceholder: 'ପ୍ରଶ୍ନ କିମ୍ବା କୀୱର୍ଡ ଖୋଜନ୍ତୁ...', allCategories: 'ସବୁ', noResults: 'ଏହି ଭାଷାରେ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ପ୍ରଶ୍ନ ନାହିଁ।', loadMore: 'ଅଧିକ ଦେଖାନ୍ତୁ', loading: 'ଲୋଡ୍ ହେଉଛି...', results: 'ଫଳାଫଳ', errorLoading: 'ଡାଟା ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।' },
};

const files = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const locale = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf8'));
  const qa = QA_I18N[locale] || QA_I18N.en;

  if (!data.menu) data.menu = {};
  data.menu.qa = qa.menu;

  data.qa = {
    title: qa.title,
    subtitle: qa.subtitle,
    searchPlaceholder: qa.searchPlaceholder,
    allCategories: qa.allCategories,
    noResults: qa.noResults,
    loadMore: qa.loadMore,
    loading: qa.loading,
    results: qa.results,
    errorLoading: qa.errorLoading,
  };

  fs.writeFileSync(path.join(MESSAGES_DIR, file), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Updated ${file}`);
}

console.log('Done.');
