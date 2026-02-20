const fs = require('fs');
const path = require('path');
const glob = require('glob'); // npm install glob
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const SRC_DIR = path.join(__dirname, 'src');
const TR_JSON_PATH = path.join(__dirname, 'src/i18n/messages/tr.json');

// Yardımcı fonksiyonlar
function slugify(text) {
    let slug = text.trim().replace(/[\s\n\r]+/g, '_').toUpperCase();
    // Türkçe karakter dönüşümü
    const trMap = {
        'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U',
        'ç': 'C', 'ğ': 'G', 'ı': 'I', 'ö': 'O', 'ş': 'S', 'ü': 'U'
    };
    slug = slug.replace(/[ÇĞİÖŞÜçğıöşü]/g, match => trMap[match]);
    slug = slug.replace(/[^A-Z0-9_]/g, '');
    return slug.slice(0, 40);
}

function hasTurkishOrMeaningfulText(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;
    // Sadece sayı veya noktalama işaretleri mi?
    if (/^[\d\s\W]+$/.test(trimmed)) return false;
    return true;
}

// Sözlük yükle
let dictionary = {};
if (fs.existsSync(TR_JSON_PATH)) {
    dictionary = JSON.parse(fs.readFileSync(TR_JSON_PATH, 'utf-8'));
}

let dictionaryChanged = false;

function getOrAddKey(rawText, prefix = 'TEXT') {
    const text = rawText.trim();
    const slug = slugify(text);
    let baseKey = `${prefix}.${slug}`;
    if (!baseKey || baseKey === `${prefix}.`) baseKey = `${prefix}.UNKNOWN`;

    let finalKey = baseKey;
    let counter = 1;

    // Aynısı varsa onu dön
    const existingKey = Object.keys(dictionary).find(k => dictionary[k] === text);
    if (existingKey) return existingKey;

    // Anahtar çakışmasını önle
    while (dictionary[finalKey]) {
        finalKey = `${baseKey}_${counter}`;
        counter++;
    }

    dictionary[finalKey] = text;
    dictionaryChanged = true;
    return finalKey;
}

const files = glob.sync(`${SRC_DIR}/**/*.{js,jsx}`);

files.forEach(file => {
    const code = fs.readFileSync(file, 'utf-8');
    if (!code.trim()) return;

    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'] // tsx vb ihtimale karşı
        });

        let modified = false;
        let needsFormattedMessage = false;

        traverse(ast, {
            JSXText(path) {
                const text = path.node.value;
                if (hasTurkishOrMeaningfulText(text)) {
                    // Parent bir import, attribut vb değilse
                    const key = getOrAddKey(text, 'UI');

                    // <FormattedMessage id="key" /> oluştur
                    const formattedMessageNode = t.jsxElement(
                        t.jsxOpeningElement(t.jsxIdentifier('FormattedMessage'), [
                            t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(key))
                        ], true), // selfClosing = true
                        null,
                        [],
                        true
                    );

                    path.replaceWith(formattedMessageNode);
                    modified = true;
                    needsFormattedMessage = true;
                }
            }
        });

        if (modified) {
            // Import ekle (eğer yoksa)
            let hasImport = false;
            traverse(ast, {
                ImportDeclaration(path) {
                    if (path.node.source.value === 'react-intl') {
                        const hasFormattedMessage = path.node.specifiers.some(
                            spec => spec.imported && spec.imported.name === 'FormattedMessage'
                        );
                        if (!hasFormattedMessage) {
                            path.node.specifiers.push(
                                t.importSpecifier(t.identifier('FormattedMessage'), t.identifier('FormattedMessage'))
                            );
                        }
                        hasImport = true;
                    }
                }
            });

            if (!hasImport && needsFormattedMessage) {
                const importDecl = t.importDeclaration(
                    [t.importSpecifier(t.identifier('FormattedMessage'), t.identifier('FormattedMessage'))],
                    t.stringLiteral('react-intl')
                );
                ast.program.body.unshift(importDecl);
            }

            const output = generate(ast, {}, code);
            fs.writeFileSync(file, output.code, 'utf-8');
            console.log(`[UPDATED] ${file}`);
        }
    } catch (err) {
        console.error(`[ERROR] ${file}: ${err.message}`);
    }
});

if (dictionaryChanged) {
    // Sort dictionary keys
    const sortedDict = {};
    Object.keys(dictionary).sort().forEach(k => {
        sortedDict[k] = dictionary[k];
    });
    fs.writeFileSync(TR_JSON_PATH, JSON.stringify(sortedDict, null, 2), 'utf-8');
    console.log(`\nUpdated ${TR_JSON_PATH} with new keys.`);
} else {
    console.log('\nNo new keys added.');
}
