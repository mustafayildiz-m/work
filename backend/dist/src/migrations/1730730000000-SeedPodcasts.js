"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedPodcasts1730730000000 = void 0;
class SeedPodcasts1730730000000 {
    async up(queryRunner) {
        const categories = [
            'Hadis',
            'Fıkıh',
            'Tefsir',
            'Siyer',
            'Akaid',
            'Tasavvuf',
            'Genel',
        ];
        const languages = [
            { code: 'tr', name: 'Türkçe' },
            { code: 'en', name: 'English' },
            { code: 'ar', name: 'العربية' },
            { code: 'de', name: 'Deutsch' },
            { code: 'fr', name: 'Français' },
            { code: 'ja', name: '日本語' },
            { code: 'ru', name: 'Русский' },
        ];
        const authors = [
            'Dr. Ömer Faruk Harman',
            'Prof. Dr. Mehmet Okuyan',
            'Dr. Abdülaziz Bayındır',
            'Hoca Ahmet Yesevi',
            'İmam Gazali',
            'Sheikh Muhammad Al-Yaqoubi',
            'Dr. Zakir Naik',
            'Nouman Ali Khan',
            'Mufti Menk',
            'Dr. Bilal Philips',
            'Sheikh Hamza Yusuf',
            'Dr. Yasir Qadhi',
        ];
        const turkishTitles = [
            'Sahabenin Hayatından İbretler',
            "Kur'an'da Aile Hayatı",
            'Peygamber Efendimizin Şefkati',
            'Namazın Manevi Boyutu',
            "Allah'ın İsimleri ve Sıfatları",
            'Sahih Hadislerden Seçmeler',
            "İslam'da Kardeşlik Bağı",
            'Ramazan Ayının Faziletleri',
            'Hac İbadeti ve Hikmeti',
            'Zekat ve Sosyal Dayanışma',
            'İman Esasları',
            'Tevhid İnancı',
            'Kabir Hayatı',
            'Kıyamet Alametleri',
            'Cennet ve Cehennem Tasvirleri',
        ];
        const englishTitles = [
            'Stories from the Lives of Prophets',
            'Understanding Tawheed',
            'The Beauty of Islamic Ethics',
            'Science in the Quran',
            'Women in Islam',
            'Islamic Finance Principles',
            'The Art of Dhikr',
            'Lessons from Surah Al-Kahf',
            'The Importance of Salah',
            'Islamic History and Civilization',
            'Fiqh of Worship',
            'The Seerah Series',
            'Understanding Hadith Sciences',
            'Islamic Psychology',
            'Contemporary Islamic Issues',
        ];
        const arabicTitles = [
            'مقاصد الشريعة الإسلامية',
            'أصول الفقه الإسلامي',
            'التفسير الموضوعي',
            'الإعجاز العلمي في القرآن',
            'أحكام التجويد',
            'السيرة النبوية الشريفة',
            'فقه العبادات',
            'العقيدة الإسلامية',
            'الأخلاق في الإسلام',
            'التاريخ الإسلامي',
            'الحديث النبوي الشريف',
            'الفقه المقارن',
            'أحكام الأسرة المسلمة',
            'الدعوة إلى الله',
            'التصوف الإسلامي',
        ];
        const descriptions = [
            'İslami ilimler alanında derinlemesine bir inceleme ve açıklama serisi.',
            'Günlük hayatta karşılaşılan dini meselelerin çözümleri ve önerileri.',
            "Kutsal kitabımız Kur'an-ı Kerim'in muhteşem ayetlerinin tefsiri.",
            "İslam'ın temel prensiplerini anlatan kapsamlı bir anlatım.",
            "Peygamber Efendimiz'in hayatından ilham verici hikayeler.",
            'An in-depth exploration of Islamic sciences and their practical applications.',
            'Contemporary issues addressed from an Islamic perspective with scholarly insight.',
            'Understanding the Quran through thematic and contextual analysis.',
            'Practical guidance for Muslims living in the modern world.',
            'Stories and lessons from the lives of the righteous predecessors.',
        ];
        const podcasts = [];
        let podcastId = 1;
        const sampleAudioUrl = '/uploads/1762287977518-9d6c07b2-c8fd-4170-806b-34c5d5c2f9fd.mp3';
        const sampleCoverImage = '/uploads/1762288119484-8aa12c1a-cec3-4ae0-a467-c9ed066997d5.jpg';
        for (let i = 0; i < 20; i++) {
            podcasts.push({
                title: turkishTitles[i % turkishTitles.length] +
                    (i > 14 ? ` - Bölüm ${i - 14}` : ''),
                description: descriptions[i % descriptions.length],
                audioUrl: sampleAudioUrl,
                coverImage: sampleCoverImage,
                duration: Math.floor(Math.random() * 3000) + 600,
                author: authors[i % authors.length],
                language: 'tr',
                isActive: i % 10 !== 0,
                isFeatured: i % 7 === 0,
                listenCount: Math.floor(Math.random() * 1000),
                likeCount: Math.floor(Math.random() * 200),
                category: categories[i % categories.length],
                publishDate: new Date(2024, 0, 1 + i),
            });
            podcastId++;
        }
        for (let i = 0; i < 15; i++) {
            podcasts.push({
                title: englishTitles[i % englishTitles.length] +
                    (i > 14 ? ` - Part ${i - 14}` : ''),
                description: descriptions[(i + 3) % descriptions.length],
                audioUrl: sampleAudioUrl,
                coverImage: sampleCoverImage,
                duration: Math.floor(Math.random() * 3000) + 600,
                author: authors[(i + 5) % authors.length],
                language: 'en',
                isActive: i % 8 !== 0,
                isFeatured: i % 5 === 0,
                listenCount: Math.floor(Math.random() * 2000),
                likeCount: Math.floor(Math.random() * 400),
                category: categories[(i + 2) % categories.length],
                publishDate: new Date(2024, 1, 1 + i),
            });
            podcastId++;
        }
        for (let i = 0; i < 12; i++) {
            podcasts.push({
                title: arabicTitles[i % arabicTitles.length] +
                    (i > 14 ? ` - ${i - 14} جزء` : ''),
                description: descriptions[(i + 5) % descriptions.length],
                audioUrl: sampleAudioUrl,
                coverImage: sampleCoverImage,
                duration: Math.floor(Math.random() * 3000) + 600,
                author: authors[(i + 3) % authors.length],
                language: 'ar',
                isActive: i % 9 !== 0,
                isFeatured: i % 6 === 0,
                listenCount: Math.floor(Math.random() * 1500),
                likeCount: Math.floor(Math.random() * 300),
                category: categories[(i + 4) % categories.length],
                publishDate: new Date(2024, 2, 1 + i),
            });
            podcastId++;
        }
        const germanTitles = [
            'Islamische Ethik',
            'Der Quran',
            'Propheten Geschichten',
            'Islamische Wissenschaft',
            'Fiqh Grundlagen',
            'Hadith Studien',
            'Islamische Geschichte',
            'Spiritualität im Islam',
        ];
        for (let i = 0; i < 8; i++) {
            podcasts.push({
                title: germanTitles[i % germanTitles.length] +
                    (i > 7 ? ` - Teil ${i - 7}` : ''),
                description: 'Islamische Themen für deutschsprachige Muslime erklärt.',
                audioUrl: sampleAudioUrl,
                coverImage: sampleCoverImage,
                duration: Math.floor(Math.random() * 2500) + 800,
                author: authors[i % authors.length],
                language: 'de',
                isActive: i % 7 !== 0,
                isFeatured: i % 4 === 0,
                listenCount: Math.floor(Math.random() * 800),
                likeCount: Math.floor(Math.random() * 150),
                category: categories[i % categories.length],
                publishDate: new Date(2024, 3, 1 + i),
            });
            podcastId++;
        }
        const frenchTitles = [
            "L'Islam et la Science",
            'Les Prophètes',
            'La Vie du Prophète',
            'Le Coran',
            'La Prière',
            'Le Jeûne',
            "L'Éthique Islamique",
        ];
        for (let i = 0; i < 7; i++) {
            podcasts.push({
                title: frenchTitles[i % frenchTitles.length] +
                    (i > 6 ? ` - Partie ${i - 6}` : ''),
                description: "Comprendre l'Islam à travers des sujets variés et enrichissants.",
                audioUrl: sampleAudioUrl,
                coverImage: sampleCoverImage,
                duration: Math.floor(Math.random() * 2000) + 700,
                author: authors[(i + 2) % authors.length],
                language: 'fr',
                isActive: i % 6 !== 0,
                isFeatured: i % 3 === 0,
                listenCount: Math.floor(Math.random() * 600),
                likeCount: Math.floor(Math.random() * 120),
                category: categories[(i + 1) % categories.length],
                publishDate: new Date(2024, 4, 1 + i),
            });
            podcastId++;
        }
        const japaneseTitles = [
            'イスラム入門',
            'コーランの教え',
            '預言者の生涯',
            'イスラム法学',
            'イスラムの倫理',
        ];
        for (let i = 0; i < 5; i++) {
            podcasts.push({
                title: japaneseTitles[i % japaneseTitles.length] +
                    (i > 4 ? ` - 第${i - 4}部` : ''),
                description: '日本語でイスラムについて学ぶポッドキャストシリーズ',
                audioUrl: sampleAudioUrl,
                coverImage: sampleCoverImage,
                duration: Math.floor(Math.random() * 1800) + 600,
                author: authors[(i + 4) % authors.length],
                language: 'ja',
                isActive: true,
                isFeatured: i % 2 === 0,
                listenCount: Math.floor(Math.random() * 400),
                likeCount: Math.floor(Math.random() * 80),
                category: categories[i % categories.length],
                publishDate: new Date(2024, 5, 1 + i),
            });
            podcastId++;
        }
        const russianTitles = ['Основы Ислама', 'Пророк Мухаммад', 'Коран и наука'];
        for (let i = 0; i < 3; i++) {
            podcasts.push({
                title: russianTitles[i % russianTitles.length] +
                    (i > 2 ? ` - Часть ${i - 2}` : ''),
                description: 'Исламские уроки на русском языке для всех желающих.',
                audioUrl: sampleAudioUrl,
                coverImage: sampleCoverImage,
                duration: Math.floor(Math.random() * 1500) + 500,
                author: authors[(i + 1) % authors.length],
                language: 'ru',
                isActive: true,
                isFeatured: i === 0,
                listenCount: Math.floor(Math.random() * 300),
                likeCount: Math.floor(Math.random() * 60),
                category: categories[(i + 3) % categories.length],
                publishDate: new Date(2024, 6, 1 + i),
            });
            podcastId++;
        }
        for (const podcast of podcasts) {
            await queryRunner.query(`INSERT INTO podcasts 
        (title, description, audioUrl, coverImage, duration, author, language, isActive, isFeatured, listenCount, likeCount, category, publishDate, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                podcast.title,
                podcast.description,
                podcast.audioUrl,
                podcast.coverImage,
                podcast.duration,
                podcast.author,
                podcast.language,
                podcast.isActive,
                podcast.isFeatured,
                podcast.listenCount,
                podcast.likeCount,
                podcast.category,
                podcast.publishDate,
            ]);
        }
        console.log(`✅ ${podcasts.length} podcast başarıyla eklendi!`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM podcasts WHERE id > 1`);
        console.log('✅ Seed podcastler temizlendi!');
    }
}
exports.SeedPodcasts1730730000000 = SeedPodcasts1730730000000;
//# sourceMappingURL=1730730000000-SeedPodcasts.js.map