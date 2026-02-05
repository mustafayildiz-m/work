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
    console.log('🚀 Separator-Based Scholar Parser');
    console.log('===================================\n');
    const txtPath = '/Users/mustafayildiz/Documents/IW_Developments/alimler.txt';
    console.log(`📄 Reading: ${txtPath}`);
    const content = fs.readFileSync(txtPath, 'utf8');
    console.log(`✅ File loaded\n`);
    console.log('🔍 Splitting by separators...');
    const blocks = content.split(/\n-{10,}/);
    console.log(`✅ Found ${blocks.length} blocks\n`);
    console.log('🔍 Parsing scholars...');
    const scholars = [];
    for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0)
            continue;
        let scholarName = null;
        let bioStartIndex = 0;
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i];
            const isUppercase = line === line.toUpperCase() && /^[A-ZÇĞİÖŞÜÂÎÛ]/.test(line);
            const words = line.split(/\s+/).filter(w => w.length > 1);
            const notPageNum = !/^\d+$/.test(line);
            const notReference = !(/^\d+\)/.test(line) || /^[A-Z]\)/.test(line));
            if (isUppercase && words.length >= 2 && words.length <= 12 &&
                line.length >= 3 && line.length <= 150 && notPageNum && notReference) {
                scholarName = line;
                bioStartIndex = i + 1;
                break;
            }
        }
        if (!scholarName)
            continue;
        const bioLines = [];
        for (let i = bioStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (/^\d+\)/.test(line) || /^[A-Z]\)/.test(line))
                break;
            bioLines.push(line);
        }
        const biography = bioLines.join(' ').trim();
        if (biography.length >= 30) {
            scholars.push({
                fullName: scholarName,
                biography: biography
            });
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
            '/uploads/coverImage/coverImage.jpg',
            '/uploads/coverImage/coverImage.jpg',
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
    const [abdurrahman] = await connection.execute("SELECT fullName FROM scholars WHERE fullName LIKE 'ABDURRAHMÂN BİN EBÎ%'");
    if (abdurrahman.length > 0) {
        console.log(`\n✅ ABDURRAHMÂN BİN EBÎ ZİNÂD found!`);
    }
    await connection.end();
    console.log('\n🔌 Connection closed');
}
parseAndImport().catch(console.error);
//# sourceMappingURL=parse-alimler-separator.js.map