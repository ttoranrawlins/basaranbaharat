# Başaran Baharat — Web Sitesi

Başaran Baharat'ın tanıtım sitesi (İngilizce + Türkçe).

**Canlı site:** [basaranbaharat.com](https://basaranbaharat.com)

## Yapı

- Varsayılan dil İngilizce. `/` sadece yönlendirir: `/en/` (İngilizce), ziyaretçi daha önce TR seçtiyse `/tr/`
- İngilizce `/en/`, Türkçe `/tr/` altında. Her dilin kendi adresi var; sitemap'te hreflang ile eşleşir, `x-default` İngilizce
- Sayfalar: ana sayfa, ürünler (adaçayı, defne yaprağı, kimyon, kekik/oregano, sumak), toptan sipariş, uluslararası tedarik, hakkımızda, iletişim
- Bu depodaki dosyalar derlenmiş çıktıdır; sunucu, framework ya da bağımlılık gerekmez
- Cloudflare Pages üzerinde barındırılıyor, `main` branch'e her push otomatik deploy ediliyor
- `_headers`: güvenlik başlıkları · `_redirects`: eski adreslerin yeni adreslere yönlendirmesi · `sitemap.xml`, `robots.txt`

## Yerelde Görüntüleme

Bir yerel sunucu ile açın (ör. `python3 -m http.server`) ve `http://localhost:8000` adresine gidin.

## Güncelleme Yapmak

Site, ayrı bir kaynak klasöründen (Python + Jinja şablonları) üretiliyor. Metinler `content.py`, görünüm `static/css/main.css` dosyasındadır. Yeniden derleyip çıktıyı bu depoya kopyalayın (eski dosyaları silerek) ve `main` branch'e push edin — Cloudflare birkaç dakika içinde otomatik yayına alır.
