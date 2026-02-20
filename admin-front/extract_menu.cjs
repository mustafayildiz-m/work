const fs = require('fs');
const path = require('path');

const trPath = path.join(__dirname, 'src/i18n/messages/tr.json');
const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));

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

const menuCode = fs.readFileSync(path.join(__dirname, 'src/config/menu.config.jsx'), 'utf8');

// Find all title: '...'
const titles = Array.from(menuCode.matchAll(/title:\s*'([^']+)'/g)).map(m => m[1]);

titles.forEach(t => {
    const key = `MENU.${slugify(t)}`;
    if (!trData[key] && !Object.values(trData).includes(t)) {
        trData[key] = t;
    }
});

// Write to tr.json
const sortedDict = {};
Object.keys(trData).sort().forEach(k => {
    sortedDict[k] = trData[k];
});
fs.writeFileSync(trPath, JSON.stringify(sortedDict, null, 2), 'utf-8');
console.log('Added menu titles to tr.json');
