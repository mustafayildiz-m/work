const fs = require('fs');
const trData = JSON.parse(fs.readFileSync('src/i18n/messages/tr.json', 'utf8'));
const enData = JSON.parse(fs.readFileSync('src/i18n/messages/en.json', 'utf8'));
let count = 0;
// Basic rule-based translation for testing / fallback
const dict = {
    'Dashboard': 'Dashboard', 'İçerik Yönetimi': 'Content Management', 'Kitaplar': 'Books',
    'Kitap Ekle': 'Add Book', 'Tüm Kitaplar': 'All Books', 'Çeviri Dilleri': 'Translation Languages',
    'Makaleler': 'Articles', 'Makale Ekle': 'Add Article', 'Tüm Makaleler': 'All Articles',
    'Podcast': 'Podcast', 'Podcast Ekle': 'Add Podcast', 'Tüm Podcast\'ler': 'All Podcasts',
    'Alimler': 'Scholars', 'Alim Ekle': 'Add Scholar', 'Tüm Alimler': 'All Scholars',
    'İslamla Şereflenenler': 'Honored with Islam', 'Video Ekle': 'Add Video', 'Tüm Videolar': 'All Videos',
    'Envanter Yönetimi': 'Inventory Management', 'Depolar': 'Warehouses', 'Depo Ekle': 'Add Warehouse',
    'Tüm Depolar': 'All Warehouses', 'Stoklar': 'Stocks', 'Stok Ekle': 'Add Stock', 'Tüm Stoklar': 'All Stocks',
    'Stok Transferleri': 'Stock Transfers', 'Stok Transferi Ekle': 'Add Stock Transfer', 'Tüm Transferler': 'All Transfers',
    'Kullanıcı Yönetimi': 'User Management', 'Yöneticiler': 'Administrators', 'Editörler': 'Editors',
    'Bireysel Kullanıcılar': 'Individual Users', 'Onaylar': 'Approvals', 'Onay Bekleyen Postlar': 'Pending Posts'
};

Object.keys(trData).forEach(k => {
    if (k.startsWith('MENU.')) {
        const trText = trData[k];
        if (!enData[k]) {
            enData[k] = dict[trText] || trText;
            count++;
        }
    }
});

if (!enData['UI.BIREYSEL_KULLANICILAR__ISLAMIC_WINDOWS_A']) {
    enData['UI.BIREYSEL_KULLANICILAR__ISLAMIC_WINDOWS_A'] = 'Individual Users - Islamic Windows Admin';
}

fs.writeFileSync('src/i18n/messages/en.json', JSON.stringify({
    ...enData
}, null, 2));
console.log('Done mapping', count);
