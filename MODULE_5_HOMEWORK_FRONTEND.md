# 📋 ТЗ Модуль 5 (Часть 2): Домашние задания — Frontend

## 🎯 Цель

Создать интерфейс домашних заданий: клиент видит список домашек и отмечает выполнение, психолог создаёт и управляет домашками в дашборде.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** Домашние задания (frontend)  
**Зависимости:** Backend из Части 1 готов

**ВАЖНО:** API на порту **5002**

---

## 📁 Структура файлов

```
frontend/client/              ← Интерфейс клиента
  index.html                 # ОБНОВИТЬ (добавить кнопку "Домашки")
  homework.html              # СОЗДАТЬ (список домашек)
  assets/
    css/style.css            # ОБНОВИТЬ
    js/
      homework.js            # СОЗДАТЬ

frontend/psychologist/        ← Интерфейс психолога
  dashboard.html             # ОБНОВИТЬ (добавить секцию домашек)
  assets/
    js/
      dashboard.js           # ОБНОВИТЬ
```

---

## 🎨 Дизайн

**Цвета:**
```css
--bg-primary: #0F1923;
--bg-secondary: #162230;
--bg-card: #1A2A3A;
--text-primary: #E8ECF0;
--text-secondary: #9EACBA;
--accent: #4A90A4;
--accent-hover: #5BA3B8;
--success: #2ecc71;
--warning: #f39c12;
```

---

## 📱 Клиентская часть

### **1. Обновить: index.html**

**Добавь кнопку "Домашки" в меню:**

```html
<!-- В меню на главной странице -->
<div class="menu-grid">
    <!-- Существующие кнопки -->
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
    <a href="homework.html" class="menu-card">
        <div class="menu-icon">📚</div>
        <h2>Домашние задания</h2>
        <p id="homeworkBadge">Загрузка...</p>
    </a>
    
    <a href="profile.html" class="menu-card">
        <div class="menu-icon">👤</div>
        <h2>Профиль</h2>
        <p>Настройки и связь с психологом</p>
    </a>
</div>

<script>
// Показать количество pending домашек
async function loadHomeworkBadge() {
    try {
        const response = await fetch('http://localhost:5002/api/homework/list/1?status=pending');
        const data = await response.json();
        const count = data.homework.length;
        
        const badge = document.getElementById('homeworkBadge');
        if (count > 0) {
            badge.textContent = `${count} ${count === 1 ? 'задание' : 'заданий'}`;
            badge.style.color = 'var(--accent)';
            badge.style.fontWeight = '600';
        } else {
            badge.textContent = 'Нет новых заданий';
        }
    } catch (err) {
        console.error('Ошибка загрузки домашек:', err);
    }
}

loadHomeworkBadge();
</script>
```

---

### **2. Создать: homework.html**

**Полный HTML:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Домашние задания — Тихий Тыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    
    <div class="container">
        <h1>📚 Домашние задания</h1>
        
        <!-- Фильтр -->
        <div class="filter-tabs">
            <button class="tab-btn active" data-status="all">
                Все
            </button>
            <button class="tab-btn" data-status="pending">
                Текущие
            </button>
            <button class="tab-btn" data-status="completed">
                Выполненные
            </button>
        </div>
        
        <!-- Список домашек -->
        <div id="homeworkList"></div>
        
        <a href="index.html" class="btn-secondary">← Назад на главную</a>
    </div>
    
    <script src="assets/js/homework.js"></script>
</body>
</html>
```

---

### **3. Создать: homework.js**

**Полный код:**

```javascript
const API_URL = 'http://localhost:5002';
let currentStatus = 'all';

// Загрузить домашки
async function loadHomework(status = 'all') {
    try {
        const response = await fetch(
            `${API_URL}/api/homework/list/1?status=${status}`
        );
        const data = await response.json();
        
        renderHomework(data.homework);
        
    } catch (err) {
        console.error('Ошибка загрузки домашек:', err);
        document.getElementById('homeworkList').innerHTML = 
            '<p style="color: var(--text-secondary); text-align: center;">Ошибка загрузки</p>';
    }
}

// Отрисовка домашек
function renderHomework(homework) {
    const container = document.getElementById('homeworkList');
    
    if (homework.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Нет ${currentStatus === 'pending' ? 'текущих' : currentStatus === 'completed' ? 'выполненных' : ''} заданий</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="homework-list">';
    
    homework.forEach(hw => {
        const statusClass = hw.status === 'completed' ? 'completed' : 
                           hw.status === 'skipped' ? 'skipped' : 'pending';
        
        const statusText = hw.status === 'completed' ? '✅ Выполнено' :
                          hw.status === 'skipped' ? '⏭️ Пропущено' : '⏳ Ожидает';
        
        html += `
            <div class="homework-card ${statusClass}">
                <div class="homework-header">
                    <h3>${hw.title}</h3>
                    <span class="homework-status">${statusText}</span>
                </div>
                
                ${hw.description ? `<p class="homework-description">${hw.description}</p>` : ''}
                
                ${hw.technique_name ? `
                    <div class="homework-technique">
                        🛡️ Техника: ${hw.technique_name}
                        <button onclick="startTechnique(${hw.technique_id})" class="btn-link">
                            Начать
                        </button>
                    </div>
                ` : ''}
                
                ${hw.status === 'pending' ? `
                    <div class="homework-actions">
                        <button onclick="completeHomework(${hw.id})" class="btn-primary">
                            ✅ Выполнил
                        </button>
                        <button onclick="skipHomework(${hw.id})" class="btn-secondary">
                            ⏭️ Пропустить
                        </button>
                    </div>
                ` : ''}
                
                <div class="homework-date">
                    Назначено: ${formatDate(hw.created_at)}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Выполнить домашку
async function completeHomework(homeworkId) {
    if (!confirm('Отметить задание как выполненное?')) {
        return;
    }
    
    try {
        const response = await fetch(
            `${API_URL}/api/homework/complete/${homeworkId}`,
            { method: 'POST' }
        );
        
        const data = await response.json();
        
        if (data.success) {
            alert('Отлично! Задание выполнено! 🎉');
            loadHomework(currentStatus);
        } else {
            alert('Ошибка: ' + data.error);
        }
        
    } catch (err) {
        console.error('Ошибка:', err);
        alert('Ошибка отправки данных');
    }
}

// Пропустить домашку
async function skipHomework(homeworkId) {
    if (!confirm('Пропустить это задание?')) {
        return;
    }
    
    try {
        const response = await fetch(
            `${API_URL}/api/homework/skip/${homeworkId}`,
            { method: 'POST' }
        );
        
        const data = await response.json();
        
        if (data.success) {
            alert('Задание пропущено');
            loadHomework(currentStatus);
        } else {
            alert('Ошибка: ' + data.error);
        }
        
    } catch (err) {
        console.error('Ошибка:', err);
        alert('Ошибка отправки данных');
    }
}

// Начать технику
function startTechnique(techniqueId) {
    window.location.href = `technique-player.html?id=${techniqueId}`;
}

// Фильтры
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Обновить активную вкладку
        document.querySelectorAll('.tab-btn').forEach(b => 
            b.classList.remove('active'));
        btn.classList.add('active');
        
        // Загрузить с фильтром
        currentStatus = btn.dataset.status;
        loadHomework(currentStatus);
    });
});

// Форматирование даты
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
    });
}

// Инициализация
loadHomework('all');
```

---

### **4. Обновить: style.css**

**Добавь стили для домашек:**

```css
/* Домашние задания */
.filter-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
    border-bottom: 2px solid var(--border);
}

.tab-btn {
    padding: 12px 24px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
}

.tab-btn:hover {
    color: var(--text-primary);
}

.tab-btn.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
}

.homework-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
}

.homework-card {
    background: var(--bg-card);
    padding: 24px;
    border-radius: var(--radius);
    border-left: 4px solid var(--accent);
}

.homework-card.completed {
    border-left-color: var(--success);
    opacity: 0.8;
}

.homework-card.skipped {
    border-left-color: var(--text-secondary);
    opacity: 0.6;
}

.homework-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.homework-header h3 {
    font-size: 18px;
    margin: 0;
}

.homework-status {
    font-size: 14px;
    color: var(--text-secondary);
    white-space: nowrap;
}

.homework-description {
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.6;
}

.homework-technique {
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-link {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    text-decoration: underline;
}

.homework-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.homework-actions button {
    flex: 1;
    padding: 12px;
}

.homework-date {
    font-size: 13px;
    color: var(--text-secondary);
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
}
```

---

## 🧑‍⚕️ Интерфейс психолога

### **5. Обновить: dashboard.html**

**Добавь секцию домашек в дашборд:**

```html
<!-- После секции записей дневника -->

<!-- Домашние задания -->
<section class="homework-section">
    <h2>📚 Домашние задания</h2>
    
    <div class="homework-controls">
        <button id="createHomeworkBtn" class="btn-primary">
            + Назначить домашку
        </button>
    </div>
    
    <!-- Статистика -->
    <div class="homework-stats">
        <div class="stat-card">
            <span class="stat-label">Всего заданий</span>
            <span class="stat-value" id="hwTotal">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Выполнено</span>
            <span class="stat-value" id="hwCompleted">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Процент выполнения</span>
            <span class="stat-value" id="hwRate">0%</span>
        </div>
    </div>
    
    <!-- Список домашек -->
    <div id="homeworkTable"></div>
</section>

<!-- Модальное окно создания домашки -->
<div id="createHomeworkModal" class="modal hidden">
    <div class="modal-content">
        <h3>Назначить домашнее задание</h3>
        
        <form id="createHomeworkForm">
            <div class="form-group">
                <label>Название задания *</label>
                <input type="text" id="hwTitle" required 
                       placeholder="Практикуй дыхательную технику">
            </div>
            
            <div class="form-group">
                <label>Описание</label>
                <textarea id="hwDescription" rows="3"
                          placeholder="Делай дыхание 4-7-8 каждое утро"></textarea>
            </div>
            
            <div class="form-group">
                <label>Связанная техника (опционально)</label>
                <select id="hwTechnique">
                    <option value="">Без техники</option>
                    <!-- Загрузится из API -->
                </select>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="btn-primary">Создать</button>
                <button type="button" onclick="closeCreateModal()" class="btn-secondary">
                    Отмена
                </button>
            </div>
        </form>
    </div>
</div>
```

---

### **6. Обновить: dashboard.js**

**Добавь функции для домашек:**

```javascript
// В конец файла dashboard.js

// === ДОМАШНИЕ ЗАДАНИЯ ===

// Загрузить статистику домашек
async function loadHomeworkStats() {
    try {
        const response = await fetch(`${API_URL}/api/homework/stats/${userId}`);
        const data = await response.json();
        
        document.getElementById('hwTotal').textContent = data.total;
        document.getElementById('hwCompleted').textContent = data.completed;
        document.getElementById('hwRate').textContent = data.completion_rate + '%';
        
    } catch (err) {
        console.error('Ошибка загрузки статистики домашек:', err);
    }
}

// Загрузить список домашек
async function loadHomeworkList() {
    try {
        const response = await fetch(`${API_URL}/api/homework/list/${userId}`);
        const data = await response.json();
        
        renderHomeworkTable(data.homework);
        
    } catch (err) {
        console.error('Ошибка загрузки домашек:', err);
    }
}

// Отрисовка таблицы домашек
function renderHomeworkTable(homework) {
    const container = document.getElementById('homeworkTable');
    
    if (homework.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Нет назначенных заданий</p>';
        return;
    }
    
    let html = '<div class="homework-table">';
    
    homework.forEach(hw => {
        const statusBadge = hw.status === 'completed' ? '✅ Выполнено' :
                           hw.status === 'skipped' ? '⏭️ Пропущено' : '⏳ Ожидает';
        
        html += `
            <div class="homework-row">
                <div class="hw-info">
                    <strong>${hw.title}</strong>
                    ${hw.technique_name ? `<span class="hw-technique">🛡️ ${hw.technique_name}</span>` : ''}
                </div>
                <div class="hw-status">${statusBadge}</div>
                <div class="hw-actions">
                    <button onclick="deleteHomework(${hw.id})" class="btn-danger-small">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Открыть модальное окно создания
document.getElementById('createHomeworkBtn').addEventListener('click', async () => {
    // Загрузить техники для выбора
    try {
        const response = await fetch(`${API_URL}/api/techniques`);
        const data = await response.json();
        
        const select = document.getElementById('hwTechnique');
        select.innerHTML = '<option value="">Без техники</option>';
        
        data.techniques.forEach(tech => {
            select.innerHTML += `<option value="${tech.id}">${tech.name}</option>`;
        });
        
    } catch (err) {
        console.error('Ошибка загрузки техник:', err);
    }
    
    document.getElementById('createHomeworkModal').classList.remove('hidden');
});

// Закрыть модальное окно
function closeCreateModal() {
    document.getElementById('createHomeworkModal').classList.add('hidden');
    document.getElementById('createHomeworkForm').reset();
}

// Создать домашку
document.getElementById('createHomeworkForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('hwTitle').value.trim();
    const description = document.getElementById('hwDescription').value.trim();
    const techniqueId = document.getElementById('hwTechnique').value;
    
    if (!title) {
        alert('Введите название задания');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/homework/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                title: title,
                description: description || null,
                technique_id: techniqueId || null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Домашка назначена!');
            closeCreateModal();
            loadHomeworkStats();
            loadHomeworkList();
        } else {
            alert('Ошибка: ' + data.error);
        }
        
    } catch (err) {
        console.error('Ошибка создания домашки:', err);
        alert('Ошибка отправки данных');
    }
});

// Удалить домашку
async function deleteHomework(homeworkId) {
    if (!confirm('Удалить это задание?')) {
        return;
    }
    
    try {
        const response = await fetch(
            `${API_URL}/api/homework/delete/${homeworkId}`,
            { method: 'DELETE' }
        );
        
        const data = await response.json();
        
        if (data.success) {
            alert('Задание удалено');
            loadHomeworkStats();
            loadHomeworkList();
        } else {
            alert('Ошибка: ' + data.error);
        }
        
    } catch (err) {
        console.error('Ошибка:', err);
        alert('Ошибка удаления');
    }
}

// Добавить в инициализацию
loadHomeworkStats();
loadHomeworkList();
```

---

### **7. Обновить: style.css (психолог)**

**Добавь стили:**

```css
/* Модальное окно */
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
    margin-bottom: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-secondary);
    font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 12px;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--accent);
}

.modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.modal-actions button {
    flex: 1;
}

/* Домашки в дашборде */
.homework-controls {
    margin-bottom: 24px;
}

.homework-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.homework-table {
    background: var(--bg-card);
    border-radius: var(--radius);
    overflow: hidden;
}

.homework-row {
    padding: 16px 20px;
    display: grid;
    grid-template-columns: 2fr 1fr auto;
    gap: 16px;
    align-items: center;
    border-bottom: 1px solid var(--border);
}

.homework-row:last-child {
    border-bottom: none;
}

.hw-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.hw-technique {
    font-size: 13px;
    color: var(--text-secondary);
}

.btn-danger-small {
    padding: 8px 12px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.btn-danger-small:hover {
    background: #c0392b;
}
```

---

## ✅ Критерии готовности (Frontend)

**Клиент:**
- [ ] index.html обновлён (кнопка "Домашки")
- [ ] homework.html создан
- [ ] homework.js создан
- [ ] Стили добавлены
- [ ] Список домашек загружается
- [ ] Фильтры работают
- [ ] Выполнение/пропуск работают
- [ ] Связь с техниками работает

**Психолог:**
- [ ] dashboard.html обновлён (секция домашек)
- [ ] dashboard.js обновлён
- [ ] Модальное окно создания
- [ ] Статистика домашек показывается
- [ ] Создание домашки работает
- [ ] Удаление домашки работает

---

## 🧪 Тестирование

**Тест 1: Создание домашки (психолог)**
1. Открыть дашборд
2. Нажать "+ Назначить домашку"
3. Заполнить форму
4. Создать
5. Домашка появилась в списке

**Тест 2: Просмотр (клиент)**
1. Открыть /homework.html
2. Видны назначенные домашки
3. Фильтры работают

**Тест 3: Выполнение**
1. Нажать "✅ Выполнил"
2. Подтвердить
3. Статус изменился на "Выполнено"

**Тест 4: Связь с техникой**
1. Домашка с техникой
2. Нажать "Начать"
3. Открывается проигрыватель техники

---

## 📝 Заметки

- **API URL: http://localhost:5002**
- Минимальная версия (без дедлайнов)
- Статусы: pending, completed, skipped
- Связь с техниками опциональна
- Психолог создаёт, клиент выполняет

---

**Frontend готов к реализации!** ✅

**Модуль 5 полный = Backend (Часть 1) + Frontend (Часть 2)**
