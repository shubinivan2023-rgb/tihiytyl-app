# 📋 ТЗ Модуль 2: Библиотека техник самопомощи

## 🎯 Цель

Создать библиотеку техник самопомощи с голосовыми инструкциями и отслеживанием эффективности.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** Библиотека техник + интеграция с дневником  
**Предыдущий модуль:** Модуль 1 (базовый дневник готов и работает)

**Зависимости:**
- Модуль 1 должен быть рабочим (БД, API, дневник)
- venv настроен и используется

---

## 🎨 Дизайн

**Цветовая схема** (из лендинга):
```css
--bg-primary: #0F1923;
--bg-secondary: #162230;
--bg-card: #1A2A3A;
--text-primary: #E8ECF0;
--text-secondary: #9EACBA;
--accent: #4A90A4;
--accent-hover: #5BA3B8;
```

**Шрифт:** Inter

---

## 📁 Структура файлов

```
backend/
  venv/              ← УЖЕ ЕСТЬ
  app.py             ← ОБНОВИТЬ (добавить endpoints)
  models.py          ← ОБНОВИТЬ (добавить таблицы)
  techniques.py      ← СОЗДАТЬ (логика техник)
  requirements.txt   ← БЕЗ ИЗМЕНЕНИЙ
  audio/             ← СОЗДАТЬ
    techniques/      # Голосовые инструкции
      breathing_478.mp3
      square_breathing.mp3
      grounding_54321.mp3
      safe_place.mp3
      progressive_relaxation.mp3
      body_scan.mp3

frontend/client/
  diary.html         ← ОБНОВИТЬ (интеграция с техниками)
  techniques.html    ← СОЗДАТЬ (библиотека техник)
  technique-player.html ← СОЗДАТЬ (проигрыватель)
  assets/
    css/style.css    ← ОБНОВИТЬ
    js/app.js        ← ОБНОВИТЬ
    js/techniques.js ← СОЗДАТЬ
```

---

## 🔧 Функциональность

### **1. Структура данных**

#### **Таблица: techniques**

```sql
CREATE TABLE techniques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                    -- "Дыхание 4-7-8"
    category TEXT NOT NULL,                -- "breathing", "grounding", "relaxation", "hypnotherapy"
    duration INTEGER,                      -- Длительность в минутах
    description TEXT,                      -- Краткое описание
    instructions TEXT,                     -- Текстовые инструкции
    audio_path TEXT,                       -- Путь к аудио файлу
    order_in_category INTEGER DEFAULT 0   -- Порядок в категории
);
```

**Предзаполненные данные (seed):**
```sql
INSERT INTO techniques (name, category, duration, description, audio_path, order_in_category) VALUES
-- Дыхательные
('Дыхание 4-7-8', 'breathing', 5, 'Простая дыхательная техника для быстрого успокоения', '/audio/techniques/breathing_478.mp3', 1),
('Квадратное дыхание', 'breathing', 5, 'Дыхание на 4 счёта для снижения тревоги', '/audio/techniques/square_breathing.mp3', 2),

-- Визуальные/Заземление
('Заземление 5-4-3-2-1', 'grounding', 7, 'Техника возвращения в настоящий момент через органы чувств', '/audio/techniques/grounding_54321.mp3', 1),
('Безопасное место', 'grounding', 7, 'Визуализация безопасного пространства', '/audio/techniques/safe_place.mp3', 2),

-- Расслабление
('Прогрессивная релаксация', 'relaxation', 15, 'Последовательное расслабление мышц тела', '/audio/techniques/progressive_relaxation.mp3', 1),
('Сканирование тела', 'relaxation', 12, 'Осознанное внимание к ощущениям в теле', '/audio/techniques/body_scan.mp3', 2);
```

---

#### **Таблица: technique_usage**

```sql
CREATE TABLE technique_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    technique_id INTEGER NOT NULL,
    diary_entry_id INTEGER,               -- Связь с записью дневника
    pain_before INTEGER NOT NULL,         -- 1-10 (из дневника)
    pain_after INTEGER NOT NULL,          -- 1-10 (после техники)
    pain_change INTEGER,                  -- Разница (после - до)
    helped BOOLEAN,                       -- true если pain_change >= 1
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technique_id) REFERENCES techniques(id),
    FOREIGN KEY (diary_entry_id) REFERENCES diary_entries(id)
);
```

---

### **2. Логика предложения техник (из клиентского пути)**

**Триггер:** Оценка состояния <= 5 (😐 Так себе или хуже)

**Flow интеграции с дневником:**

```javascript
// В diary.html после выбора эмодзи

if (selectedPainLevel <= 5) {
    // Предложить технику
    showTechniqueOffer();
}

function showTechniqueOffer() {
    // Показать модальное окно
    modal.innerHTML = `
        <h3>Хочешь попробовать технику самопомощи?</h3>
        <p>Она может помочь улучшить состояние</p>
        <button onclick="startTechniques()">Да, попробуем</button>
        <button onclick="skipTechniques()">Нет, спасибо</button>
    `;
}
```

---

### **3. Последовательность техник**

**СТРОГИЙ ПОРЯДОК (для MVP):**

```
1. Первая техника → ВСЕГДА дыхательная
   (выбирается первая из категории "breathing")
   
2. Вторая техника → ВСЕГДА визуальная
   (выбирается первая из категории "grounding")
```

**Логика:**
```javascript
const techniqueSequence = [
    { category: 'breathing', order: 1 },  // Дыхание 4-7-8
    { category: 'grounding', order: 1 }   // Заземление 5-4-3-2-1
];

let currentTechniqueIndex = 0;

function getNextTechnique() {
    if (currentTechniqueIndex >= techniqueSequence.length) {
        // Закончились техники
        return null;
    }
    
    const seq = techniqueSequence[currentTechniqueIndex];
    currentTechniqueIndex++;
    
    // Получить технику из API
    return fetch(`/api/techniques/${seq.category}?order=${seq.order}`);
}
```

---

### **4. Проигрыватель техник**

**Страница:** `technique-player.html?id=<technique_id>`

**Интерфейс:**

```
╔════════════════════════════════════╗
║  🫁 Дыхание 4-7-8                  ║
║                                    ║
║  Длительность: 5 минут             ║
║                                    ║
║  ┌────────────────────────────┐   ║
║  │ ▶ Play                      │   ║
║  │ ━━━━━━━━━━━━━━━━━━━━━━━━━ │   ║
║  │ 2:30 / 5:00                 │   ║
║  └────────────────────────────┘   ║
║                                    ║
║  Инструкции:                       ║
║  Вдох на 4 счёта, задержи на 7,   ║
║  выдох на 8...                     ║
║                                    ║
║  [Закончить досрочно]              ║
╚════════════════════════════════════╝
```

**HTML:**
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Техника — Тихий Тыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    
    <div class="container">
        <div id="techniquePlayer">
            <!-- Заголовок -->
            <h1 id="techniqueName"></h1>
            <p id="techniqueDuration" class="meta"></p>
            
            <!-- Аудио проигрыватель -->
            <div class="audio-player">
                <audio id="audioElement" preload="auto">
                    <source id="audioSource" type="audio/mpeg">
                </audio>
                
                <button id="playBtn" class="play-btn">▶ Начать</button>
                <button id="pauseBtn" class="pause-btn hidden">⏸ Пауза</button>
                
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                
                <div class="time-display">
                    <span id="currentTime">0:00</span> / 
                    <span id="totalTime">0:00</span>
                </div>
            </div>
            
            <!-- Текстовые инструкции (опционально) -->
            <div id="instructions" class="instructions"></div>
            
            <!-- Кнопка завершения -->
            <button id="finishBtn" class="btn-secondary">Закончить досрочно</button>
        </div>
        
        <!-- Оценка после техники (показывается после завершения аудио) -->
        <div id="afterTechnique" class="hidden">
            <h2>Как себя чувствуешь сейчас?</h2>
            
            <div class="emoji-scale">
                <button class="emoji-btn" data-value="10" data-emoji="😊">
                    <span class="emoji">😊</span>
                    <span class="label">Отлично</span>
                </button>
                <button class="emoji-btn" data-value="7" data-emoji="🙂">
                    <span class="emoji">🙂</span>
                    <span class="label">Хорошо</span>
                </button>
                <button class="emoji-btn" data-value="5" data-emoji="😐">
                    <span class="emoji">😐</span>
                    <span class="label">Так себе</span>
                </button>
                <button class="emoji-btn" data-value="3" data-emoji="🙁">
                    <span class="emoji">🙁</span>
                    <span class="label">Плохо</span>
                </button>
                <button class="emoji-btn" data-value="1" data-emoji="😢">
                    <span class="emoji">😢</span>
                    <span class="label">Очень плохо</span>
                </button>
            </div>
            
            <button id="submitAfterBtn" class="btn-primary hidden">Продолжить</button>
        </div>
    </div>
    
    <script src="assets/js/technique-player.js"></script>
</body>
</html>
```

---

### **5. Логика оценки эффективности**

**После завершения техники:**

```javascript
// Клиент выбрал новую оценку
const painAfter = selectedPainLevel;
const painBefore = previousPainLevel;  // Из дневника
const painChange = painAfter - painBefore;

// Определить результат
let message = '';
let shouldContinue = true;

if (painChange >= 2) {
    // Значительное улучшение (было 3 → стало 5+)
    message = 'Отлично! Тебе стало значительно лучше 😊';
    shouldContinue = false;  // Не нужно больше техник
    
} else if (painChange >= 1) {
    // Незначительное улучшение (было 3 → стало 4)
    message = 'Хорошо! Маленькие шаги к цели 💪';
    
    // Предложить вторую технику
    if (currentTechniqueIndex < 2) {
        message += '\n\nХочешь попробовать ещё одну технику?';
        shouldContinue = true;
    } else {
        shouldContinue = false;
    }
    
} else {
    // Не помогло или хуже (было 3 → осталось 3 или стало 2)
    failedAttempts++;
    
    if (failedAttempts >= 2) {
        // Две техники не помогли
        message = 'Мне жаль, что техники не помогли. Рекомендую связаться с психологом для поддержки.';
        shouldContinue = false;
        showPsychologistContact = true;
        
    } else {
        // Первая техника не помогла
        message = 'Эта техника не помогла. Попробуем другую?';
        shouldContinue = true;
    }
}
```

---

### **6. Библиотека техник (отдельная страница)**

**Страница:** `techniques.html`

**Интерфейс:**

```
╔════════════════════════════════════╗
║  Библиотека техник                 ║
╚════════════════════════════════════╝

🫁 Дыхательные (3-5 мин)

┌────────────────────────────────┐
│ Дыхание 4-7-8                  │
│ 5 минут                        │
│ [Начать] [Подробнее]           │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Квадратное дыхание             │
│ 5 минут                        │
│ [Начать] [Подробнее]           │
└────────────────────────────────┘

👁️ Визуальные/Заземление (5-7 мин)

┌────────────────────────────────┐
│ Заземление 5-4-3-2-1           │
│ 7 минут                        │
│ [Начать] [Подробнее]           │
└────────────────────────────────┘

...
```

**HTML:**
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Техники — Тихий Тыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    
    <div class="container">
        <h1>Библиотека техник</h1>
        
        <!-- Дыхательные -->
        <section class="category">
            <h2>🫁 Дыхательные (3-5 мин)</h2>
            <div id="breathingTechniques" class="techniques-grid"></div>
        </section>
        
        <!-- Визуальные/Заземление -->
        <section class="category">
            <h2>👁️ Визуальные/Заземление (5-7 мин)</h2>
            <div id="groundingTechniques" class="techniques-grid"></div>
        </section>
        
        <!-- Расслабление -->
        <section class="category">
            <h2>🧘 Расслабление (10-15 мин)</h2>
            <div id="relaxationTechniques" class="techniques-grid"></div>
        </section>
    </div>
    
    <script src="assets/js/techniques.js"></script>
</body>
</html>
```

```javascript
// assets/js/techniques.js

async function loadTechniques() {
    const response = await fetch('http://localhost:5002/api/techniques');
    const data = await response.json();
    
    // Группировка по категориям
    const byCategory = {
        breathing: [],
        grounding: [],
        relaxation: []
    };
    
    data.techniques.forEach(tech => {
        byCategory[tech.category].push(tech);
    });
    
    // Отрисовка
    renderCategory('breathingTechniques', byCategory.breathing);
    renderCategory('groundingTechniques', byCategory.grounding);
    renderCategory('relaxationTechniques', byCategory.relaxation);
}

function renderCategory(containerId, techniques) {
    const container = document.getElementById(containerId);
    
    techniques.forEach(tech => {
        const card = document.createElement('div');
        card.className = 'technique-card';
        card.innerHTML = `
            <h3>${tech.name}</h3>
            <p class="duration">${tech.duration} минут</p>
            <p class="description">${tech.description}</p>
            <div class="actions">
                <button onclick="startTechnique(${tech.id})" class="btn-primary">Начать</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function startTechnique(techniqueId) {
    window.location.href = `technique-player.html?id=${techniqueId}`;
}

loadTechniques();
```

---

## 🎤 Создание аудио-файлов (запись голосом)

### **Интерфейс для записи техник (admin)**

**ОПЦИОНАЛЬНО для MVP** — можно записать файлы вручную через любой рекордер.

**Если нужен интерфейс записи:**

**Страница:** `admin/record-technique.html`

```html
<h1>Записать технику</h1>

<select id="techniqueSelect">
    <option value="1">Дыхание 4-7-8</option>
    <option value="2">Квадратное дыхание</option>
    ...
</select>

<button id="recordBtn">🎤 Записать</button>
<button id="stopBtn" class="hidden">⏹ Остановить</button>

<audio id="playback" controls class="hidden"></audio>

<button id="uploadBtn" class="hidden">Сохранить</button>

<script>
let mediaRecorder;
let audioChunks = [];

document.getElementById('recordBtn').addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('playback').src = audioUrl;
        document.getElementById('playback').classList.remove('hidden');
        document.getElementById('uploadBtn').classList.remove('hidden');
    };
    
    mediaRecorder.start();
    document.getElementById('recordBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');
});

document.getElementById('stopBtn').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('recordBtn').classList.remove('hidden');
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
    const techniqueId = document.getElementById('techniqueSelect').value;
    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
    
    const formData = new FormData();
    formData.append('audio', audioBlob, `technique_${techniqueId}.mp3`);
    formData.append('technique_id', techniqueId);
    
    await fetch('http://localhost:5002/api/techniques/upload-audio', {
        method: 'POST',
        body: formData
    });
    
    alert('Аудио сохранено!');
    audioChunks = [];
});
</script>
```

---

## 🔨 Бэкенд (Flask)

### **backend/techniques.py** (новый файл)

```python
from flask import request, jsonify
from models import get_db

# Используем функции-импорты (не Blueprint)
# Функции импортируются в app.py напрямую

# API: Получить все техники
@techniques_bp.route('/api/techniques', methods=['GET'])
def get_techniques():
    """Получить список всех техник, сгруппированных по категориям"""
    try:
        conn = get_db()
        rows = conn.execute('''
            SELECT * FROM techniques
            ORDER BY category, order_in_category
        ''').fetchall()
        conn.close()
        
        techniques = [{
            'id': row['id'],
            'name': row['name'],
            'category': row['category'],
            'duration': row['duration'],
            'description': row['description'],
            'audio_path': row['audio_path']
        } for row in rows]
        
        return jsonify({'techniques': techniques})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API: Получить технику по категории и порядку
@techniques_bp.route('/api/techniques/<category>', methods=['GET'])
def get_technique_by_category(category):
    """Получить технику из определённой категории"""
    try:
        order = request.args.get('order', 1, type=int)
        
        conn = get_db()
        row = conn.execute('''
            SELECT * FROM techniques
            WHERE category = ? AND order_in_category = ?
        ''', (category, order)).fetchone()
        conn.close()
        
        if not row:
            return jsonify({'error': 'Техника не найдена'}), 404
        
        technique = {
            'id': row['id'],
            'name': row['name'],
            'category': row['category'],
            'duration': row['duration'],
            'description': row['description'],
            'instructions': row['instructions'],
            'audio_path': row['audio_path']
        }
        
        return jsonify(technique)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API: Сохранить результат использования техники
@techniques_bp.route('/api/techniques/usage', methods=['POST'])
def save_technique_usage():
    """Сохранить результат использования техники"""
    try:
        data = request.json
        
        pain_change = data['pain_after'] - data['pain_before']
        helped = pain_change >= 1
        
        conn = get_db()
        conn.execute('''
            INSERT INTO technique_usage 
            (technique_id, diary_entry_id, pain_before, pain_after, pain_change, helped)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['technique_id'],
            data.get('diary_entry_id'),
            data['pain_before'],
            data['pain_after'],
            pain_change,
            helped
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'pain_change': pain_change,
            'helped': helped
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

# API: Загрузить аудио для техники (admin)
@techniques_bp.route('/api/techniques/upload-audio', methods=['POST'])
def upload_technique_audio():
    """Загрузить аудио файл для техники"""
    try:
        audio_file = request.files['audio']
        technique_id = request.form['technique_id']
        
        # Создать папку если не существует
        os.makedirs('audio/techniques', exist_ok=True)
        
        # Сохранить файл
        filename = f'technique_{technique_id}.mp3'
        filepath = f'audio/techniques/{filename}'
        audio_file.save(filepath)
        
        # Обновить БД
        conn = get_db()
        conn.execute('''
            UPDATE techniques
            SET audio_path = ?
            WHERE id = ?
        ''', (f'/audio/techniques/{filename}', technique_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'path': filepath})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
```

---

### **backend/app.py** (обновить)

```python
from flask import Flask, send_from_directory
from flask_cors import CORS
from techniques import techniques_bp  # Импорт нового blueprint

app = Flask(__name__)
CORS(app)

# Регистрация blueprint
app.register_blueprint(techniques_bp)

# ... остальной код из Модуля 1 ...

# Раздача аудио файлов
@app.route('/audio/<path:filename>')
def serve_audio(filename):
    return send_from_directory('audio', filename)

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5002, debug=True)
```

---

### **backend/models.py** (обновить)

```python
def init_db():
    conn = sqlite3.connect('database.db')
    
    # Таблица из Модуля 1
    conn.execute('''
        CREATE TABLE IF NOT EXISTS diary_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            transcription TEXT NOT NULL,
            input_type TEXT NOT NULL,
            pain_level INTEGER NOT NULL,
            emoji TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # НОВЫЕ ТАБЛИЦЫ для Модуля 2
    
    # Таблица техник
    conn.execute('''
        CREATE TABLE IF NOT EXISTS techniques (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            duration INTEGER,
            description TEXT,
            instructions TEXT,
            audio_path TEXT,
            order_in_category INTEGER DEFAULT 0
        )
    ''')
    
    # Таблица использования техник
    conn.execute('''
        CREATE TABLE IF NOT EXISTS technique_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            technique_id INTEGER NOT NULL,
            diary_entry_id INTEGER,
            pain_before INTEGER NOT NULL,
            pain_after INTEGER NOT NULL,
            pain_change INTEGER,
            helped BOOLEAN,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (technique_id) REFERENCES techniques(id),
            FOREIGN KEY (diary_entry_id) REFERENCES diary_entries(id)
        )
    ''')
    
    # Предзаполнение техник (только если таблица пустая)
    count = conn.execute('SELECT COUNT(*) FROM techniques').fetchone()[0]
    if count == 0:
        conn.executemany('''
            INSERT INTO techniques (name, category, duration, description, audio_path, order_in_category)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', [
            ('Дыхание 4-7-8', 'breathing', 5, 'Простая дыхательная техника для быстрого успокоения', '/audio/techniques/breathing_478.mp3', 1),
            ('Квадратное дыхание', 'breathing', 5, 'Дыхание на 4 счёта для снижения тревоги', '/audio/techniques/square_breathing.mp3', 2),
            ('Заземление 5-4-3-2-1', 'grounding', 7, 'Техника возвращения в настоящий момент через органы чувств', '/audio/techniques/grounding_54321.mp3', 1),
            ('Безопасное место', 'grounding', 7, 'Визуализация безопасного пространства', '/audio/techniques/safe_place.mp3', 2),
            ('Прогрессивная релаксация', 'relaxation', 15, 'Последовательное расслабление мышц тела', '/audio/techniques/progressive_relaxation.mp3', 1),
            ('Сканирование тела', 'relaxation', 12, 'Осознанное внимание к ощущениям в теле', '/audio/techniques/body_scan.mp3', 2)
        ])
    
    conn.commit()
    conn.close()
```

---

## 🎨 Фронтенд

### **frontend/client/assets/js/technique-player.js** (новый файл)

```javascript
// Получить ID техники из URL
const urlParams = new URLSearchParams(window.location.search);
const techniqueId = urlParams.get('id');
const painBefore = parseInt(urlParams.get('pain_before')) || 5;
const diaryEntryId = urlParams.get('entry_id');

let technique = null;
let painAfter = null;

// Загрузить технику
async function loadTechnique() {
    try {
        const response = await fetch(`http://localhost:5002/api/techniques?id=${techniqueId}`);
        technique = await response.json();
        
        // Заполнить UI
        document.getElementById('techniqueName').textContent = technique.name;
        document.getElementById('techniqueDuration').textContent = `Длительность: ${technique.duration} минут`;
        document.getElementById('instructions').textContent = technique.instructions || '';
        
        // Установить аудио
        document.getElementById('audioSource').src = `http://localhost:5002${technique.audio_path}`;
        document.getElementById('audioElement').load();
        
    } catch (err) {
        alert('Ошибка загрузки техники');
    }
}

// Проигрыватель
const audio = document.getElementById('audioElement');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

playBtn.addEventListener('click', () => {
    audio.play();
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
});

pauseBtn.addEventListener('click', () => {
    audio.pause();
    pauseBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');
});

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + '%';
    
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    // Техника завершена
    showAfterTechniqueEvaluation();
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Показать оценку после техники
function showAfterTechniqueEvaluation() {
    document.getElementById('techniquePlayer').classList.add('hidden');
    document.getElementById('afterTechnique').classList.remove('hidden');
}

// Досрочное завершение
document.getElementById('finishBtn').addEventListener('click', () => {
    if (confirm('Уверен что хочешь закончить?')) {
        showAfterTechniqueEvaluation();
    }
});

// Выбор эмодзи после техники
document.querySelectorAll('#afterTechnique .emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#afterTechnique .emoji-btn').forEach(b => 
            b.classList.remove('selected'));
        btn.classList.add('selected');
        
        painAfter = parseInt(btn.dataset.value);
        document.getElementById('submitAfterBtn').classList.remove('hidden');
    });
});

// Отправить результат
document.getElementById('submitAfterBtn').addEventListener('click', async () => {
    if (!painAfter) {
        alert('Выбери как себя чувствуешь');
        return;
    }
    
    // Сохранить использование техники
    const response = await fetch('http://localhost:5002/api/techniques/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            technique_id: techniqueId,
            diary_entry_id: diaryEntryId,
            pain_before: painBefore,
            pain_after: painAfter
        })
    });
    
    const result = await response.json();
    
    // Показать результат и следующие шаги
    handleTechniqueResult(result);
});

function handleTechniqueResult(result) {
    const painChange = result.pain_change;
    
    if (painChange >= 2) {
        // Значительное улучшение
        alert('Отлично! Тебе стало значительно лучше 😊');
        window.location.href = 'diary.html';
        
    } else if (painChange >= 1) {
        // Незначительное улучшение
        alert('Хорошо! Маленькие шаги к цели 💪\n\nХочешь попробовать ещё одну технику?');
        // TODO: Предложить вторую технику
        
    } else {
        // Не помогло
        // TODO: Подсчёт неудачных попыток
        alert('Эта техника не помогла. Попробуем другую?');
    }
}

// Инициализация
loadTechnique();
```

---

## ✅ Критерии готовности

- [ ] БД обновлена (таблицы techniques, technique_usage)
- [ ] Техники предзаполнены в БД
- [ ] API endpoints работают:
  - [ ] GET /api/techniques
  - [ ] GET /api/techniques/:category
  - [ ] POST /api/techniques/usage
  - [ ] POST /api/techniques/upload-audio
- [ ] Библиотека техник (techniques.html) работает
- [ ] Проигрыватель техник (technique-player.html) работает
- [ ] Аудио проигрывается
- [ ] Оценка после техники работает
- [ ] Результаты сохраняются в БД
- [ ] Интеграция с дневником (предложение техник при оценке <= 5)
- [ ] Логика последовательности (дыхательная → визуальная)
- [ ] Закоммичено в Git

---

## 🎤 Создание аудио-файлов

**Рекомендация для MVP:**

1. **Создай временные файлы-заглушки:**
```bash
# В macOS создай тишину
cd backend/audio/techniques
for i in breathing_478 square_breathing grounding_54321 safe_place progressive_relaxation body_scan; do
  ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 60 -q:a 9 "${i}.mp3"
done
```

2. **Потом запиши настоящие:**
   - Используй admin/record-technique.html
   - Или запиши через любой рекордер и загрузи через API

---

## 📝 Заметки

- venv обязателен (как в Модуле 1)
- Аудио файлы НЕ коммитятся (добавить в .gitignore)
- Для MVP: 2 техники в последовательности (дыхательная → визуальная)
- Расслабление и гипнотерапия — показывать в библиотеке, но не предлагать автоматически
- Интерфейс записи (admin) — опционально, можно записать вручную

---

**Модуль 2 готов к реализации!** ✅
