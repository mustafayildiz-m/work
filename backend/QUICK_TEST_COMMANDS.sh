#!/bin/bash

# Takip Edilen API'leri Hızlı Test Scripti
# Kullanım: ./QUICK_TEST_COMMANDS.sh

echo "🚀 Takip Edilen API'leri Test Scripti"
echo "======================================"

# JWT Token'ı buraya yazın (login endpoint'inden alın)
JWT_TOKEN="your-jwt-token-here"

# Token kontrolü
if [ "$JWT_TOKEN" = "your-jwt-token-here" ]; then
    echo "❌ Lütfen önce JWT_TOKEN değişkenini güncelleyin!"
    echo "   Login endpoint'inden token alın ve script'teki JWT_TOKEN değişkenini güncelleyin."
    exit 1
fi

echo "✅ Token hazır: ${JWT_TOKEN:0:20}..."
echo ""

# 1. Tüm takip edilenleri getir
echo "📋 1. Tüm Takip Edilenleri Getir"
echo "--------------------------------"
curl -X GET "http://localhost:3000/following" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""

# 2. Sadece kullanıcıları getir
echo "📋 2. Sadece Takip Edilen Kullanıcıları Getir"
echo "---------------------------------------------"
curl -X GET "http://localhost:3000/following/users" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""

# 3. Sadece alimleri getir
echo "📋 3. Sadece Takip Edilen Alimleri Getir"
echo "----------------------------------------"
curl -X GET "http://localhost:3000/following/scholars" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""

# 4. İstatistikleri getir
echo "📋 4. Takip İstatistiklerini Getir"
echo "----------------------------------"
curl -X GET "http://localhost:3000/following/stats" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""

# 5. Sayfalama testi
echo "📋 5. Sayfalama Testi (İlk 5 sonuç)"
echo "-----------------------------------"
curl -X GET "http://localhost:3000/following?limit=5&offset=0" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""

# 6. Filtreleme testi
echo "📋 6. Filtreleme Testi (Sadece Kullanıcılar)"
echo "--------------------------------------------"
curl -X GET "http://localhost:3000/following?type=users&limit=3" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""

echo "✅ Tüm testler tamamlandı!"
echo ""
echo "💡 İpucu: jq yüklü değilse, komutlardan | jq '.' kısmını çıkarın"
echo "💡 İpucu: Daha detaylı test için POSTMAN_CURL_COMMANDS.md dosyasını inceleyin"
