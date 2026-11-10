# Başaran Baharat — Web Sitesi

1991'den beri Konak Gıda Çarşısı'nda toptan baharat üretimi ve tedariki yapan Başaran Baharat'ın tanıtım sitesi (Türkçe + İngilizce).

**Canlı site:** [basaranbaharat.com](https://basaranbaharat.com)

## Teknik Detaylar

- Statik, çok sayfalı site: Türkçe kökte (`/`, `/urunler/`, `/toptan-siparis/`, `/hakkimizda/`, `/iletisim/`), İngilizce `/en/` altında
- Bu depodaki dosyalar derlenmiş çıktıdır; sunucu, framework ya da bağımlılık gerekmez
- Cloudflare Pages üzerinde barındırılıyor, `main` branch'e her push otomatik deploy ediliyor
- Güvenlik başlıkları `_headers`, arama motoru dosyaları `sitemap.xml` ve `robots.txt`

## Yerelde Görüntüleme

Bir yerel sunucu ile açın (ör. `python3 -m http.server`) ve `http://localhost:8000` adresine gidin.

## Güncelleme Yapmak

Site, ayrı bir kaynak klasöründen (Python + Jinja şablonları) üretiliyor. Metinler `content.py`, görünüm `static/css/main.css` dosyasındadır. Yeniden derleyip çıktıyı bu depoya kopyalayın ve `main` branch'e push edin — Cloudflare birkaç dakika içinde otomatik yayına alır.
