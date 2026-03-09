import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePapersToTurkish1775000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE papers SET
        title = 'Ramazan Nasıl İşler? Yeni Başlayanlar İçin Rehber',
        intro = 'Orucun faziletleri, uygulamanın ruhu, neden oruç tuttuğumuz ve hangi ahlaki, psikolojik ve manevi sonuçların hedeflendiği hakkında bilgi edinin.',
        content = '<h2>İnsani yardım çağrısı</h2><p>Ramazan, İslam takviminin dokuzuncu ayıdır. Oruç tutmak, güneşin doğuşundan batışına kadar yemek, içmek ve bazı bedensel ihtiyaçlardan uzak durmaktır.</p><p>Orucun amacı sadece fiziksel bir uygulama değil; aynı zamanda nefsi terbiye etmek, sabrı öğrenmek ve Allah ile bağlantı kurmaktır.</p>'
      WHERE title = 'How Does Ramadan Work? A Beginner''s Guide'
    `);

    await queryRunner.query(`
      UPDATE papers SET
        title = "Kur'an'ı Allah'ın İsim ve Sıfatları Üzerinden Anlamak",
        intro = "Kur'an'a Allah'ın isimleri üzerinden yaklaşmak, mesajını alma biçimimizi etkiler. Bu makale, Allah ile bağlantı kurmanıza yardımcı olmak için Allah'ın zikrettiği isimler üzerinden Kur'an mesajlarını bağlamsallaştırır.",
        content = '<h2>Allah\\'ın İsimleri</h2><p>Kur\\'an-ı Kerim, Allah\\'ın birçok güzel ismini ve sıfatını zikreder. Bu isimler, O\\'nun sonsuz sıfatlarını ve kullarına olan rahmetini anlamamıza yardımcı olur.</p><p>Er-Rahman, Er-Rahim, El-Hakim gibi isimler, Kur\\'an mesajlarını daha derinlemesine kavramamıza olanak sağlar.</p>'
      WHERE title = 'Understanding the Qur''an Through the Names and Attributes of Allah'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE papers SET
        title = "How Does Ramadan Work? A Beginner's Guide",
        intro = 'Learn about the virtues of fasting in general, the spirit of the practice, why we fast, and what moral, psychological, and spiritual outcomes are desired.',
        content = '<h2>Insani yardim cagrisi</h2><p>Ramazan, Islam takviminin dokuzuncu ayidir. Oruc tutmak, gunesin dogusundan batisina kadar yemek, icmek ve bazi bedensel ihtiyaclardan uzak durmaktir.</p><p>Orucun amaci sadece fiziksel bir uygulama degil; ayni zamanda nefsi terbiye etmek, sabri ogrenmek ve Allah ile baglanti kurmaktir.</p>'
      WHERE title = 'Ramazan Nasıl İşler? Yeni Başlayanlar İçin Rehber'
    `);

    await queryRunner.query(`
      UPDATE papers SET
        title = "Understanding the Qur'an Through the Names and Attributes of Allah",
        intro = "Approaching the Qur'an through Allah's names impacts the way we receive its message. This paper contextualizes the messages of the Qur'an through the names that Allah mentions to help you connect to Allah.",
        content = '<h2>Allah in Isimleri</h2><p>Kur\\'an-i Kerim, Allah\\'in bircok guzel ismini ve sifatini zikreder. Bu isimler, O\\'nun sonsuz sifatlarini ve kullarina olan rahmetini anlamamiza yardimci olur.</p><p>Al-Rahman, Al-Rahim, Al-Hakim gibi isimler, Kur\\'an mesajlarini daha derinlemesine kavramamiza olanak saglar.</p>'
      WHERE title = "Kur'an'ı Allah'ın İsim ve Sıfatları Üzerinden Anlamak"
    `);
  }
}
