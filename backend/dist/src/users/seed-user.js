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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const typeorm_config_1 = __importDefault(require("../config/typeorm.config"));
async function seedUser() {
    const dataSource = await typeorm_config_1.default.initialize();
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const userEmail = 'mustafayildiz.m111@gmail.com';
    const userUsername = 'mustafayildiz111';
    const userPassword = 'admin123';
    const existing = await userRepo.findOneBy({ email: userEmail });
    if (existing) {
        console.log('User zaten mevcut.');
        await dataSource.destroy();
        return;
    }
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const user = userRepo.create({
        email: userEmail,
        username: userUsername,
        password: hashedPassword,
        firstName: 'Mustafa',
        lastName: 'Yildiz',
        role: 'user',
        isActive: true,
    });
    await userRepo.save(user);
    console.log('User başarıyla eklendi!');
    await dataSource.destroy();
}
seedUser().catch((err) => {
    console.error('Seed sırasında hata:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-user.js.map