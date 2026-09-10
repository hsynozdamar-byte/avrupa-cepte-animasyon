# Avrupa Cepte — Tanıtım animasyonu

Figma `Promo Flow` section'ının ilk üç mobil ekranı için yerel HTML önizlemesi.

## Açma

Bu klasörde çalıştır:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Ardından http://127.0.0.1:4173 adresini aç. Derleme ya da paket kurulumu gerekmez. Tüm görseller, fontlar, JavaScript ve harita verileri yereldedir.

## Sahneler

1. **Görünür ol (hikaye):** Orijinal paylaşım kartı, ülke baloncukları ve erişim baloncukları. Hafif süzülme, ölçek değişimi ve kart hareketi.
2. **Topluluğuna ulaş (hikaye):** Orijinal kişi, bayrak ve topluluk görselleri. Bağlantı uçları her karede baloncuklara bağlı kalır; çift yönlü ışıklar ve varış halkaları.
3. **Sesini duyur (hikaye finali):** Avrupa'ya dönük küre; paylaşım kartından yayılan ışıklar, şehir bağlantıları, insan baloncukları ve ses dalgası. Bu sahnenin Figma'daki boş görsel alanı ve süre odaklı metni, istenen Avrupa'ya yayılma anlatısına göre yeniden kurgulandı.
4. **3X Büyüme (premium teşviki):** Tanıtım sırasında açılan bottom-sheet. Gri alanda Avrupa haritası, 4 topluluk balonu, merkez AB hub ışıkları ve 3X büyüme grafiği canlanır.

## Akış

- **01—03 Hikaye (tanıtım öncesi):** Otomatik akar (01→02→03). 03'teki süre bitince hikaye finalinde bekler; “Tanıtım oluştur” premium sheet’ini açar.
- **04 Premium teşviki (tanıtım sırasında):** “Tanıtım oluştur” CTA’sıyla, geri butonuyla veya soldaki “3X Büyüme” sekmesinden açılır. Geri/kapat/“1 sayfayla devam et” hikaye finaline (03) döndürür; “Premiuma geç” önizlemede yalnızca bilgi mesajı gösterir.

Otomatik ilerleme `Otomatik` düğmesiyle açılıp kapatılır (varsayılan: açık). Klavye: sol/sağ ok = sahne değiştir; boşluk = oynat/duraklat.

Klavye: sol/sağ ok = sahne değiştir; boşluk = oynat/duraklat. Azaltılmış hareket tercihi varsa önizleme duraklatılmış başlar. Sekme görünmediğinde animasyon saati ilerlemez.

## Dosyalar

- `index.html`: İnceleme arayüzü.
- `styles.css`: Figma tipografisi, renkler, baloncuklar ve responsive görünüm.
- `app.js`: Sahneler, hareket, bağlantılar, küre ve kontroller. Sahnelerin metin ve süre ayarları dosyanın başındaki `scenes` dizisinde.
- `assets/`: Figma'dan indirilen orijinal görseller, Satoshi fontları, yerel D3 paketi, Natural Earth haritası.
- `assets-manifest.json`: Figma görsellerinin kaynak eşlemesi; uygulama bu geçici URL'leri kullanmaz.
- `index-v0.html` / `app-v0.js` / `styles-v0.css`: Önceki kesit (arşiv).

## Kaynaklar

- Tasarım: https://www.figma.com/design/P1pFVExX502FQrV6nCLTjJ/Avrupa-Cepte?node-id=2602-48780
- Kullanılan frame'ler: `2980:83535`, `3005:84351`, `3005:84362`.
- Satoshi: Fontshare / Indian Type Foundry, https://www.fontshare.com/fonts/satoshi
- D3 7.9.0: https://github.com/d3/d3 (ISC lisansı).
- Natural Earth 1:110m land: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson (public domain).

## Kontrol

Üç sahne tarayıcıda görsel olarak incelendi. Görsellerin yüklenmesi, sahne geçişleri, duraklatma, zaman çizelgesi, hız seçimi ve üçlü görünüm kontrol edildi. Mobil genişlikte yatay taşma bulunmadı. JavaScript sözdizimi kontrolü ve tarayıcı hata kaydı kontrolü temiz.
