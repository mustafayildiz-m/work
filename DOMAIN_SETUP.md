# Domain Panel DNS Ayarları Rehberi

## 📋 İhtiyacınız Olanlar
- Sunucu IP: `46.62.255.65`
- Domain: `islamicwindows.com`

---

## 🔧 DOMAIN PANELİNDE YAPILACAKLAR (DNS Ayarları)

### ⚠️ ÖNEMLİ: Bu adımlar domain sahibi tarafından domain yönetim panelinde yapılmalıdır.

### Adım 1: Domain Yönetim Paneline Giriş
1. Domain yönetim panelinize giriş yapın
2. `islamicwindows.com` domain'ini bulun
3. Domain'in yanındaki **"Yönet"** butonuna tıklayın
4. DNS ayarları / DNS yönetimi bölümüne gidin

### Adım 2: Mevcut DNS Kayıtlarını Kontrol Edin
- Eğer `islamicwindows.com` için mevcut bir A kaydı varsa ve IP adresi farklıysa, önce onu silin veya düzenleyin
- Eski kayıtlar çakışmaya neden olabilir

### Adım 3: Yeni DNS A Kayıtlarını Ekleyin

#### 📍 Kayıt 1: Ana Site (islamicwindows.com)
**DNS Yönetim Paneline Eklenecek:**
```
Kayıt Tipi: A Record (veya A)
Host/Name: @ (veya boş bırakın, veya "islamicwindows.com" yazın)
Değer/Value/Points To: 46.62.255.65
TTL: 3600 (veya otomatik/default)
Priority: (boş bırakın veya yok)
```

**Açıklama:** Bu kayıt `islamicwindows.com` adresini sunucunuza yönlendirir.

---

#### 📍 Kayıt 2: Admin Panel (admin.islamicwindows.com)
**DNS Yönetim Paneline Eklenecek:**
```
Kayıt Tipi: A Record (veya A)
Host/Name: admin
Değer/Value/Points To: 46.62.255.65
TTL: 3600 (veya otomatik/default)
Priority: (boş bırakın veya yok)
```

**Açıklama:** Bu kayıt `admin.islamicwindows.com` alt domain'ini oluşturur ve sunucunuza yönlendirir.

---

#### 📍 Kayıt 3: API (api.islamicwindows.com)
**DNS Yönetim Paneline Eklenecek:**
```
Kayıt Tipi: A Record (veya A)
Host/Name: api
Değer/Value/Points To: 46.62.255.65
TTL: 3600 (veya otomatik/default)
Priority: (boş bırakın veya yok)
```

**Açıklama:** Bu kayıt `api.islamicwindows.com` alt domain'ini oluşturur ve sunucunuza yönlendirir.

---

#### 📍 Kayıt 4: WWW (www.islamicwindows.com) - İsteğe Bağlı
**DNS Yönetim Paneline Eklenecek:**
```
Kayıt Tipi: A Record (veya A)
Host/Name: www
Değer/Value/Points To: 46.62.255.65
TTL: 3600 (veya otomatik/default)
Priority: (boş bırakın veya yok)
```

**Açıklama:** Bu kayıt `www.islamicwindows.com` adresini de sunucunuza yönlendirir (isteğe bağlı).

---

### Adım 4: DNS Kayıtlarını Kaydedin
1. Tüm kayıtları ekledikten sonra **"Kaydet"**, **"Apply"** veya **"Save Changes"** butonuna tıklayın
2. Değişikliklerin kaydedildiğini doğrulayın

### ⏱️ DNS Yayılım Süresi
- **Normal süre:** 1-2 saat
- **Maksimum süre:** 24-48 saat
- **Hızlı yayılım:** Bazı durumlarda 15-30 dakika içinde aktif olabilir

### ✅ DNS Kayıtlarını Kontrol Etme
DNS kayıtlarının aktif olup olmadığını kontrol etmek için aşağıdaki komutları kullanabilirsiniz:

```bash
# Ana site kontrolü
dig islamicwindows.com +short
# Beklenen çıktı: 46.62.255.65

# Admin panel kontrolü
dig admin.islamicwindows.com +short
# Beklenen çıktı: 46.62.255.65

# API kontrolü
dig api.islamicwindows.com +short
# Beklenen çıktı: 46.62.255.65
```

**Not:** Tüm komutlar `46.62.255.65` döndüğünde DNS kayıtları aktif demektir.

---

### 🔍 Farklı Domain Panelleri İçin Notlar

**Eğer domain paneli farklı terimler kullanıyorsa:**
- **Host/Name** yerine: Subdomain, Record Name, Label
- **Değer/Value** yerine: Points To, IP Address, Target, Destination
- **A Record** yerine: A, Address Record, IPv4 Address

**Örnek panel görünümleri:**
- Bazı panellerde Host alanına sadece `admin` yazarsınız, bazılarında `admin.islamicwindows.com` yazmanız gerekebilir
- Bazı panellerde `@` işareti ana domain için kullanılır, bazılarında boş bırakmanız gerekir

---

## 📝 ÖZET

Domain panelinde yapılması gerekenler:
1. ✅ `islamicwindows.com` için A kaydı → `46.62.255.65`
2. ✅ `admin.islamicwindows.com` için A kaydı → `46.62.255.65`
3. ✅ `api.islamicwindows.com` için A kaydı → `46.62.255.65`
4. ✅ `www.islamicwindows.com` için A kaydı → `46.62.255.65` (isteğe bağlı)

DNS kayıtları aktif olduktan sonra sunucu tarafındaki konfigürasyonlar yapılabilir.
