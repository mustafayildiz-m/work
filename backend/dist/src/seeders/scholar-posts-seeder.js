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
exports.ScholarPostsSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const scholar_post_entity_1 = require("../scholars/entities/scholar-post.entity");
let ScholarPostsSeeder = class ScholarPostsSeeder {
    constructor(scholarRepository, scholarPostRepository) {
        this.scholarRepository = scholarRepository;
        this.scholarPostRepository = scholarPostRepository;
    }
    async seed() {
        console.log('🌱 Starting scholar posts seeding...');
        const scholarPosts = {
            1: [
                {
                    content: 'İlim öğrenmek, namaz kılmaktan daha faziletlidir. Çünkü ilim, hem kendine hem de başkalarına faydalıdır.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Allah'ın rızasını kazanmak için çalışan kimse, dünyada da ahirette de mutlu olur.",
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Fıkıh, Allah'ın emirlerini ve yasaklarını bilmektir. Bu ilim olmadan ibadetlerin kabul olması mümkün değildir.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            2: [
                {
                    content: 'Medine halkının ameli, bizim için delildir. Onların yaptığını yapmak, terk ettiğini terk etmek gerekir.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "İlim, Allah'tan korkmakla başlar. Allah'tan korkmayanın ilmi, kendisine fayda vermez.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            3: [
                {
                    content: "Kur'an'ı anlamak için Arap dilini bilmek şarttır. Arapça bilmeyen, Kur'an'ı tam anlayamaz.",
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "İlim öğrenmek isteyen, önce kendini tanımalıdır. Kendini tanıyan, Allah'ı tanır.",
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Fıkıh usulü, şer'i hükümleri çıkarmanın yollarını öğretir. Bu olmadan doğru hüküm verilemez.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            4: [
                {
                    content: 'Hadis, dinin temelidir. Hadis olmadan din olmaz. Bu yüzden hadis öğrenmek farzdır.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Allah'ın dininde bid'at çıkarmak, dini bozmaktır. Bid'atçılar, dini tahrif ederler.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            5: [
                {
                    content: "İlim, kalbi aydınlatır. Kalbi aydınlanan, Allah'ı görür gibi bilir.",
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: 'Dünya, ahiret tarlasıdır. Burada ne ekersen, orada onu biçersin.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Tasavvuf, kalbi temizlemek ve Allah'a yaklaşmaktır. Bu olmadan gerçek iman olmaz.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            6: [
                {
                    content: 'Tıp, insan sağlığını koruma sanatıdır. Sağlık, en büyük nimettir.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Felsefe, varlığın hakikatini araştırmaktır. Bu araştırma, Allah'ı tanımaya götürür.",
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
                {
                    content: "Felsefe ve din, aynı hakikati farklı yollardan arar. İkisi de Allah'ı tanımaya götürür.",
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Akıl, Allah'ın insana verdiği en büyük nimettir. Aklı kullanmak, ibadettir.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            8: [
                {
                    content: "Hadis, Peygamber'in sözü, fiili ve takriridir. Bu üçü de dinin kaynağıdır.",
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: 'Hadis ricali, dinin koruyucularıdır. Onlar olmasa, din bozulurdu.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: 'Sahih hadis, kesin bilgi verir. Bu bilgi olmadan din olmaz.',
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            9: [
                {
                    content: 'Hadis ilmi, dinin en önemli ilmidir. Bu ilim olmadan fıkıh olmaz.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "Hadis öğrenmek, Peygamber'i tanımaktır. Peygamber'i tanımak, Allah'ı tanımaktır.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
            10: [
                {
                    content: 'Aşk, her şeyin anahtarıdır. Aşk olmadan hiçbir şey anlaşılmaz.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: 'Gel, ne olursan ol, gel! Kafir, putperest, ateist olsan da gel! Bizim dergahımız umutsuzluk dergahı değil.',
                    mediaUrls: [],
                    fileUrls: [],
                },
                {
                    content: "İnsan, aynada kendini görür. Allah'ı görmek isteyen, kendi kalbine baksın.",
                    mediaUrls: [],
                    fileUrls: [],
                },
            ],
        };
        for (const [scholarId, posts] of Object.entries(scholarPosts)) {
            try {
                const scholar = await this.scholarRepository.findOne({
                    where: { id: parseInt(scholarId) },
                });
                if (!scholar) {
                    console.log(`⚠️  Scholar not found: ID ${scholarId}`);
                    continue;
                }
                for (const postData of posts) {
                    const post = this.scholarPostRepository.create({
                        ...postData,
                        scholar: scholar,
                        scholarId: parseInt(scholarId),
                    });
                    await this.scholarPostRepository.save(post);
                    console.log(`✅ Added post for ${scholar.fullName}: "${postData.content.substring(0, 50)}..."`);
                }
            }
            catch (error) {
                console.error(`❌ Error adding posts for scholar ID ${scholarId}:`, error.message);
            }
        }
        console.log('🎉 Scholar posts seeding completed!');
    }
};
exports.ScholarPostsSeeder = ScholarPostsSeeder;
exports.ScholarPostsSeeder = ScholarPostsSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(1, (0, typeorm_1.InjectRepository)(scholar_post_entity_1.ScholarPost)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ScholarPostsSeeder);
//# sourceMappingURL=scholar-posts-seeder.js.map