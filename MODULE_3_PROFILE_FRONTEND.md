# 📋 ТЗ Модуль 3 (Часть 2): Профиль клиента — Frontend

## 🎯 Цель

Создать страницу профиля клиента с отображением кода-позывного, позитивной статистики, настроек и интеграцией умных рекомендаций в дневник.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** Профиль клиента (frontend)  
**Зависимости:** Backend из Части 1 должен быть готов

---

## 📁 Структура файлов

```
frontend/client/
  index.html         ← ОБНОВИТЬ (добавить кнопку "Профиль")
  profile.html       ← СОЗДАТЬ (страница профиля)
  diary.html         ← ОБНОВИТЬ (интеграция рекомендаций)
  assets/
    css/style.css    ← ОБНОВИТЬ (стили профиля)
    js/
      profile.js     ← СОЗДАТЬ (логика профиля)
      app.js         ← ОБНОВИТЬ (интеграция рекомендаций)
```

---

## 🎨 Дизайн

**Цвета (из лендинга):**
```css
--bg-primary: #0F1923;
--bg-secondary: #162230;
--bg-card: #1A2A3A;
--text-primary: #E8ECF0;
--text-secondary: #9EACBA;
--accent: #4A90A4;
--accent-hover: #5BA3B8;
```

---

## 📱 Страница: profile.html

**Создай файл:** `frontend/client/profile.html`

### **Полный HTML:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Профиль — Тихий Тыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    
    <div class="container">
        <h1>Профиль</h1>
        <p class="subtitle">Настройки и связь с психологом</p>
        
        <!-- Твой прогресс -->
        <section class="stats-section">
            <h2>📊 Твой прогресс</h2>
            
            <div class="stat-card">
                <div class="stat-item">
                    <span class="stat-label">Практик за неделю:</span>
                    <span class="stat-value" id="daysPracticed">Загрузка...</span>
                </div>
                
                <div class="stat-item">
                    <span class="stat-label">Тренд:</span>
                    <span class="stat-value" id="trend">Загрузка...</span>
                </div>
            </div>
            
            <!-- Техники которые помогают -->
            <div class="techniques-help-section">
                <h3>Техники которые помогают тебе</h3>
                <div id="techniquesList"></div>
            </div>
        </section>
        
        <!-- Связь с психологом -->
        <section class="psychologist-section">
            <h2>🔗 Связь с психологом</h2>
            
            <div class="code-card">
                <p>Твой код-позывной:</p>
                <div class="access-code" id="accessCode">
                    ЗАГРУЗКА...
                </div>
                <p class="code-hint">Назови его психологу для предоставления доступа к твоим данным</p>
                
                <button id="regenerateBtn" class="btn-secondary">
                    Сгенерировать новый код
                </button>
                
                <div class="connection-status">
                    <span id="connectionStatus">Статус: Загрузка...</span>
                </div>
            </div>
        </section>
        
        <!-- Настройки -->
        <section class="settings-section">
            <h2>⚙️ Настройки</h2>
            
            <div class="setting-item">
                <span class="setting-label">Режим по умолчанию:</span>
                <div class="mode-selector">
                    <button id="voiceModeBtn" class="mode-btn">
                        🎤 Голос
                    </button>
                    <button id="textModeBtn" class="mode-btn">
                        ⌨️ Текст
                    </button>
                </div>
            </div>
        </section>
        
        <a href="index.html" class="btn-secondary">← Назад на главную</a>
    </div>
    
    <script src="assets/js/profile.js"></script>
</body>
</html>
```

---

## 🎨 Стили: style.css

**Добавь в:** `frontend/client/assets/css/style.css`

### **Стили для профиля:**

```css
/* Профиль */
.subtitle {
    color: var(--text-secondary);
    margin-bottom: 32px;
    text-align: center;
}

/* Секция статистики */
.stats-section {
    margin-bottom: 48px;
}

.stat-card {
    background: var(--bg-card);
    padding: 24px;
    border-radius: var(--radius);
    margin-bottom: 24px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
}

.stat-item:not(:last-child) {
    border-bottom: 1px solid var(--border);
}

.stat-label {
    color: var(--text-secondary);
    font-size: 14px;
}

.stat-value {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
}

/* Техники которые помогают */
.techniques-help-section {
    margin-top: 24px;
}

.techniques-help-section h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: var(--text-primary);
}

#techniquesList {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.technique-stat-card {
    background: var(--bg-card);
    padding: 16px;
    border-radius: var(--radius);
    border-left: 3px solid var(--accent);
}

.technique-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.technique-stats {
    font-size: 14px;
    color: var(--text-secondary);
}

/* Секция психолога */
.psychologist-section {
    margin-bottom: 48px;
}

.code-card {
    background: var(--bg-card);
    padding: 24px;
    border-radius: var(--radius);
    text-align: center;
}

.code-card > p {
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.access-code {
    font-size: 32px;
    font-weight: bold;
    font-family: 'Courier New', monospace;
    color: var(--accent);
    background: var(--bg-primary);
    padding: 20px;
    border-radius: var(--radius);
    border: 2px solid var(--accent);
    margin-bottom: 12px;
    letter-spacing: 2px;
}

.code-hint {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.connection-status {
    margin-top: 20px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius);
    font-size: 14px;
    color: var(--text-secondary);
}

/* Настройки */
.settings-section {
    margin-bottom: 48px;
}

.setting-item {
    background: var(--bg-card);
    padding: 20px;
    border-radius: var(--radius);
    margin-bottom: 16px;
}

.setting-label {
    display: block;
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 12px;
}

.mode-selector {
    display: flex;
    gap: 12px;
}

.mode-btn {
    flex: 1;
    padding: 16px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 2px solid transparent;
    border-radius: var(--radius);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
}

.mode-btn:hover {
    border-color: var(--accent);
}

.mode-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}
```

---

## 📜 JavaScript: profile.js

**Создай файл:** `frontend/client/assets/js/profile.js`

### **Полный код:**

```javascript
const API_URL = 'http://localhost:5002';

// Загрузить код доступа
async function loadAccessCode() {
    try {
        const response = await fetch(`${API_URL}/api/profile/access-code`);
        const data = await response.json();
        
        document.getElementById('accessCode').textContent = data.code;
        
        const status = data.is_connected 
            ? 'Статус: Связан с психологом ✅' 
            : 'Статус: Не связан с психологом';
        document.getElementById('connectionStatus').textContent = status;
        
    } catch (err) {
        console.error('Ошибка загрузки кода:', err);
        document.getElementById('accessCode').textContent = 'Ошибка загрузки';
        document.getElementById('connectionStatus').textContent = 'Ошибка загрузки статуса';
    }
}

// Сгенерировать новый код
document.getElementById('regenerateBtn').addEventListener('click', async () => {
    if (!confirm('Сгенерировать новый код? Старый код перестанет работать.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/profile/access-code/regenerate`, {
            method: 'POST'
        });
        const data = await response.json();
        
        document.getElementById('accessCode').textContent = data.code;
        document.getElementById('connectionStatus').textContent = 'Статус: Не связан с психологом';
        alert('Новый код создан!');
        
    } catch (err) {
        console.error('Ошибка создания кода:', err);
        alert('Ошибка создания кода');
    }
});

// Загрузить статистику
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/profile/stats`);
        const data = await response.json();
        
        // Практики за неделю
        document.getElementById('daysPracticed').textContent = 
            `${data.days_practiced} из 7 дней`;
        
        // Тренд
        const trendText = data.trend === 'improving' 
            ? 'Становится лучше ✅' 
            : 'Стабильно';
        document.getElementById('trend').textContent = trendText;
        
        // Техники
        const techniquesList = document.getElementById('techniquesList');
        
        if (data.helpful_techniques.length === 0) {
            techniquesList.innerHTML = '<p style="color: var(--text-secondary);">Пока нет данных. Попробуй техники, чтобы увидеть что работает!</p>';
            return;
        }
        
        techniquesList.innerHTML = '';
        data.helpful_techniques.forEach(tech => {
            const card = document.createElement('div');
            card.className = 'technique-stat-card';
            
            const successRate = Math.round((tech.success_count / tech.total_uses) * 100);
            const emoji = successRate >= 70 ? '✅' : '😐';
            
            card.innerHTML = `
                <div class="technique-name">${emoji} ${tech.name}</div>
                <div class="technique-stats">
                    Помогло ${tech.success_count} раз из ${tech.total_uses}
                </div>
            `;
            
            techniquesList.appendChild(card);
        });
        
    } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        document.getElementById('daysPracticed').textContent = 'Ошибка загрузки';
        document.getElementById('trend').textContent = 'Ошибка загрузки';
    }
}

// Загрузить настройки
async function loadPreferences() {
    try {
        const response = await fetch(`${API_URL}/api/profile/preferences`);
        const data = await response.json();
        
        // Установить активный режим
        const voiceBtn = document.getElementById('voiceModeBtn');
        const textBtn = document.getElementById('textModeBtn');
        
        if (data.default_input_mode === 'voice') {
            voiceBtn.classList.add('active');
            textBtn.classList.remove('active');
        } else {
            textBtn.classList.add('active');
            voiceBtn.classList.remove('active');
        }
        
    } catch (err) {
        console.error('Ошибка загрузки настроек:', err);
    }
}

// Изменить режим
async function changeMode(mode) {
    try {
        await fetch(`${API_URL}/api/profile/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ default_input_mode: mode })
        });
        
        // Обновить UI
        const voiceBtn = document.getElementById('voiceModeBtn');
        const textBtn = document.getElementById('textModeBtn');
        
        if (mode === 'voice') {
            voiceBtn.classList.add('active');
            textBtn.classList.remove('active');
        } else {
            textBtn.classList.add('active');
            voiceBtn.classList.remove('active');
        }
        
    } catch (err) {
        console.error('Ошибка сохранения настроек:', err);
        alert('Ошибка сохранения настроек');
    }
}

// Обработчики кнопок
document.getElementById('voiceModeBtn').addEventListener('click', () => changeMode('voice'));
document.getElementById('textModeBtn').addEventListener('click', () => changeMode('text'));

// Инициализация при загрузке страницы
loadAccessCode();
loadStats();
loadPreferences();
```

---

## 🔄 Обновить: index.html

**Добавь кнопку "Профиль" в меню:**

```html
<!-- Меню на главной странице -->
<div class="menu-grid">
    <a href="diary.html" class="menu-card">
        <div class="menu-icon">🎤</div>
        <h2>Дневник настроения</h2>
        <p>Запиши голосом или текстом как прошёл день</p>
    </a>
    
    <a href="entries.html" class="menu-card">
        <div class="menu-icon">📋</div>
        <h2>Мои записи</h2>
        <p>Посмотреть историю записей</p>
    </a>
    
    <a href="techniques.html" class="menu-card">
        <div class="menu-icon">🛡️</div>
        <h2>Техники самопомощи</h2>
        <p>Практики для работы с состояниями</p>
    </a>
    
    <!-- НОВАЯ КНОПКА -->
    <a href="profile.html" class="menu-card">
        <div class="menu-icon">👤</div>
        <h2>Профиль</h2>
        <p>Настройки и связь с психологом</p>
    </a>
</div>
```

**Стили для меню (если ещё нет):**

```css
.menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin: 40px 0;
}

.menu-card {
    background: var(--bg-card);
    padding: 32px;
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--text-primary);
    transition: all 0.2s;
    border: 2px solid transparent;
}

.menu-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
}

.menu-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.menu-card h2 {
    font-size: 20px;
    margin-bottom: 8px;
}

.menu-card p {
    font-size: 14px;
    color: var(--text-secondary);
}
```

---

## 🔄 Обновить: diary.html (интеграция рекомендаций)

**Добавь в:** `frontend/client/assets/js/app.js` (или diary.js)

### **Интеграция умных рекомендаций:**

```javascript
// После выбора эмодзи в дневнике

async function handleEmojiSelection(painLevel, emoji) {
    selectedPainLevel = painLevel;
    selectedEmoji = emoji;
    
    // Показать кнопку сохранения
    document.getElementById('saveBtn').classList.remove('hidden');
    
    // Если состояние плохое (<=5), предложить технику
    if (painLevel <= 5) {
        await offerTechnique(painLevel);
    }
}

async function offerTechnique(painLevel) {
    try {
        // Получить рекомендацию
        const response = await fetch(
            `http://localhost:5002/api/recommendations?pain_level=${painLevel}`
        );
        const data = await response.json();
        
        if (data.technique) {
            // Показать предложение
            showTechniqueOfferModal(data.technique);
        }
        
    } catch (err) {
        console.error('Ошибка получения рекомендации:', err);
    }
}

function showTechniqueOfferModal(technique) {
    // Создать модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'techniqueOfferModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Хочешь попробовать технику?</h3>
            <p>${technique.message}</p>
            <div class="modal-actions">
                <button onclick="startRecommendedTechnique(${technique.id})" class="btn-primary">
                    Да, попробуем
                </button>
                <button onclick="closeTechniqueOffer()" class="btn-secondary">
                    Нет, спасибо
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function startRecommendedTechnique(techniqueId) {
    // Перейти на проигрыватель техники
    window.location.href = `technique-player.html?id=${techniqueId}&pain_before=${selectedPainLevel}`;
}

function closeTechniqueOffer() {
    const modal = document.getElementById('techniqueOfferModal');
    if (modal) {
        modal.remove();
    }
}
```

**Стили для модального окна:**

```css
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background: var(--bg-card);
    padding: 32px;
    border-radius: var(--radius);
    max-width: 500px;
    width: 100%;
}

.modal-content h3 {
    font-size: 24px;
    margin-bottom: 16px;
}

.modal-content p {
    color: var(--text-secondary);
    margin-bottom: 24px;
    line-height: 1.6;
}

.modal-actions {
    display: flex;
    gap: 12px;
}

.modal-actions button {
    flex: 1;
}
```

---

## ✅ Критерии готовности (Frontend)

- [ ] profile.html создан
- [ ] profile.js создан
- [ ] Стили добавлены в style.css
- [ ] index.html обновлён (кнопка "Профиль")
- [ ] diary.html обновлён (интеграция рекомендаций)
- [ ] Код доступа показывается
- [ ] Регенерация кода работает
- [ ] Статистика загружается
- [ ] Техники которые помогают показываются
- [ ] Настройки режима работают
- [ ] Умные рекомендации работают в дневнике

---

## 🧪 Тестирование

**Тест 1: Загрузка профиля**
1. Открыть /profile.html
2. Проверить код-позывной загрузился (БУРЯ-347)
3. Проверить статистику показывается

**Тест 2: Регенерация кода**
1. Нажать "Сгенерировать новый код"
2. Подтвердить
3. Код должен измениться

**Тест 3: Изменение режима**
1. Нажать "⌨️ Текст"
2. Кнопка должна стать активной
3. Перезагрузить страницу
4. Режим должен сохраниться

**Тест 4: Умные рекомендации**
1. Сделать запись в дневнике
2. Выбрать эмодзи 😐 (5 или ниже)
3. Должно появиться предложение техники
4. Если есть история → персональная рекомендация
5. Если нет → стандартная (дыхательная)

**Тест 5: Позитивная статистика**
1. Сделать несколько записей
2. Попробовать техники
3. Открыть профиль
4. Проверить:
   - Практик за неделю: X из 7
   - Тренд: только "Улучшается" или "Стабильно" (НЕ "Хуже")
   - Техники: только те что помогли

---

## 📝 Заметки

- Все данные загружаются асинхронно (await/async)
- Обработка ошибок через try/catch
- Модальное окно для предложения техники
- Персонализация на основе истории
- Только позитивная статистика (не пугаем клиента)

---

**Frontend готов к реализации!** ✅

**Модуль 3 полный = Backend (Часть 1) + Frontend (Часть 2)**
