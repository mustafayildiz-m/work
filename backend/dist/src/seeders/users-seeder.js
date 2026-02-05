"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
let UsersSeeder = class UsersSeeder {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async seed() {
        console.log('🌱 Starting users seeding...');
        const users = [
            {
                email: 'ahmet.yilmaz@example.com',
                username: 'ahmetyilmaz',
                password: '123456',
                firstName: 'Ahmet',
                lastName: 'Yılmaz',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'İslami ilimlerle ilgilenen bir öğrenci. Hadis ve fıkıh konularında araştırmalar yapıyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'fatma.kaya@example.com',
                username: 'fatmakaya',
                password: '123456',
                firstName: 'Fatma',
                lastName: 'Kaya',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'Tasavvuf ve ahlak konularında kendimi geliştirmeye çalışıyorum. Mevlana\'nın eserlerini okuyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'mehmet.demir@example.com',
                username: 'mehmetdemir',
                password: '123456',
                firstName: 'Mehmet',
                lastName: 'Demir',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'Kur\'an-ı Kerim tefsiri ve Arapça dil öğrenimi konularında çalışıyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'ayse.ozturk@example.com',
                username: 'ayseozturk',
                password: '123456',
                firstName: 'Ayşe',
                lastName: 'Öztürk',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'İslam tarihi ve İslam medeniyeti konularında araştırmalar yapıyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'ali.celik@example.com',
                username: 'alcelik',
                password: '123456',
                firstName: 'Ali',
                lastName: 'Çelik',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'Fıkıh ve İslam hukuku konularında uzmanlaşmaya çalışıyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'zeynep.arslan@example.com',
                username: 'zeyneparslan',
                password: '123456',
                firstName: 'Zeynep',
                lastName: 'Arslan',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'Hadis ilmi ve sünnet konularında derinlemesine çalışıyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'ibrahim.koc@example.com',
                username: 'ibrahimkoc',
                password: '123456',
                firstName: 'İbrahim',
                lastName: 'Koç',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'İslam felsefesi ve kelam ilmi konularında araştırmalar yapıyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'hatice.sahin@example.com',
                username: 'haticesahin',
                password: '123456',
                firstName: 'Hatice',
                lastName: 'Şahin',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'Tefsir ve Kur\'an ilimleri konularında kendimi geliştiriyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'osman.yildirim@example.com',
                username: 'osmanyildirim',
                password: '123456',
                firstName: 'Osman',
                lastName: 'Yıldırım',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'İslami sanatlar ve edebiyat konularında çalışıyorum.',
                role: 'user',
                isActive: true
            },
            {
                email: 'emine.akbas@example.com',
                username: 'emineakbas',
                password: '123456',
                firstName: 'Emine',
                lastName: 'Akbaş',
                photoUrl: 'uploads/coverImage/coverImage.jpg',
                biography: 'İslami eğitim ve öğretim metodları konularında araştırmalar yapıyorum.',
                role: 'user',
                isActive: true
            }
        ];
        for (const userData of users) {
            try {
                const existingUser = await this.userRepository.findOne({
                    where: [
                        { email: userData.email },
                        { username: userData.username }
                    ]
                });
                if (existingUser) {
                    console.log(`⚠️  User already exists: ${userData.email} or ${userData.username}`);
                    continue;
                }
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const user = this.userRepository.create({
                    ...userData,
                    password: hashedPassword
                });
                await this.userRepository.save(user);
                console.log(`✅ Added user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
            }
            catch (error) {
                console.error(`❌ Error adding user ${userData.email}:`, error.message);
            }
        }
        console.log('🎉 Users seeding completed!');
    }
};
exports.UsersSeeder = UsersSeeder;
exports.UsersSeeder = UsersSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersSeeder);
//# sourceMappingURL=users-seeder.js.map