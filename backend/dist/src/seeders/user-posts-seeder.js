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
exports.UserPostsSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_post_entity_1 = require("../entities/user-post.entity");
const user_entity_1 = require("../users/entities/user.entity");
let UserPostsSeeder = class UserPostsSeeder {
    constructor(userPostRepository, userRepository) {
        this.userPostRepository = userPostRepository;
        this.userRepository = userRepository;
    }
    async seed() {
        console.log('🌱 Starting user posts seeding...');
        const users = await this.userRepository.find();
        console.log(`Found ${users.length} users`);
        const postTemplates = [
            {
                title: "Kur'an-ı Kerim'den Bir Ayet",
                content: "Bugün Kur'an-ı Kerim'den okuduğum bir ayet beni çok etkiledi. 'Allah'ın rahmeti geniştir' diyor. Bu ayet bana umut veriyor.",
                hasImage: true,
                hasVideo: false
            },
            {
                title: "Hadis-i Şerif Paylaşımı",
                content: "Peygamberimiz (s.a.v.) buyuruyor: 'Müminler birbirlerini sevmekte, birbirlerine acımakta ve birbirlerini korumakta bir vücut gibidir.' Bu hadis birlik ve beraberliğin önemini gösteriyor.",
                hasImage: false,
                hasVideo: false
            },
            {
                title: "İslami İlimler Üzerine Düşünceler",
                content: "Fıkıh ilmi üzerine çalışırken, İslam'ın ne kadar detaylı ve kapsamlı bir din olduğunu bir kez daha anlıyorum. Her konuda rehberlik eden prensipler var.",
                hasImage: true,
                hasVideo: false
            },
            {
                title: "Tasavvuf ve Ahlak",
                content: "Mevlana'nın Mesnevi'sinden: 'Gel, gel, ne olursan ol yine gel!' Bu söz bana İslam'ın kapsayıcılığını hatırlatıyor.",
                hasImage: false,
                hasVideo: true
            },
            {
                title: "İslam Tarihinden Bir Kesit",
                content: "Endülüs'teki İslam medeniyetinin bilim ve sanata katkıları hakkında okuduklarım beni çok etkiledi. İbn Sina, İbn Rüşd gibi alimlerin eserleri hala günümüzde değerli.",
                hasImage: true,
                hasVideo: false
            },
            {
                title: "Namaz ve İbadet",
                content: "Namaz kılarken hissettiğim huzur tarif edilemez. Allah'a yakın olmanın en güzel yolu. Her gün beş vakit bu fırsatı değerlendirmek gerekiyor.",
                hasImage: false,
                hasVideo: false
            },
            {
                title: "Zekat ve Sadaka",
                content: "Zekat vermenin sadece maddi bir yükümlülük olmadığını, aynı zamanda kalbi temizleyen bir ibadet olduğunu düşünüyorum. Paylaşmak ne güzel bir erdem.",
                hasImage: true,
                hasVideo: false
            },
            {
                title: "İslami Eğitim",
                content: "Çocuklarımıza İslami değerleri öğretmek en önemli görevimiz. Onların kalplerine sevgi, merhamet ve adalet tohumları ekmeliyiz.",
                hasImage: false,
                hasVideo: true
            },
            {
                title: "Kur'an Tefsiri",
                content: "Bugün Bakara suresinin 255. ayetini (Ayetü'l-Kürsi) tefsir ederken, Allah'ın büyüklüğü ve kudreti karşısında hayranlık duydum.",
                hasImage: true,
                hasVideo: false
            },
            {
                title: "İslam Felsefesi",
                content: "İbn Sina'nın 'eş-Şifa' eserini okurken, İslam felsefesinin derinliğini bir kez daha fark ettim. Akıl ve vahiy arasındaki uyum mükemmel.",
                hasImage: false,
                hasVideo: false
            },
            {
                title: "Dua ve Zikir",
                content: "Sabah namazından sonra yaptığım dualar kalbimi huzurla dolduruyor. Allah'a yakarmak, O'na sığınmak ne büyük bir nimet.",
                hasImage: true,
                hasVideo: false
            },
            {
                title: "İslami Sanatlar",
                content: "Hat sanatının güzelliği beni büyülüyor. Her harf bir sanat eseri. İslam'ın estetik anlayışı gerçekten muhteşem.",
                hasImage: true,
                hasVideo: true
            },
            {
                title: "Hac ve Umre",
                content: "Hac ibadetini yapmak için sabırsızlanıyorum. Kâbe'yi görmek, Arafat'ta durmak, Müzdelife'de gecelemek... Ne büyük bir fırsat.",
                hasImage: false,
                hasVideo: false
            },
            {
                title: "İslami Ahlak",
                content: "Peygamberimizin ahlakı üzerine düşünüyorum. O'nun merhameti, adaleti, sabrı bizim için en güzel örnek. O'nu takip etmek ne büyük şeref.",
                hasImage: true,
                hasVideo: false
            },
            {
                title: "Kur'an Okuma",
                content: "Kur'an-ı Kerim'i okurken, her ayetin bana hitap ettiğini hissediyorum. Allah'ın kelamı gerçekten mucizevi.",
                hasImage: false,
                hasVideo: true
            }
        ];
        const numberOfPosts = 25;
        for (let i = 0; i < numberOfPosts; i++) {
            try {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomTemplate = postTemplates[Math.floor(Math.random() * postTemplates.length)];
                const randomDate = new Date();
                randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
                const postData = {
                    user_id: randomUser.id,
                    title: randomTemplate.title,
                    content: randomTemplate.content,
                    image_url: randomTemplate.hasImage ? this.getRandomImageUrl() : undefined,
                    video_url: randomTemplate.hasVideo ? this.getRandomVideoUrl() : undefined,
                    created_at: randomDate,
                    updated_at: randomDate
                };
                const post = this.userPostRepository.create(postData);
                await this.userPostRepository.save(post);
                console.log(`✅ Added post: "${postData.title}" by user ${postData.user_id}`);
            }
            catch (error) {
                console.error(`❌ Error adding post:`, error.message);
            }
        }
        console.log('🎉 User posts seeding completed!');
    }
    getRandomImageUrl() {
        const imageUrls = [
            'uploads/1757208953748-340617087.webp',
            'uploads/1757208691440-498094683.webp',
            'uploads/1757208860353-200569964.webp',
            'uploads/coverImage/coverImage.jpg',
            'uploads/1757532176578-6c417592-a152-4646-98f9-ca0eb03263f2.jpg',
            'uploads/1757532281124-d73e0558-7a80-497d-9c8a-131cdef06b18.jpg',
            'uploads/1757532281125-433e3229-cd3d-4881-8192-261e6d16ac6d.jpg'
        ];
        return imageUrls[Math.floor(Math.random() * imageUrls.length)];
    }
    getRandomVideoUrl() {
        const videoUrls = [
            'uploads/videos/islamic-lecture-1.mp4',
            'uploads/videos/quran-recitation.mp4',
            'uploads/videos/hadith-explanation.mp4',
            'uploads/videos/islamic-history.mp4',
            'uploads/videos/prayer-guide.mp4'
        ];
        return videoUrls[Math.floor(Math.random() * videoUrls.length)];
    }
};
exports.UserPostsSeeder = UserPostsSeeder;
exports.UserPostsSeeder = UserPostsSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_post_entity_1.UserPost)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserPostsSeeder);
//# sourceMappingURL=user-posts-seeder.js.map