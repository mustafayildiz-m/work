const fs = require('fs');
const path = require('path');

const TR_JSON_PATH = path.join(process.cwd(), 'src/i18n/messages/tr.json');

// Yardımcı fonksiyonlar
function slugify(text) {
    let slug = text.trim().replace(/[\s\n\r]+/g, '_').toUpperCase();
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
    if (trimmed.length < 2) return false;
    // Sadece sayı veya noktalama veya özel sembol mü?
    if (/^[\d\s\W_]+$/.test(trimmed)) return false;
    // İstemediğimiz özel syntaxlar (örn. JS ifadeleri)
    if (trimmed.includes('{') || trimmed.includes('}')) return false;
    return true;
}

let dictionary = {};
if (fs.existsSync(TR_JSON_PATH)) {
    dictionary = JSON.parse(fs.readFileSync(TR_JSON_PATH, 'utf-8'));
}

function getOrAddKey(rawText, prefix = 'UI') {
    const text = rawText.trim();
    const slug = slugify(text);
    let baseKey = `${prefix}.${slug}`;
    if (!baseKey || baseKey === `${prefix}.`) baseKey = `${prefix}.GENERIC`;

    const existingKey = Object.keys(dictionary).find(k => dictionary[k] === text);
    if (existingKey) return existingKey;

    let finalKey = baseKey;
    let counter = 1;
    while (dictionary[finalKey]) {
        finalKey = `${baseKey}_${counter}`;
        counter++;
    }

    dictionary[finalKey] = text;
    return finalKey;
}

let modifiedFilesCount = 0;

module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let modified = false;
    let needsImport = false;

    root.find(j.JSXText).forEach(path => {
        const text = path.node.value;
        if (hasTurkishOrMeaningfulText(text)) {
            const trimmedText = text.trim();
            const key = getOrAddKey(trimmedText, 'UI');

            // Create <FormattedMessage id="KEY" />
            const formattedMsg = j.jsxElement(
                j.jsxOpeningElement(
                    j.jsxIdentifier('FormattedMessage'),
                    [j.jsxAttribute(j.jsxIdentifier('id'), j.stringLiteral(key))]
                ),
                j.jsxClosingElement(j.jsxIdentifier('FormattedMessage')),
                [j.jsxText(text.replace(trimmedText, ''))] // Preserve surrounding whitespace if needed, but jscodeshift does that poorly. 
            );

            // A better approach is self-closing tag for no spaces, but keeping spaces around it if they exist
            const leadingSpace = text.match(/^\s*/)[0];
            const trailingSpace = text.match(/\s*$/)[0];

            const selfClosingMsg = j.jsxElement(
                j.jsxOpeningElement(
                    j.jsxIdentifier('FormattedMessage'),
                    [j.jsxAttribute(j.jsxIdentifier('id'), j.stringLiteral(key))],
                    true // selfClosing
                ),
                null,
                []
            );

            const replacements = [];
            if (leadingSpace) replacements.push(j.jsxText(leadingSpace));
            replacements.push(selfClosingMsg);
            if (trailingSpace) replacements.push(j.jsxText(trailingSpace));

            path.replace(...replacements);

            modified = true;
            needsImport = true;
        }
    });

    if (modified) {
        if (needsImport) {
            // Import ekle (eğer yoksa)
            let hasFormattedMessage = false;
            let reactIntlImport = null;

            root.find(j.ImportDeclaration, { source: { value: 'react-intl' } }).forEach(p => {
                reactIntlImport = p;
                p.node.specifiers.forEach(spec => {
                    if (spec.imported && spec.imported.name === 'FormattedMessage') {
                        hasFormattedMessage = true;
                    }
                });
            });

            if (!hasFormattedMessage) {
                if (reactIntlImport) {
                    reactIntlImport.node.specifiers.push(
                        j.importSpecifier(j.identifier('FormattedMessage'))
                    );
                } else {
                    const importDecl = j.importDeclaration(
                        [j.importSpecifier(j.identifier('FormattedMessage'))],
                        j.literal('react-intl')
                    );
                    root.get().node.program.body.unshift(importDecl);
                }
            }
        }

        // Auto-save dictionary
        const sortedDict = {};
        Object.keys(dictionary).sort().forEach(k => {
            sortedDict[k] = dictionary[k];
        });
        fs.writeFileSync(TR_JSON_PATH, JSON.stringify(sortedDict, null, 2), 'utf-8');
        modifiedFilesCount++;
        console.log(`[UPDATED] ${fileInfo.path}`);
        return root.toSource();
    }
};
