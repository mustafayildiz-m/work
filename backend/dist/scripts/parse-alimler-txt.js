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
const fs = __importStar(require("fs"));
const promise_1 = __importDefault(require("mysql2/promise"));
async function parseAndImport() {
    console.log('🚀 Alimler TXT Parser & Importer');
    console.log('==================================\n');
    const txtPath = '/Users/mustafayildiz/Documents/IW_Developments/alimler.txt';
    console.log(`📄 Reading: ${txtPath}`);
    const content = fs.readFileSync(txtPath, 'utf8');
    const lines = content.split('\n');
    console.log(`✅ ${lines.length.toLocaleString()} lines loaded\n`);
    console.log('🔍 Parsing scholars...');
    const scholars = [];
    let currentScholar = null;
    let bioLines = [];
    for (const line of lines) {
        const trimmed = line.trim();
        const isUppercase = trimmed === trimmed.toUpperCase() && /^[A-ZÇĞİÖŞÜÂÎÛ0-9]/.test(trimmed);
        if (isUppercase) {
            const words = trimmed.split(/\s+/).filter(w => w.length > 1);
            const notPageNum = !/^\d+$/.test(trimmed);
            const notHeader = !/(^SAYFA|^İÇİNDEKİLER|^KAYNAKÇA|^BÖLÜM|^DİZİN|^\d+-\d+$)/.test(trimmed);
            const validLength = trimmed.length >= 5 && trimmed.length <= 120;
            if (notPageNum && notHeader && validLength && words.length >= 2 && words.length <= 10) {
                if (currentScholar && bioLines.length > 0) {
                    currentScholar.biography = bioLines.join(' ').trim();
                    if (currentScholar.biography.length >= 30) {
                        scholars.push(currentScholar);
                    }
                }
                currentScholar = {
                    fullName: trimmed,
                    biography: ''
                };
                bioLines = [];
            }
        }
        else if (currentScholar && trimmed.length > 0) {
            if (/^-{5,}/.test(trimmed)) {
                if (bioLines.length > 0) {
                    currentScholar.biography = bioLines.join(' ').trim();
                    if (currentScholar.biography.length >= 30) {
                        scholars.push(currentScholar);
                    }
                }
                currentScholar = null;
                bioLines = [];
            }
            else {
                bioLines.push(trimmed);
            }
        }
    }
    if (currentScholar && bioLines.length > 0) {
        currentScholar.biography = bioLines.join(' ').trim();
        if (currentScholar.biography.length >= 30) {
            scholars.push(currentScholar);
        }
    }
    console.log(`✅ Found ${scholars.length} scholars\n`);
    console.log('🔌 Connecting to database...');
    const connection = await promise_1.default.createConnection({
        host: 'localhost',
        port: 3315,
        user: 'root',
        password: 'root',
        database: 'islamic_windows',
    });
    console.log('✅ Connected\n');
    console.log('🗑️  Clearing existing scholars...');
    await connection.execute('DELETE FROM scholars');
    console.log('✅ Cleared\n');
    console.log('💾 Importing scholars...');
    const batchSize = 500;
    let imported = 0;
    for (let i = 0; i < scholars.length; i += batchSize) {
        const batch = scholars.slice(i, i + batchSize);
        const values = batch.map(s => [
            s.fullName,
            null,
            null,
            null,
            s.biography,
            'uploads/coverImage/coverImage.jpg',
            'uploads/coverImage/coverImage.jpg',
            null,
            null,
            null,
            null
        ]);
        const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?)').join(',');
        await connection.execute(`INSERT INTO scholars 
      (fullName, lineage, birthDate, deathDate, biography, photoUrl, coverImage, latitude, longitude, locationName, locationDescription) 
      VALUES ${placeholders}`, values.flat());
        imported += batch.length;
        process.stdout.write(`\r   Progress: ${imported}/${scholars.length} (${((imported / scholars.length) * 100).toFixed(1)}%)`);
    }
    console.log('\n\n✅ Import completed!');
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM scholars');
    console.log(`📊 Total in DB: ${result[0].count}`);
    const [samples] = await connection.execute('SELECT id, fullName FROM scholars LIMIT 10');
    console.log('\n📋 Sample scholars:');
    samples.forEach((s, i) => {
        console.log(`${i + 1}. ${s.fullName} (ID: ${s.id})`);
    });
    const [abbas] = await connection.execute("SELECT COUNT(*) as count FROM scholars WHERE fullName LIKE 'ABBÂS%'");
    console.log(`\n🎯 ABBÂS scholars: ${abbas[0].count}`);
    const [ferec] = await connection.execute("SELECT fullName FROM scholars WHERE fullName LIKE '%FEREC%'");
    if (ferec.length > 0) {
        console.log(`\n📋 FEREC scholars:`);
        ferec.forEach((s, i) => {
            console.log(`${i + 1}. ${s.fullName}`);
        });
    }
    await connection.end();
    console.log('\n🔌 Connection closed');
}
parseAndImport().catch(console.error);
//# sourceMappingURL=parse-alimler-txt.js.map