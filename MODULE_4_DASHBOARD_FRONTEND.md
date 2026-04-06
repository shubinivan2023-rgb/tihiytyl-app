# 📋 ТЗ Модуль 4 (Часть 2): Дашборд психолога — Frontend

## 🎯 Цель

Создать интерфейс дашборда для психолога: форма входа по коду, детальная статистика клиента с графиками (Chart.js), список записей.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** Дашборд психолога (frontend)  
**Зависимости:** Backend из Части 1 готов

**ВАЖНО:** API на порту **5002**

---

## 📁 Структура файлов

```
frontend/psychologist/      ← СОЗДАТЬ (новая папка!)
  index.html               # Форма входа (ввод кода)
  dashboard.html           # Дашборд с данными
  assets/
    css/
      style.css            # Стили дашборда
    js/
      login.js             # Логика входа
      dashboard.js         # Логика дашборда
```

---

## 🎨 Дизайн

**Цвета (те же что у клиента):**
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

## 📱 Страница 1: index.html (Вход)

**Создай файл:** `frontend/psychologist/index.html`

### **Полный HTML:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход для психолога — Тихий Тыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    
    <div class="login-container">
        <div class="login-card">
            <h1>Дашборд психолога</h1>
            <p class="subtitle">Введите код-позывной клиента для доступа к данным</p>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="accessCode">Код-позывной:</label>
                    <input 
                        type="text" 
                        id="accessCode" 
                        placeholder="БУРЯ-347" 
                        autocomplete="off"
                        required
                    >
                    <p class="hint">Формат: СЛОВО-ЦЦЦ (например: БУРЯ-347)</p>
                </div>
                
                <button type="submit" class="btn-primary">
                    Войти
                </button>
                
                <div id="errorMessage" class="error-message hidden"></div>
            </form>
        </div>
    </div>
    
    <script src="assets/js/login.js"></script>
</body>
</html>
```

---

## 📱 Страница 2: dashboard.html (Дашборд)

**Создай файл:** `frontend/psychologist/dashboard.html`

### **Полный HTML:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Дашборд клиента — Тихий Тыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
    
    <div class="dashboard-container">
        
        <!-- Хедер -->
        <header class="dashboard-header">
            <h1>Дашборд клиента</h1>
            <div class="header-actions">
                <span id="clientCode" class="code-badge">Загрузка...</span>
                <button onclick="logout()" class="btn-secondary">Выход</button>
            </div>
        </header>
        
        <!-- Общая информация -->
        <section class="overview-section">
            <h2>📊 Общая информация</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Всего записей</span>
                    <span class="stat-value" id="totalEntries">0</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-label">Клиент с</span>
                    <span class="stat-value" id="clientSince">—</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-label">Средняя оценка</span>
                    <span class="stat-value" id="avgPain">—</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-label">Последняя запись</span>
                    <span class="stat-value" id="lastEntry">—</span>
                </div>
            </div>
        </section>
        
        <!-- График динамики -->
        <section class="chart-section">
            <h2>📈 Динамика состояния</h2>
            <div class="chart-container">
                <canvas id="painChart"></canvas>
            </div>
            <p class="chart-hint">
                График показывает среднюю оценку состояния по дням. 
                Меньше значение = лучше состояние.
            </p>
        </section>
        
        <!-- Статистика техник -->
        <section class="techniques-section">
            <h2>💊 Использование техник</h2>
            <div id="techniquesTable"></div>
        </section>
        
        <!-- Записи дневника -->
        <section class="entries-section">
            <h2>📝 Записи дневника</h2>
            <div id="entriesTable"></div>
            <button id="loadMoreBtn" class="btn-secondary hidden">
                Загрузить ещё
            </button>
        </section>
        
    </div>
    
    <script src="assets/js/dashboard.js"></script>
</body>
</html>
```

---

## 🎨 Стили: style.css

**Создай файл:** `frontend/psychologist/assets/css/style.css`

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
    --error: #e74c3c;
    --success: #2ecc71;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Montserrat', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

/* === Страница входа === */
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-card {
    background: var(--bg-card);
    padding: 48px;
    border-radius: var(--radius);
    max-width: 500px;
    width: 100%;
}

.login-card h1 {
    font-size: 32px;
    margin-bottom: 12px;
    text-align: center;
}

.subtitle {
    color: var(--text-secondary);
    margin-bottom: 32px;
    text-align: center;
    font-size: 14px;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-size: 14px;
}

.form-group input {
    width: 100%;
    padding: 16px;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-primary);
    font-size: 18px;
    font-family: 'Courier New', monospace;
    text-align: center;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.form-group input:focus {
    outline: none;
    border-color: var(--accent);
}

.hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary);
}

.btn-primary, .btn-secondary {
    width: 100%;
    padding: 16px;
    border: none;
    border-radius: var(--radius);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: var(--accent);
    color: white;
}

.btn-primary:hover {
    background: var(--accent-hover);
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 2px solid var(--border);
}

.btn-secondary:hover {
    border-color: var(--accent);
}

.error-message {
    margin-top: 16px;
    padding: 12px;
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid var(--error);
    border-radius: var(--radius);
    color: var(--error);
    font-size: 14px;
    text-align: center;
}

.hidden {
    display: none !important;
}

/* === Дашборд === */
.dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--border);
}

.dashboard-header h1 {
    font-size: 32px;
}

.header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
}

.code-badge {
    padding: 8px 16px;
    background: var(--accent);
    color: white;
    border-radius: var(--radius);
    font-family: 'Courier New', monospace;
    font-weight: bold;
    letter-spacing: 1px;
}

/* Секции */
section {
    margin-bottom: 48px;
}

section h2 {
    font-size: 24px;
    margin-bottom: 24px;
}

/* Статистика */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.stat-card {
    background: var(--bg-card);
    padding: 24px;
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.stat-label {
    color: var(--text-secondary);
    font-size: 14px;
}

.stat-value {
    color: var(--text-primary);
    font-size: 28px;
    font-weight: bold;
}

/* График */
.chart-container {
    background: var(--bg-card);
    padding: 24px;
    border-radius: var(--radius);
    margin-bottom: 12px;
}

.chart-hint {
    font-size: 13px;
    color: var(--text-secondary);
    text-align: center;
}

/* Таблица техник */
.techniques-table {
    background: var(--bg-card);
    border-radius: var(--radius);
    overflow: hidden;
}

.technique-row {
    padding: 16px 20px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 16px;
    align-items: center;
    border-bottom: 1px solid var(--border);
}

.technique-row:last-child {
    border-bottom: none;
}

.technique-row.header {
    background: var(--bg-secondary);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 14px;
}

.technique-name {
    font-weight: 600;
}

.success-rate {
    color: var(--success);
}

/* Таблица записей */
.entries-table {
    background: var(--bg-card);
    border-radius: var(--radius);
    overflow: hidden;
}

.entry-card {
    padding: 20px;
    border-bottom: 1px solid var(--border);
}

.entry-card:last-child {
    border-bottom: none;
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.entry-date {
    color: var(--text-secondary);
    font-size: 14px;
}

.entry-meta {
    display: flex;
    gap: 12px;
    align-items: center;
}

.entry-emoji {
    font-size: 24px;
}

.entry-pain {
    font-weight: 600;
    color: var(--accent);
}

.entry-type {
    padding: 4px 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    font-size: 12px;
    color: var(--text-secondary);
}

.entry-text {
    color: var(--text-primary);
    line-height: 1.6;
}

/* Кнопка "Загрузить ещё" */
#loadMoreBtn {
    margin-top: 20px;
}
```

---

## 📜 JavaScript 1: login.js

**Создай файл:** `frontend/psychologist/assets/js/login.js`

```javascript
const API_URL = 'http://localhost:5002';

const form = document.getElementById('loginForm');
const codeInput = document.getElementById('accessCode');
const errorMessage = document.getElementById('errorMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        showError('Введите код-позывной');
        return;
    }
    
    // Проверка формата (СЛОВО-ЦЦЦ)
    if (!/^[А-ЯЁ]+-\d{3}$/.test(code)) {
        showError('Неверный формат кода. Пример: БУРЯ-347');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/psychologist/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.valid) {
            // Сохранить в sessionStorage
            sessionStorage.setItem('userId', data.user_id);
            sessionStorage.setItem('accessCodeId', data.access_code_id);
            sessionStorage.setItem('clientCode', code);
            sessionStorage.setItem('clientSince', data.client_since);
            
            // Перейти на дашборд
            window.location.href = 'dashboard.html';
        } else {
            showError(data.error || 'Код не найден');
        }
        
    } catch (err) {
        console.error('Ошибка проверки кода:', err);
        showError('Ошибка соединения с сервером');
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Автофокус на поле ввода
codeInput.focus();
```

---

## 📜 JavaScript 2: dashboard.js

**Создай файл:** `frontend/psychologist/assets/js/dashboard.js`

```javascript
const API_URL = 'http://localhost:5002';

// Проверка авторизации
const userId = sessionStorage.getItem('userId');
const accessCodeId = sessionStorage.getItem('accessCodeId');
const clientCode = sessionStorage.getItem('clientCode');
const clientSince = sessionStorage.getItem('clientSince');

if (!userId || !accessCodeId) {
    // Не авторизован
    window.location.href = 'index.html';
}

// Показать код в хедере
document.getElementById('clientCode').textContent = clientCode;

// Переменные для пагинации
let currentOffset = 0;
const ENTRIES_PER_PAGE = 20;

// Загрузить статистику
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/psychologist/client-stats/${userId}`);
        const data = await response.json();
        
        // Общая информация
        document.getElementById('totalEntries').textContent = data.overview.total_entries;
        document.getElementById('clientSince').textContent = 
            formatDate(clientSince);
        document.getElementById('avgPain').textContent = 
            data.overview.avg_pain_level || '—';
        document.getElementById('lastEntry').textContent = 
            formatDate(data.overview.last_entry_date);
        
        // График динамики
        renderChart(data.timeline);
        
        // Таблица техник
        renderTechniquesTable(data.techniques);
        
    } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        alert('Ошибка загрузки данных');
    }
}

// Отрисовка графика
function renderChart(timeline) {
    const ctx = document.getElementById('painChart').getContext('2d');
    
    // Подготовка данных
    const dates = timeline.map(t => formatDate(t.date));
    const painLevels = timeline.map(t => t.avg_pain);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Оценка состояния',
                data: painLevels,
                borderColor: '#4A90A4',
                backgroundColor: 'rgba(74, 144, 164, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1A2A3A',
                    titleColor: '#E8ECF0',
                    bodyColor: '#9EACBA',
                    borderColor: '#4A90A4',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: (context) => `Состояние: ${context.parsed.y}/10`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    reverse: true,  // Меньше = лучше
                    ticks: {
                        color: '#9EACBA'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9EACBA',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Таблица техник
function renderTechniquesTable(techniques) {
    const container = document.getElementById('techniquesTable');
    
    if (techniques.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Клиент ещё не использовал техники</p>';
        return;
    }
    
    let html = '<div class="techniques-table">';
    
    // Заголовок
    html += `
        <div class="technique-row header">
            <div>Техника</div>
            <div>Использований</div>
            <div>Эффективность</div>
            <div>Улучшение</div>
        </div>
    `;
    
    // Данные
    techniques.forEach(tech => {
        html += `
            <div class="technique-row">
                <div class="technique-name">${tech.name}</div>
                <div>${tech.usage_count}</div>
                <div class="success-rate">${tech.success_rate}%</div>
                <div>${tech.avg_improvement > 0 ? '+' : ''}${tech.avg_improvement}</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Загрузить записи
async function loadEntries() {
    try {
        const response = await fetch(
            `${API_URL}/api/psychologist/client-entries/${userId}?limit=${ENTRIES_PER_PAGE}&offset=${currentOffset}`
        );
        const data = await response.json();
        
        renderEntries(data.entries);
        
        // Показать кнопку "Загрузить ещё" если есть ещё записи
        if (currentOffset + ENTRIES_PER_PAGE < data.total) {
            document.getElementById('loadMoreBtn').classList.remove('hidden');
        } else {
            document.getElementById('loadMoreBtn').classList.add('hidden');
        }
        
    } catch (err) {
        console.error('Ошибка загрузки записей:', err);
    }
}

// Отрисовка записей
function renderEntries(entries) {
    const container = document.getElementById('entriesTable');
    
    if (entries.length === 0 && currentOffset === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Нет записей</p>';
        return;
    }
    
    let html = currentOffset === 0 ? '<div class="entries-table">' : '';
    
    entries.forEach(entry => {
        const typeLabel = entry.input_type === 'voice' ? '🎤 Голос' : '⌨️ Текст';
        
        html += `
            <div class="entry-card">
                <div class="entry-header">
                    <span class="entry-date">${formatDateTime(entry.created_at)}</span>
                    <div class="entry-meta">
                        <span class="entry-emoji">${entry.emoji}</span>
                        <span class="entry-pain">${entry.pain_level}/10</span>
                        <span class="entry-type">${typeLabel}</span>
                    </div>
                </div>
                <div class="entry-text">${entry.transcription}</div>
            </div>
        `;
    });
    
    if (currentOffset === 0) {
        html += '</div>';
        container.innerHTML = html;
    } else {
        // Добавить к существующим
        container.querySelector('.entries-table').innerHTML += html;
    }
}

// Кнопка "Загрузить ещё"
document.getElementById('loadMoreBtn').addEventListener('click', () => {
    currentOffset += ENTRIES_PER_PAGE;
    loadEntries();
});

// Выход
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Форматирование даты
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Инициализация
loadStats();
loadEntries();
```

---

## ✅ Критерии готовности (Frontend)

- [ ] Папка frontend/psychologist создана
- [ ] index.html создан (форма входа)
- [ ] dashboard.html создан (дашборд)
- [ ] style.css создан
- [ ] login.js создан
- [ ] dashboard.js создан
- [ ] Chart.js подключен (CDN)
- [ ] Вход по коду работает
- [ ] График динамики отображается
- [ ] Статистика техник показывается
- [ ] Записи дневника загружаются
- [ ] Пагинация работает ("Загрузить ещё")

---

## 🧪 Тестирование

**Тест 1: Вход**
1. Открыть /psychologist/
2. Ввести код: БУРЯ-347
3. Нажать "Войти"
4. Должен перейти на dashboard.html

**Тест 2: Дашборд**
1. Проверить общую информацию загрузилась
2. Проверить график отображается
3. Проверить таблица техник показывается
4. Проверить записи дневника загружаются

**Тест 3: Пагинация**
1. Если записей > 20
2. Должна появиться кнопка "Загрузить ещё"
3. Клик → загружаются следующие 20

**Тест 4: Выход**
1. Нажать "Выход"
2. Должен вернуться на страницу входа
3. sessionStorage очищен

---

## 📝 Заметки

- **API URL: http://localhost:5002** (не 5003!)
- Chart.js из CDN (версия 4.4.0)
- Данные сохраняются в sessionStorage
- График инвертирован (меньше = лучше)
- Пагинация по 20 записей
- Детальная статистика (без фильтрации негатива)

---

**Frontend готов к реализации!** ✅

**Модуль 4 полный = Backend (Часть 1) + Frontend (Часть 2)**
