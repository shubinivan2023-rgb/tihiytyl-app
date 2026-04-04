# 📋 ТЗ Модуль 0: Обновление лендинга

## 🎯 Цель

Обновить промо-сайт (лендинг) под новую концепцию продукта:
- Убрать упоминания AI-ассистента
- Обновить описание на голосовой дневник + техники
- Настроить переход на приложение

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app` (новый)  
**Существующий лендинг:** https://тихийтыл.рф (нужно взять оттуда стили)  
**Что делаем:** Копируем лендинг в новый репо + обновляем тексты

---

## 📁 Структура

Создай в корне репозитория:

```
tihiytyl-app/
├── landing/              ← НОВАЯ ПАПКА
│   ├── index.html       # Главная страница
│   ├── robots.txt
│   ├── sitemap.xml
│   └── .htaccess
│
├── backend/             ← (пока не трогаем)
├── frontend/            ← (пока не трогаем)
└── README.md            ← УЖЕ ЕСТЬ
```

---

## 🎨 Дизайн — копировать из старого лендинга

**Источник стилей:** https://тихийтыл.рф

**Что сохранить:**
- ✅ Цветовая схема (тёмная тема)
- ✅ Шрифт (IBM Plex Sans)
- ✅ Общий дизайн и структура
- ✅ Анимации и визуальные эффекты

**CSS переменные (скопировать как есть):**
```css
:root {
    --bg-primary: #0F1923;
    --bg-secondary: #162230;
    --bg-card: #1A2A3A;
    --text-primary: #E8ECF0;
    --text-secondary: #9EACBA;
    --accent: #4A90A4;
    --accent-hover: #5BA3B8;
    --border: rgba(255, 255, 255, 0.06);
    --radius: 12px;
}
```

---

## ✏️ Изменения контента

### **1. Заголовок (Hero Section)**

**БЫЛО:**
```
ТихийТыл
Твой личный AI-помощник для психологической поддержки
```

**СТАЛО:**
```
ТихийТыл
Голосовой дневник и техники самопомощи для ветеранов
```

---

### **2. Подзаголовок**

**БЫЛО:**
```
Умный ассистент, который всегда рядом. 
Без осуждения. Анонимно. 24/7.
```

**СТАЛО:**
```
Записывай как прошёл день. Практикуй техники. 
Работай с психологом. Анонимно. 24/7.
```

---

### **3. Кнопка CTA (Call To Action)**

**БЫЛО:**
```
<a href="/chat" class="cta-button">Начать разговор</a>
```

**СТАЛО:**
```
<a href="/app" class="cta-button">Начать</a>
```

**Важно:** Ссылка ведёт на `/app` (приложение, создадим в следующем модуле)

---

### **4. Блок "Как работает"**

**БЫЛО:**
```html
<h2>Как работает</h2>

<div class="features">
  <div class="feature">
    <h3>🎤 Говори</h3>
    <p>Расскажи что беспокоит. AI-помощник выслушает без осуждения.</p>
  </div>
  
  <div class="feature">
    <h3>💭 Получи поддержку</h3>
    <p>Умный ассистент предложит техники и даст рекомендации.</p>
  </div>
  
  <div class="feature">
    <h3>📊 Отслеживай прогресс</h3>
    <p>Следи за динамикой состояния вместе с психологом.</p>
  </div>
</div>
```

**СТАЛО:**
```html
<h2>Как работает</h2>

<div class="features">
  <div class="feature">
    <h3>🎤 Записывай</h3>
    <p>Говори в приложение о том, как прошёл день. Голосом или текстом.</p>
  </div>
  
  <div class="feature">
    <h3>🧘 Практикуй</h3>
    <p>Библиотека проверенных техник самопомощи с голосовыми инструкциями.</p>
  </div>
  
  <div class="feature">
    <h3>📊 Отслеживай</h3>
    <p>Психолог видит твою динамику и может помочь эффективнее.</p>
  </div>
</div>
```

---

### **5. Блок "Для кого"**

**БЫЛО:**
```html
<h2>ТихийТыл помогает</h2>

<ul>
  <li>Ветеранам боевых действий</li>
  <li>Людям с ПТСР</li>
  <li>Тем, кто не готов к психологу</li>
  <li>Между сеансами терапии</li>
</ul>
```

**СТАЛО:**
```html
<h2>ТихийТыл для тебя, если</h2>

<ul>
  <li>Ты ветеран и тяжело после службы</li>
  <li>Хочешь справляться с состоянием между визитами к психологу</li>
  <li>Нужны техники самопомощи в моменты тревоги или паники</li>
  <li>Психолог просил вести дневник, но неудобно писать</li>
</ul>
```

---

### **6. Footer (подвал)**

**БЫЛО:**
```html
<footer>
  <p>ТихийТыл — не заменяет профессиональную помощь.</p>
  <p>При серьёзных состояниях обратись к психологу.</p>
  <p>&copy; 2026 ТихийТыл</p>
</footer>
```

**СТАЛО:**
```html
<footer>
  <p>ТихийТыл — инструмент поддержки между сеансами с психологом.</p>
  <p>Не заменяет профессиональную помощь. При кризисе — обратись к специалисту.</p>
  <p>&copy; 2026 ТихийТыл | <a href="mailto:support@тихийтыл.рф">Поддержка</a></p>
</footer>
```

---

## 🗑️ Что УДАЛИТЬ

**Убрать все упоминания:**
- ❌ "AI-помощник"
- ❌ "Умный ассистент"
- ❌ "ИИ"
- ❌ "Искусственный интеллект"
- ❌ "AI-диалог"
- ❌ "Разговор с ботом"

**Если в коде есть:**
- Страница `/chat` или `/chat/` — удалить
- Ссылки на AI — удалить

---

## 📄 Файлы для создания

### **1. landing/index.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ТихийТыл — Голосовой дневник для ветеранов</title>
    <meta name="description" content="Голосовой дневник настроения + техники самопомощи для ветеранов с ПТСР. Работай с психологом эффективнее.">
    
    <!-- Шрифт -->
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <style>
        /* CSS переменные */
        :root {
            --bg-primary: #0F1923;
            --bg-secondary: #162230;
            --bg-card: #1A2A3A;
            --text-primary: #E8ECF0;
            --text-secondary: #9EACBA;
            --accent: #4A90A4;
            --accent-hover: #5BA3B8;
            --border: rgba(255, 255, 255, 0.06);
            --radius: 12px;
        }
        
        /* Базовые стили */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }
        
        /* Контейнер */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Hero секция */
        .hero {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px 20px;
        }
        
        .hero h1 {
            font-size: 4rem;
            font-weight: 600;
            margin-bottom: 20px;
            background: linear-gradient(135deg, var(--text-primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero p {
            font-size: 1.5rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin-bottom: 40px;
        }
        
        /* Кнопка */
        .cta-button {
            display: inline-block;
            padding: 16px 48px;
            background: var(--accent);
            color: var(--text-primary);
            text-decoration: none;
            border-radius: var(--radius);
            font-size: 1.2rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            background: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(74, 144, 164, 0.3);
        }
        
        /* Секции */
        section {
            padding: 80px 20px;
        }
        
        section h2 {
            font-size: 2.5rem;
            text-align: center;
            margin-bottom: 60px;
        }
        
        /* Features */
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            margin-top: 40px;
        }
        
        .feature {
            background: var(--bg-card);
            padding: 32px;
            border-radius: var(--radius);
            border: 1px solid var(--border);
        }
        
        .feature h3 {
            font-size: 1.5rem;
            margin-bottom: 16px;
        }
        
        .feature p {
            color: var(--text-secondary);
        }
        
        /* Список */
        ul {
            max-width: 600px;
            margin: 0 auto;
            list-style: none;
        }
        
        ul li {
            padding: 16px;
            margin-bottom: 12px;
            background: var(--bg-card);
            border-radius: 8px;
            border-left: 4px solid var(--accent);
        }
        
        /* Footer */
        footer {
            background: var(--bg-secondary);
            padding: 40px 20px;
            text-align: center;
            color: var(--text-secondary);
        }
        
        footer p {
            margin-bottom: 8px;
        }
        
        footer a {
            color: var(--accent);
            text-decoration: none;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero p {
                font-size: 1.2rem;
            }
        }
    </style>
</head>
<body>
    
    <!-- Hero секция -->
    <section class="hero">
        <h1>ТихийТыл</h1>
        <p>Голосовой дневник и техники самопомощи для ветеранов</p>
        <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 40px;">
            Записывай как прошёл день. Практикуй техники.<br>
            Работай с психологом. Анонимно. 24/7.
        </p>
        <a href="/app" class="cta-button">Начать</a>
    </section>
    
    <!-- Как работает -->
    <section class="container">
        <h2>Как работает</h2>
        
        <div class="features">
            <div class="feature">
                <h3>🎤 Записывай</h3>
                <p>Говори в приложение о том, как прошёл день. Голосом или текстом — как удобно.</p>
            </div>
            
            <div class="feature">
                <h3>🧘 Практикуй</h3>
                <p>Библиотека проверенных техник самопомощи с голосовыми инструкциями от психологов.</p>
            </div>
            
            <div class="feature">
                <h3>📊 Отслеживай</h3>
                <p>Психолог видит твою динамику и помогает эффективнее. Ты видишь свой прогресс.</p>
            </div>
        </div>
    </section>
    
    <!-- Для кого -->
    <section class="container">
        <h2>ТихийТыл для тебя, если</h2>
        
        <ul>
            <li>Ты ветеран и тяжело после службы</li>
            <li>Хочешь справляться с состоянием между визитами к психологу</li>
            <li>Нужны техники самопомощи в моменты тревоги или паники</li>
            <li>Психолог просил вести дневник, но неудобно писать</li>
        </ul>
    </section>
    
    <!-- Footer -->
    <footer>
        <p>ТихийТыл — инструмент поддержки между сеансами с психологом.</p>
        <p>Не заменяет профессиональную помощь. При кризисе — обратись к специалисту.</p>
        <p>&copy; 2026 ТихийТыл | <a href="mailto:support@тихийтыл.рф">Поддержка</a></p>
    </footer>
    
</body>
</html>
```

---

### **2. landing/robots.txt**

```txt
User-agent: *
Allow: /

Sitemap: https://тихийтыл.рф/sitemap.xml
```

---

### **3. landing/sitemap.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://тихийтыл.рф/</loc>
    <lastmod>2026-04-15</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://тихийтыл.рф/app</loc>
    <lastmod>2026-04-15</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

### **4. landing/.htaccess**

```apache
# Редирект на HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Кеширование
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Сжатие
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

## ✅ Критерии готовности

- [ ] Папка `landing/` создана в корне репо
- [ ] `index.html` создан с обновлённым контентом
- [ ] Все упоминания AI удалены
- [ ] Кнопка "Начать" ведёт на `/app`
- [ ] Дизайн соответствует оригинальному лендингу
- [ ] `robots.txt`, `sitemap.xml`, `.htaccess` созданы
- [ ] Файлы закоммичены в Git

---

## 🚀 После создания

```bash
cd ~/Developer/tihiytyl-app

# Посмотреть что создано
ls -la landing/

# Открыть локально
open landing/index.html

# Закоммитить
git add landing/
git commit -m "feat: обновить лендинг под новую концепцию (дневник + техники)"
git push
```

---

## 📝 Заметки

- Это минимальная версия лендинга для MVP
- Можно добавить больше секций позже (отзывы, FAQ, цены)
- Стили скопированы из оригинального лендинга
- Ссылка `/app` пока ведёт в никуда (создадим в Модуле 1)

---

**Модуль 0 готов к реализации!** ✅
