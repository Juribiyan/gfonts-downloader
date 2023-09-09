# gfonts-downloader
Скачиватель Google-шрифтов

Скачивает шрифты в формате woff2 (для современных браузеров) и создает CSS-файл, который можно добавлять на веб-страницу.

## Пример использования

Загрузка шрифтов по URL:

```bash
node index.js "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap"
```

В результате в директорию `/output/` будут скачаны все нужные файлы шрифтов, а также будет создан файл `Source Code Pro.css`, который ссылается на эти файлы (ссылки относительные, и поэтому сам CSS-файл и файлы шрифтов должны лежать в одном месте). 

Также можно передать в качестве аргумента ссылку на текстовый файл, содержащий список ссылок на шрифты, разделенный переносом строки:

```bash
node index.js list.txt
```

Всё содержимое папки `/output/` нужно переместить, например, в `/css/fonts/` вашей веб-директории, после чего на страницу добавить:

```html
<link href="/css/fonts/Source Code Pro.css" rel="stylesheet">
```