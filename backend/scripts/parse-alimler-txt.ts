import * as fs from 'fs';
import mysql from 'mysql2/promise';

async function parseAndImport() {
    console.log('🚀 Alimler TXT Parser & Importer');
    console.log('==================================\n');

    // Read file
    const txtPath = '/Users/mustafayildiz/Documents/IW_Developments/alimler.txt';
    console.log(`📄 Reading: ${txtPath}`);
    const content = fs.readFileSync(txtPath, 'utf8');
    const lines = content.split('\n');
    console.log(`✅ ${lines.length.toLocaleString()} lines loaded\n`);

    // Parse scholars
    console.log('🔍 Parsing scholars...');
    const scholars: any[] = [];
    let currentScholar: any = null;
    let bioLines: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        // Scholar name = line that is fully uppercase
        const isUppercase = trimmed === trimmed.toUpperCase() && /^[A-ZÇĞİÖŞÜÂÎÛ0-9]/.test(trimmed);

        if (isUppercase) {
            const words = trimmed.split(/\s+/).filter(w => w.length > 1);

            // Reject obvious non-names
            const notPageNum = !/^\d+$/.test(trimmed);
            const notHeader = !/(^SAYFA|^İÇİNDEKİLER|^KAYNAKÇA|^BÖLÜM|^DİZİN|^\d+-\d+$)/.test(trimmed);
            const validLength = trimmed.length >= 5 && trimmed.length <= 120;

            if (notPageNum && notHeader && validLength && words.length >= 2 && words.length <= 10) {
                // Save previous scholar
                if (currentScholar && bioLines.length > 0) {
                    currentScholar.biography = bioLines.join(' ').trim();
                    if (currentScholar.biography.length >= 30) {
                        scholars.push(currentScholar);
                    }
                }

                // Start new scholar
                currentScholar = {
                    fullName: trimmed,
                    biography: ''
                };
                bioLines = [];
            }
        } else if (currentScholar && trimmed.length > 0) {
            // Check for separator line (marks end of biography/references)
            // Pattern: -----------------------------1) Kaynaklar
            if (/^-{5,}/.test(trimmed)) {
                // Separator found - save current scholar and reset
                if (bioLines.length > 0) {
                    currentScholar.biography = bioLines.join(' ').trim();
                    if (currentScholar.biography.length >= 30) {
                        scholars.push(currentScholar);
                    }
                }
                currentScholar = null;
                bioLines = [];
            } else {
                // Collect biography line
                bioLines.push(trimmed);
            }
        }
    }

    // Save last scholar
    if (currentScholar && bioLines.length > 0) {
        currentScholar.biography = bioLines.join(' ').trim();
        if (currentScholar.biography.length >= 30) {
            scholars.push(currentScholar);
        }
    }

    console.log(`✅ Found ${scholars.length} scholars\n`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3315,
        user: 'root',
        password: 'root',
        database: 'islamic_windows',
    });
    console.log('✅ Connected\n');

    // Clear existing
    console.log('🗑️  Clearing existing scholars...');
    await connection.execute('DELETE FROM scholars');
    console.log('✅ Cleared\n');

    // Import
    console.log('💾 Importing scholars...');
    const batchSize = 500;
    let imported = 0;

    for (let i = 0; i < scholars.length; i += batchSize) {
        const batch = scholars.slice(i, i + batchSize);

        const values = batch.map(s => [
            s.fullName,
            null, // lineage
            null, // birthDate
            null, // deathDate
            s.biography,
            'uploads/coverImage/coverImage.jpg', // photoUrl
            'uploads/coverImage/coverImage.jpg', // coverImage
            null, // latitude
            null, // longitude
            null, // locationName
            null  // locationDescription
        ]);

        const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?)').join(',');
        await connection.execute(
            `INSERT INTO scholars 
      (fullName, lineage, birthDate, deathDate, biography, photoUrl, coverImage, latitude, longitude, locationName, locationDescription) 
      VALUES ${placeholders}`,
            values.flat()
        );

        imported += batch.length;
        process.stdout.write(`\r   Progress: ${imported}/${scholars.length} (${((imported / scholars.length) * 100).toFixed(1)}%)`);
    }

    console.log('\n\n✅ Import completed!');

    // Verify
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM scholars');
    console.log(`📊 Total in DB: ${(result as any)[0].count}`);

    // Sample
    const [samples] = await connection.execute('SELECT id, fullName FROM scholars LIMIT 10');
    console.log('\n📋 Sample scholars:');
    (samples as any[]).forEach((s, i) => {
        console.log(`${i + 1}. ${s.fullName} (ID: ${s.id})`);
    });

    // Check ABBÂS
    const [abbas] = await connection.execute("SELECT COUNT(*) as count FROM scholars WHERE fullName LIKE 'ABBÂS%'");
    console.log(`\n🎯 ABBÂS scholars: ${(abbas as any)[0].count}`);

    // Check FEREC
    const [ferec] = await connection.execute("SELECT fullName FROM scholars WHERE fullName LIKE '%FEREC%'");
    if ((ferec as any[]).length > 0) {
        console.log(`\n📋 FEREC scholars:`);
        (ferec as any[]).forEach((s, i) => {
            console.log(`${i + 1}. ${s.fullName}`);
        });
    }

    await connection.end();
    console.log('\n🔌 Connection closed');
}

parseAndImport().catch(console.error);
