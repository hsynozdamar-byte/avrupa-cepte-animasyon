# Avrupa Cepte — Animasyon panosu

Avrupa Cepte'nin hareket çalışmalarının tamamı tek yerde. Hepsi canlı HTML/SVG
olarak oynar; video dosyası, derleme adımı ve paket kurulumu yoktur.

## Açma

Depo kökünde:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Ardından http://127.0.0.1:4173 adresini aç.

## Akışlar

| Yol | Akış | İçerik |
| --- | --- | --- |
| `/` | Pano | Üç akışın listesi, sahnelere derin bağlantılar |
| `/splash/` | Açılış akışı | Avrupa Cepte splash → sponsor splash → ana ekran, 4,6 sn |
| `/tanitim/` | Tanıtım akışı | Görünür ol, topluluğuna ulaş, sesini duyur, 3X büyüme; 4 sahne, 30 sn |
| `/onboarding/` | Onboarding akışı | Aidiyet, tavsiye, kişisel akış, erişim; 4 ekran, sahne başına 3,6 sn |

Üçü de 393 × 852 çerçevede çalışır. Pano, açılış ve onboarding koyu temayı
destekler.

## Tasarım sistemi

`system.css` ortak katman: renk değişkenleri, cihaz çerçevesi (Dynamic Island ve
yan tuşlar dahil), üst navigasyon, panel tipografisi, zaman çizelgesi ve
segment/buton bileşenleri. Üç sayfa da bunu kullanır, böylece cihaz her sayfada
aynı konumda durur.

## Klasörler

```
index.html      pano
system.css      ortak tasarım sistemi
assets/         paylaşılan ikon, wordmark, durum çubuğu, Satoshi fontları
splash/         açılış akışı (index.html + kendi assets/ klasörü)
tanitim/        tanıtım akışı
onboarding/     onboarding akışı (index.html + app.js)
```

### Tanıtım akışı hakkında

Bu akış daha önce bu deponun kökündeydi ve `avrupa-cepte-animasyon.vercel.app`
adresinde tek başına yayınlanıyordu. Sahne animasyonlarına dokunulmadı; yalnızca
sayfa yapısı panonun tasarım sistemine getirildi. Uyum kuralları `tanitim/fit.css`
içinde ayrı tutuldu, `styles.css` ve `styles-v0.css` el değmeden duruyor.

Arşiv dosyaları da taşındı ve korundu: `app-v0.js`, `app-v1.js`, `index-v0.html`,
`index-v1.html`, `styles-v1.css`. Bunlardan `app-v1.js` ile `app.js` ve
`styles-v1.css` ile `styles.css` şu an birebir aynı içerikte; silinip
silinmeyecekleri ayrı bir karar.

## Notlar

- `vercel.json` içinde `trailingSlash: true` gerekli. Alt klasörlerdeki göreli
  varlık yolları (`assets/...`) ancak sonunda eğik çizgi olan adreslerde doğru
  çözülür.
- Onboarding sahnelerinde karakter illüstrasyonu yoktur; kurgu düğüm, kart ve
  çizgiyle anlatılır. Renkler CSS değişkenlerinden gelir.
