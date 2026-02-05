"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLanguageArticlesSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("../articles/entities/article.entity");
const article_translation_entity_1 = require("../articles/entities/article-translation.entity");
const book_entity_1 = require("../books/entities/book.entity");
const language_entity_1 = require("../languages/entities/language.entity");
const slug_utils_1 = require("../utils/slug.utils");
let MultiLanguageArticlesSeeder = class MultiLanguageArticlesSeeder {
    constructor(articleRepository, articleTranslationRepository, bookRepository, languageRepository) {
        this.articleRepository = articleRepository;
        this.articleTranslationRepository = articleTranslationRepository;
        this.bookRepository = bookRepository;
        this.languageRepository = languageRepository;
    }
    async seed() {
        console.log('🌱 Çok dilli makaleler ekleniyor...');
        const languages = {
            tr: await this.languageRepository.findOne({ where: { code: 'tr' } }),
            en: await this.languageRepository.findOne({ where: { code: 'en' } }),
            ar: await this.languageRepository.findOne({ where: { code: 'ar' } }),
            fa: await this.languageRepository.findOne({ where: { code: 'fa' } }),
            ur: await this.languageRepository.findOne({ where: { code: 'ur' } }),
            de: await this.languageRepository.findOne({ where: { code: 'de' } }),
            fr: await this.languageRepository.findOne({ where: { code: 'fr' } }),
            es: await this.languageRepository.findOne({ where: { code: 'es' } }),
            ru: await this.languageRepository.findOne({ where: { code: 'ru' } }),
            az: await this.languageRepository.findOne({ where: { code: 'az' } }),
            id: await this.languageRepository.findOne({ where: { code: 'id' } }),
            ms: await this.languageRepository.findOne({ where: { code: 'ms' } }),
            bn: await this.languageRepository.findOne({ where: { code: 'bn' } }),
            hi: await this.languageRepository.findOne({ where: { code: 'hi' } }),
            kk: await this.languageRepository.findOne({ where: { code: 'kk' } }),
            uz: await this.languageRepository.findOne({ where: { code: 'uz' } }),
        };
        const books = await this.bookRepository.find({
            relations: ['translations'],
            take: 20
        });
        if (books.length === 0) {
            console.error('❌ Hiç kitap bulunamadı! Önce kitapları ekleyin.');
            return;
        }
        console.log(`📚 ${books.length} kitap bulundu, makaleler ekleniyor...`);
        const existingSlugs = await this.getExistingSlugs();
        const articleData = this.getArticleData();
        let successCount = 0;
        let errorCount = 0;
        for (const articleInfo of articleData) {
            try {
                const randomBook = books[Math.floor(Math.random() * books.length)];
                const article = this.articleRepository.create({
                    bookId: randomBook.id,
                    author: articleInfo.author,
                    publishDate: articleInfo.publishDate,
                    orderIndex: Math.floor(Math.random() * 100),
                });
                const savedArticle = await this.articleRepository.save(article);
                const translations = [];
                for (const [langCode, content] of Object.entries(articleInfo.translations)) {
                    const language = languages[langCode];
                    if (language && content && typeof content === 'object' && 'title' in content) {
                        const translationContent = content;
                        const slug = (0, slug_utils_1.createUniqueSlug)(translationContent.title, existingSlugs);
                        existingSlugs.push(slug);
                        const translation = this.articleTranslationRepository.create({
                            articleId: savedArticle.id,
                            languageId: language.id,
                            title: translationContent.title,
                            content: translationContent.content,
                            summary: translationContent.summary,
                            slug: slug,
                        });
                        translations.push(translation);
                    }
                }
                if (translations.length > 0) {
                    await this.articleTranslationRepository.save(translations);
                    successCount++;
                    if (successCount % 10 === 0) {
                        console.log(`✅ ${successCount} makale eklendi...`);
                    }
                }
            }
            catch (error) {
                console.error(`❌ Makale eklenirken hata:`, error.message);
                errorCount++;
            }
        }
        console.log(`🎉 Makale ekleme tamamlandı!`);
        console.log(`✅ Başarılı: ${successCount}`);
        console.log(`❌ Hatalı: ${errorCount}`);
        console.log(`📊 Toplam: ${successCount + errorCount}`);
    }
    async getExistingSlugs() {
        const translations = await this.articleTranslationRepository
            .createQueryBuilder('translation')
            .select('translation.slug')
            .where('translation.slug IS NOT NULL')
            .getMany();
        return translations.map(t => t.slug);
    }
    getArticleData() {
        const baseArticles = [
            {
                author: 'Dr. Mehmet Yılmaz',
                publishDate: new Date('2024-01-15'),
                translations: {
                    tr: {
                        title: 'Kur\'an\'da Ahlak ve Değerler',
                        content: 'Kur\'an-ı Kerim, insanlığa sadece bir inanç sistemi değil, aynı zamanda kapsamlı bir ahlak ve değerler sistemi sunar. Bu makalede, Kur\'an\'ın ahlakî öğretilerini ve insan davranışlarına yön veren temel değerleri inceleyeceğiz.\n\nKur\'an\'da ahlak, sadece bireysel bir mesele olarak değil, toplumsal bir sorumluluk olarak ele alınır. Adalet, merhamet, doğruluk, sabır ve şükür gibi değerler, hem kişisel hem de toplumsal hayatta temel prensipler olarak öne çıkar.\n\nModern dünyada bu değerlerin nasıl uygulanabileceği ve çağdaş sorunlara nasıl çözüm getirebileceği üzerinde durulacaktır.',
                        summary: 'Kur\'an\'ın ahlakî öğretileri ve toplumsal değerler sistemi üzerine kapsamlı bir inceleme.'
                    },
                    en: {
                        title: 'Morality and Values in the Quran',
                        content: 'The Holy Quran presents humanity not only with a belief system but also with a comprehensive system of morality and values. In this article, we will examine the moral teachings of the Quran and the fundamental values that guide human behavior.\n\nMorality in the Quran is addressed not only as an individual matter but also as a social responsibility. Values such as justice, mercy, truthfulness, patience, and gratitude emerge as fundamental principles in both personal and social life.\n\nThe article will focus on how these values can be applied in the modern world and how they can provide solutions to contemporary problems.',
                        summary: 'A comprehensive examination of the moral teachings of the Quran and its social value system.'
                    },
                    ar: {
                        title: 'الأخلاق والقيم في القرآن الكريم',
                        content: 'يقدم القرآن الكريم للإنسانية ليس فقط نظاماً عقائدياً بل نظاماً شاملاً للأخلاق والقيم. في هذا المقال سنتناول التعاليم الأخلاقية للقرآن والقيم الأساسية التي توجه السلوك الإنساني.\n\nتُعرض الأخلاق في القرآن ليس فقط كمسألة فردية بل كمسؤولية اجتماعية. تبرز قيم مثل العدل والرحمة والصدق والصبر والشكر كمبادئ أساسية في الحياة الشخصية والاجتماعية.\n\nسنتطرق لكيفية تطبيق هذه القيم في العالم المعاصر وكيف يمكنها تقديم حلول للمشاكل المعاصرة.',
                        summary: 'دراسة شاملة للتعاليم الأخلاقية للقرآن ونظامه القيمي الاجتماعي.'
                    }
                }
            },
            {
                author: 'Prof. Dr. Fatma Demir',
                publishDate: new Date('2024-01-20'),
                translations: {
                    tr: {
                        title: 'Hadis İlminde Rivayet Metodları',
                        content: 'Hadis ilmi, İslam\'ın ikinci temel kaynağı olan sünneti koruma ve aktarma bilimidir. Bu makalede, hadis rivayet metodları ve bu metodların güvenilirliği üzerinde durulacaktır.\n\nHadis rivayetinde kullanılan temel metodlar: isnad (rivayet zinciri), metin (hadis metni), cerh ve ta\'dil (ravilerin durumunu inceleme) gibi konular detaylı olarak incelenecektir.\n\nModern dönemde hadis ilminin karşılaştığı zorluklar ve bu zorlukların üstesinden gelme yolları da ele alınacaktır.',
                        summary: 'Hadis rivayet metodları ve güvenilirlik kriterleri üzerine detaylı bir analiz.'
                    },
                    en: {
                        title: 'Methods of Hadith Narration',
                        content: 'Hadith science is the discipline of preserving and transmitting the Sunnah, which is the second fundamental source of Islam. This article will focus on hadith narration methods and their reliability.\n\nThe fundamental methods used in hadith narration include: isnad (chain of narration), matn (hadith text), jarh wa ta\'dil (examining the status of narrators), which will be examined in detail.\n\nThe challenges faced by hadith science in the modern period and ways to overcome these challenges will also be addressed.',
                        summary: 'A detailed analysis of hadith narration methods and reliability criteria.'
                    },
                    ar: {
                        title: 'مناهج رواية الحديث',
                        content: 'علم الحديث هو علم حفظ ونقل السنة التي هي المصدر الثاني للإسلام. في هذا المقال سنركز على مناهج رواية الحديث وموثوقيتها.\n\nالمناهج الأساسية المستخدمة في رواية الحديث تشمل: الإسناد وسلسلة الرواية، والمتن ونص الحديث، والجرح والتعديل وفحص حال الرواة، والتي ستُدرس بالتفصيل.\n\nالتحديات التي يواجهها علم الحديث في العصر الحديث وطرق التغلب على هذه التحديات ستُعالج أيضاً.',
                        summary: 'تحليل مفصل لمناهج رواية الحديث ومعايير الموثوقية.'
                    }
                }
            },
            {
                author: 'Dr. Ali Kaya',
                publishDate: new Date('2024-02-01'),
                translations: {
                    tr: {
                        title: 'İslam Hukukunda Adalet Kavramı',
                        content: 'İslam hukuku, adalet kavramını merkeze alan bir hukuk sistemidir. Bu makalede, İslam hukukundaki adalet anlayışı ve bu anlayışın günümüz hukuk sistemlerine katkıları incelenecektir.\n\nAdalet, İslam hukukunda sadece hukuki bir kavram değil, aynı zamanda ahlaki ve sosyal bir değerdir. Bu çok boyutlu yaklaşım, modern hukuk sistemlerinde eksik olan bir perspektiftir.\n\nMakalede, İslam hukukunun evrensel adalet prensipleri ve bu prensiplerin çağdaş uygulamaları ele alınacaktır.',
                        summary: 'İslam hukukundaki adalet kavramı ve modern hukuk sistemlerine katkıları.'
                    },
                    en: {
                        title: 'The Concept of Justice in Islamic Law',
                        content: 'Islamic law is a legal system that places the concept of justice at its center. This article will examine the understanding of justice in Islamic law and its contributions to contemporary legal systems.\n\nJustice in Islamic law is not only a legal concept but also a moral and social value. This multi-dimensional approach is a perspective that is lacking in modern legal systems.\n\nThe article will address the universal principles of justice in Islamic law and their contemporary applications.',
                        summary: 'The concept of justice in Islamic law and its contributions to modern legal systems.'
                    },
                    ar: {
                        title: 'مفهوم العدالة في الفقه الإسلامي',
                        content: 'الفقه الإسلامي هو نظام قانوني يضع مفهوم العدالة في مركزه. في هذا المقال سنتناول فهم العدالة في الفقه الإسلامي ومساهماته في الأنظمة القانونية المعاصرة.\n\nالعدالة في الفقه الإسلامي ليست مجرد مفهوم قانوني بل قيمة أخلاقية واجتماعية أيضاً. هذا النهج متعدد الأبعاد هو منظور ينقص في الأنظمة القانونية الحديثة.\n\nسنتطرق في المقال للمبادئ العالمية للعدالة في الفقه الإسلامي وتطبيقاتها المعاصرة.',
                        summary: 'مفهوم العدالة في الفقه الإسلامي ومساهماته في الأنظمة القانونية الحديثة.'
                    }
                }
            },
            {
                author: 'Prof. Dr. Ayşe Özkan',
                publishDate: new Date('2024-02-10'),
                translations: {
                    tr: {
                        title: 'Tasavvuf ve Modern İnsan',
                        content: 'Tasavvuf, İslam\'ın manevi boyutunu oluşturan önemli bir disiplindir. Modern dünyada insanın manevi arayışları ve tasavvufun bu arayışlara sunduğu çözümler ele alınacaktır.\n\nTasavvuf, sadece geçmişte kalmış bir öğreti değil, günümüz insanının manevi ihtiyaçlarını karşılayabilecek dinamik bir sistemdir. Zikir, tefekkür, murakabe gibi pratikler, modern insanın stres ve kaygılarına karşı etkili çözümler sunar.\n\nBu makalede, tasavvufun modern psikoloji ve terapi yöntemleriyle benzerlikleri ve farklılıkları da incelenecektir.',
                        summary: 'Tasavvufun modern dünyadaki manevi arayışlara katkıları ve güncel uygulamaları.'
                    },
                    en: {
                        title: 'Sufism and Modern Man',
                        content: 'Sufism is an important discipline that constitutes the spiritual dimension of Islam. The spiritual quests of human beings in the modern world and the solutions that Sufism offers to these quests will be addressed.\n\nSufism is not just a teaching that remained in the past, but a dynamic system that can meet the spiritual needs of contemporary human beings. Practices such as dhikr, contemplation, and muraqaba offer effective solutions against the stress and anxieties of modern man.\n\nThis article will also examine the similarities and differences between Sufism and modern psychology and therapy methods.',
                        summary: 'The contributions of Sufism to spiritual quests in the modern world and its contemporary applications.'
                    },
                    ar: {
                        title: 'التصوف والإنسان المعاصر',
                        content: 'التصوف هو علم مهم يشكل البعد الروحي للإسلام. سنتناول في هذا المقال البحث الروحي للإنسان في العالم المعاصر والحلول التي يقدمها التصوف لهذه البحث.\n\nالتصوف ليس مجرد تعاليم بقيت في الماضي، بل نظام ديناميكي يمكنه تلبية الاحتياجات الروحية للإنسان المعاصر. ممارسات مثل الذكر والتأمل والمراقبة تقدم حلولاً فعالة ضد التوتر والقلق لدى الإنسان المعاصر.\n\nسنتطرق أيضاً لشبهات واختلافات التصوف مع طرق علم النفس والعلاج الحديث.',
                        summary: 'مساهمات التصوف في البحث الروحي في العالم المعاصر وتطبيقاته المعاصرة.'
                    }
                }
            },
            {
                author: 'Dr. Mustafa Şahin',
                publishDate: new Date('2024-02-15'),
                translations: {
                    tr: {
                        title: 'İslam Tarihinde Bilim ve Teknoloji',
                        content: 'İslam medeniyeti, tarih boyunca bilim ve teknoloji alanında önemli katkılar yapmıştır. Bu makalede, İslam dünyasının bilimsel mirası ve bu mirasın modern bilime etkileri incelenecektir.\n\nMüslüman bilim adamları, matematik, astronomi, tıp, kimya ve felsefe alanlarında çığır açan çalışmalar yapmışlardır. İbn Sina, el-Biruni, el-Harezmi gibi isimler, dünya bilim tarihinde önemli yerler edinmişlerdir.\n\nMakalede, İslam\'ın bilime teşvik eden yaklaşımı ve bu yaklaşımın günümüzdeki önemi de ele alınacaktır.',
                        summary: 'İslam medeniyetinin bilim ve teknoloji alanındaki katkıları ve modern bilime etkileri.'
                    },
                    en: {
                        title: 'Science and Technology in Islamic History',
                        content: 'Islamic civilization has made significant contributions to the field of science and technology throughout history. This article will examine the scientific heritage of the Islamic world and its influences on modern science.\n\nMuslim scientists have made groundbreaking work in mathematics, astronomy, medicine, chemistry, and philosophy. Names like Ibn Sina, al-Biruni, and al-Khwarizmi have gained important places in world science history.\n\nThe article will also address Islam\'s approach that encourages science and its importance today.',
                        summary: 'The contributions of Islamic civilization to science and technology and its influences on modern science.'
                    },
                    ar: {
                        title: 'العلم والتكنولوجيا في التاريخ الإسلامي',
                        content: 'قدمت الحضارة الإسلامية مساهمات مهمة في مجال العلم والتكنولوجيا عبر التاريخ. في هذا المقال سنتناول التراث العلمي للعالم الإسلامي وتأثيراته على العلم الحديث.\n\nقام العلماء المسلمون بأعمال رائدة في الرياضيات والفلك والطب والكيمياء والفلسفة. أسماء مثل ابن سينا والبيروني والخوارزمي اكتسبت أماكن مهمة في تاريخ العلم العالمي.\n\nسنتطرق أيضاً لنهج الإسلام الذي يشجع على العلم وأهميته اليوم.',
                        summary: 'مساهمات الحضارة الإسلامية في العلم والتكنولوجيا وتأثيراتها على العلم الحديث.'
                    }
                }
            }
        ];
        const additionalArticles = this.generateAdditionalArticles();
        return [...baseArticles, ...additionalArticles];
    }
    generateAdditionalArticles() {
        const authors = [
            'Dr. Mehmet Yılmaz', 'Prof. Dr. Fatma Demir', 'Dr. Ali Kaya', 'Prof. Dr. Ayşe Özkan',
            'Dr. Mustafa Şahin', 'Prof. Dr. Zeynep Arslan', 'Dr. İbrahim Çelik', 'Prof. Dr. Hatice Yıldız',
            'Dr. Ömer Faruk', 'Prof. Dr. Elif Korkmaz', 'Dr. Hasan Aydın', 'Prof. Dr. Selma Güven',
            'Dr. Ramazan Özkan', 'Prof. Dr. Gülhan Türkmen', 'Dr. Ahmet Kılıç'
        ];
        const topics = [
            { tr: 'Kur\'an Tefsiri ve Modern Yaklaşımlar', en: 'Quranic Exegesis and Modern Approaches', ar: 'تفسير القرآن والمناهج الحديثة' },
            { tr: 'Hadis Kriterleri ve Güncel Değerlendirmeler', en: 'Hadith Criteria and Current Evaluations', ar: 'معايير الحديث والتقييمات المعاصرة' },
            { tr: 'İslam Hukukunda Kadın Hakları', en: 'Women\'s Rights in Islamic Law', ar: 'حقوق المرأة في الفقه الإسلامي' },
            { tr: 'Tasavvuf ve Psikoloji', en: 'Sufism and Psychology', ar: 'التصوف وعلم النفس' },
            { tr: 'İslam Ekonomisi ve Modern Finans', en: 'Islamic Economics and Modern Finance', ar: 'الاقتصاد الإسلامي والمالية الحديثة' },
            { tr: 'İslam Felsefesinde Varlık Problemi', en: 'The Problem of Existence in Islamic Philosophy', ar: 'مشكلة الوجود في الفلسفة الإسلامية' },
            { tr: 'Kelam İlminde İman-Amel İlişkisi', en: 'Faith-Work Relationship in Islamic Theology', ar: 'علاقة الإيمان بالعمل في علم الكلام' },
            { tr: 'Modern Dönemde İslam Düşüncesi', en: 'Islamic Thought in the Modern Era', ar: 'الفكر الإسلامي في العصر الحديث' },
            { tr: 'Ahlak Felsefesi ve İslam', en: 'Moral Philosophy and Islam', ar: 'الفلسفة الأخلاقية والإسلام' },
            { tr: 'Din ve Bilim İlişkisi', en: 'Relationship Between Religion and Science', ar: 'علاقة الدين بالعلم' },
            { tr: 'Osmanlı Döneminde İslami İlimler', en: 'Islamic Sciences in the Ottoman Period', ar: 'العلوم الإسلامية في العصر العثماني' },
            { tr: 'Endülüs Medeniyeti ve İslam', en: 'Andalusian Civilization and Islam', ar: 'الحضارة الأندلسية والإسلام' },
            { tr: 'İslam Coğrafyasında Bilimsel Gelişmeler', en: 'Scientific Developments in the Islamic World', ar: 'التطورات العلمية في العالم الإسلامي' },
            { tr: 'Müslüman Bilim Adamları ve Katkıları', en: 'Muslim Scientists and Their Contributions', ar: 'العلماء المسلمون ومساهماتهم' },
            { tr: 'İslam Sanatı ve Estetik', en: 'Islamic Art and Aesthetics', ar: 'الفن الإسلامي والجماليات' },
            { tr: 'İslam ve Çevre Bilinci', en: 'Islam and Environmental Awareness', ar: 'الإسلام والوعي البيئي' },
            { tr: 'Dijital Çağda İslami Eğitim', en: 'Islamic Education in the Digital Age', ar: 'التعليم الإسلامي في العصر الرقمي' },
            { tr: 'İslam ve İnsan Hakları', en: 'Islam and Human Rights', ar: 'الإسلام وحقوق الإنسان' },
            { tr: 'Modern Tıp ve İslami Etik', en: 'Modern Medicine and Islamic Ethics', ar: 'الطب الحديث والأخلاق الإسلامية' },
            { tr: 'İslam ve Sosyal Medya', en: 'Islam and Social Media', ar: 'الإسلام ووسائل التواصل الاجتماعي' },
            { tr: 'İslam\'da Aile Kurumu', en: 'Family Institution in Islam', ar: 'مؤسسة الأسرة في الإسلام' },
            { tr: 'Gençlik ve İslami Değerler', en: 'Youth and Islamic Values', ar: 'الشباب والقيم الإسلامية' },
            { tr: 'İslam ve Kadın', en: 'Islam and Women', ar: 'الإسلام والمرأة' },
            { tr: 'İslam\'da Çocuk Eğitimi', en: 'Child Education in Islam', ar: 'تربية الطفل في الإسلام' },
            { tr: 'İslam ve Yaşlılık', en: 'Islam and Aging', ar: 'الإسلام والشيخوخة' },
            { tr: 'Namaz ve Ruhsal Gelişim', en: 'Prayer and Spiritual Development', ar: 'الصلاة والنمو الروحي' },
            { tr: 'Oruç ve Sağlık', en: 'Fasting and Health', ar: 'الصوم والصحة' },
            { tr: 'Zekat ve Sosyal Adalet', en: 'Zakat and Social Justice', ar: 'الزكاة والعدالة الاجتماعية' },
            { tr: 'Hac ve Manevi Deneyim', en: 'Hajj and Spiritual Experience', ar: 'الحج والتجربة الروحية' },
            { tr: 'İslam\'da Çalışma Ahlakı', en: 'Work Ethics in Islam', ar: 'أخلاقيات العمل في الإسلام' },
            { tr: 'İslam ve Yapay Zeka', en: 'Islam and Artificial Intelligence', ar: 'الإسلام والذكاء الاصطناعي' },
            { tr: 'Dijital İslam', en: 'Digital Islam', ar: 'الإسلام الرقمي' },
            { tr: 'İslam ve Biyoteknoloji', en: 'Islam and Biotechnology', ar: 'الإسلام والتكنولوجيا الحيوية' },
            { tr: 'Uzay Çalışmaları ve İslam', en: 'Space Studies and Islam', ar: 'دراسات الفضاء والإسلام' },
            { tr: 'İslam ve Nanoteknoloji', en: 'Islam and Nanotechnology', ar: 'الإسلام وتكنولوجيا النانو' }
        ];
        const articles = [];
        for (let i = 0; i < 65; i++) {
            const topic = topics[i % topics.length];
            const author = authors[Math.floor(Math.random() * authors.length)];
            const publishDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
            articles.push({
                author,
                publishDate,
                translations: {
                    tr: {
                        title: topic.tr,
                        content: this.generateTurkishContent(topic.tr),
                        summary: this.generateTurkishSummary(topic.tr)
                    },
                    en: {
                        title: topic.en,
                        content: this.generateEnglishContent(topic.en),
                        summary: this.generateEnglishSummary(topic.en)
                    },
                    ar: {
                        title: topic.ar,
                        content: this.generateArabicContent(topic.ar),
                        summary: this.generateArabicSummary(topic.ar)
                    }
                }
            });
        }
        return articles;
    }
    generateTurkishContent(title) {
        const baseContent = `Bu makalede ${title} konusu detaylı olarak incelenmektedir. İslami perspektiften ele alınan bu konu, modern dünyada karşılaşılan sorunlara çözüm önerileri sunmaktadır.\n\nTarihsel gelişim süreci içinde bu konunun nasıl ele alındığı ve günümüzdeki durumu analiz edilmektedir. İslam alimlerinin bu konudaki görüşleri ve çağdaş yorumları karşılaştırmalı olarak değerlendirilmektedir.\n\nMakalede, pratik uygulamalar ve örneklerle konu daha anlaşılır hale getirilmektedir. Gelecekte bu alanda yapılacak çalışmalar için öneriler de sunulmaktadır.`;
        return baseContent + `\n\nSonuç olarak, ${title} konusu İslam düşüncesi ve modern hayat açısından önemli bir yer tutmaktadır. Bu konuda yapılacak derinlemesine çalışmalar, hem akademik hem de pratik açıdan değerli katkılar sağlayacaktır.`;
    }
    generateEnglishContent(title) {
        const baseContent = `This article examines the topic of ${title} in detail. This subject, approached from an Islamic perspective, offers solutions to problems encountered in the modern world.\n\nThe historical development process of how this topic has been addressed and its current situation is analyzed. The views of Islamic scholars on this topic and contemporary interpretations are comparatively evaluated.\n\nThe article makes the topic more understandable with practical applications and examples. Suggestions for future studies in this field are also presented.`;
        return baseContent + `\n\nIn conclusion, the topic of ${title} holds an important place in terms of Islamic thought and modern life. In-depth studies to be conducted on this topic will provide valuable contributions both academically and practically.`;
    }
    generateArabicContent(title) {
        const baseContent = `يتناول هذا المقال موضوع ${title} بالتفصيل. هذا الموضوع المعالج من منظور إسلامي يقدم حلولاً للمشاكل التي تواجهها في العالم المعاصر.\n\nيتم تحليل العملية التاريخية لتطور كيفية معالجة هذا الموضوع ووضعه الحالي. يتم تقييم آراء العلماء المسلمين حول هذا الموضوع والتفسيرات المعاصرة مقارنة.\n\nيجعل المقال الموضوع أكثر وضوحاً بالتطبيقات العملية والأمثلة. كما يتم تقديم اقتراحات للدراسات المستقبلية في هذا المجال.`;
        return baseContent + `\n\nفي الختام، يحتل موضوع ${title} مكانة مهمة من حيث الفكر الإسلامي والحياة المعاصرة. ستوفر الدراسات المتعمقة التي ستُجرى حول هذا الموضوع مساهمات قيمة من الناحية الأكاديمية والعملية.`;
    }
    generateTurkishSummary(title) {
        return `${title} konusunda İslami perspektiften kapsamlı bir analiz ve modern uygulamalar.`;
    }
    generateEnglishSummary(title) {
        return `A comprehensive analysis from an Islamic perspective on ${title} and modern applications.`;
    }
    generateArabicSummary(title) {
        return `تحليل شامل من منظور إسلامي حول ${title} والتطبيقات المعاصرة.`;
    }
};
exports.MultiLanguageArticlesSeeder = MultiLanguageArticlesSeeder;
exports.MultiLanguageArticlesSeeder = MultiLanguageArticlesSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __param(1, (0, typeorm_1.InjectRepository)(article_translation_entity_1.ArticleTranslation)),
    __param(2, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __param(3, (0, typeorm_1.InjectRepository)(language_entity_1.Language)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MultiLanguageArticlesSeeder);
//# sourceMappingURL=multilanguage-articles-seeder.js.map