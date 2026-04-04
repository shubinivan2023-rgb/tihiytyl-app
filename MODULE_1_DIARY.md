# 📋 ТЗ Модуль 1: Базовый дневник

## 🎯 Цель

Создать базовый дневник настроения с возможностью записи голосом или текстом.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** MVP — первая рабочая версия дневника  
**Предыдущий модуль:** Модуль 0 (лендинг готов)

**ВАЖНО:** Весь Python код должен использовать виртуальное окружение (venv) для изоляции зависимостей.

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

## 📁 Структура проекта

```
tihiytyl-app/
├── landing/              ← УЖЕ ЕСТЬ (Модуль 0)
│
├── backend/              ← СОЗДАТЬ
│   ├── venv/                ← Виртуальное окружение (НЕ коммитись!)
│   │   ├── bin/python       # Изолированный Python
│   │   ├── bin/pip          # Изолированный pip
│   │   └── lib/             # Пакеты проекта
│   ├── app.py           # Flask API
│   ├── models.py        # Модели БД
│   ├── diary.py         # Логика дневника
│   ├── requirements.txt # Зависимости
│   ├── database.db      # SQLite (создастся автоматически)
│   └── .gitignore           ← Должен содержать: venv/
│
└── frontend/client/      ← СОЗДАТЬ
    ├── index.html       # Главная (выбор: дневник/техники/профиль)
    ├── diary.html       # Дневник (выбор режима + запись)
    ├── entries.html     # Список записей
    └── assets/
        ├── css/
        │   └── style.css
        └── js/
            └── app.js
```

---

## 🔧 Функциональность

### **1. Выбор режима записи**

**Логика:**
- Одна запись = один режим (голос ИЛИ текст)
- Нельзя переключаться внутри записи
- После сохранения можно создать новую запись в любом режиме

**UI:**
```
Как хочешь записать?

[🎤 Голосом]  [⌨️ Текстом]
```

После выбора — показывается соответствующий интерфейс.

---

### **2. Голосовой режим**

**Интерфейс:**
```
🎤 Голосовая запись

[  ●  ] Нажми и говори
        ↓
[Идёт запись... 0:15]
        ↓
[Остановить запись]
        ↓
Расшифровка:
"Сегодня был тяжёлый день..."

Как себя чувствуешь?
😊  🙂  😐  🙁  😢
10  7   5   3   1

[Сохранить]
```

**Процесс:**
1. Нажал кнопку "Нажми и говори"
2. Браузер запрашивает доступ к микрофону
3. Запись идёт (показывается таймер)
4. Нажал "Остановить" → аудио отправляется на бэкенд
5. Бэкенд расшифровывает через Whisper
6. Показывается расшифровка
7. Выбирает эмодзи (оценка состояния)
8. Нажимает "Сохранить"

**API endpoint:**
```
POST /api/diary/voice
Content-Type: multipart/form-data

FormData:
  audio: blob (webm/ogg)

Response:
{
  "transcription": "Сегодня был тяжёлый день...",
  "success": true
}
```

---

### **3. Текстовый режим**

**Интерфейс:**
```
⌨️ Текстовая запись

┌─────────────────────────────────┐
│ Напиши как прошёл день...       │
│                                 │
│                                 │
└─────────────────────────────────┘

Как себя чувствуешь?
😊  🙂  😐  🙁  😢
10  7   5   3   1

[Сохранить]
```

**Процесс:**
1. Печатает текст в textarea
2. Выбирает эмодзи
3. Нажимает "Сохранить"

---

### **4. Эмодзи-шкала оценки состояния**

**5 вариантов (фиксированные значения):**

```
😊 Отлично      → 10
🙂 Хорошо       → 7
😐 Так себе     → 5
🙁 Плохо        → 3
😢 Очень плохо  → 1
```

**UI:**
```html
<div class="emoji-scale">
  <button class="emoji-btn" data-value="10">
    <span class="emoji">😊</span>
    <span class="label">Отлично</span>
  </button>
  <button class="emoji-btn" data-value="7">
    <span class="emoji">🙂</span>
    <span class="label">Хорошо</span>
  </button>
  <button class="emoji-btn" data-value="5">
    <span class="emoji">😐</span>
    <span class="label">Так себе</span>
  </button>
  <button class="emoji-btn" data-value="3">
    <span class="emoji">🙁</span>
    <span class="label">Плохо</span>
  </button>
  <button class="emoji-btn" data-value="1">
    <span class="emoji">😢</span>
    <span class="label">Очень плохо</span>
  </button>
</div>
```

**CSS:**
```css
.emoji-scale {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 24px 0;
}

.emoji-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-card);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.emoji-btn:hover {
  border-color: var(--accent);
}

.emoji-btn.selected {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.emoji {
  font-size: 32px;
}

.label {
  font-size: 12px;
  color: var(--text-secondary);
}
```

---

### **5. Сохранение в БД**

**API endpoint:**
```
POST /api/diary/save

JSON:
{
  "transcription": "Сегодня был тяжёлый день...",
  "input_type": "voice",  // или "text"
  "pain_level": 3,
  "emoji": "🙁"
}

Response:
{
  "id": 42,
  "success": true
}
```

---

### **6. Список записей**

**Страница:** `/entries.html`

**Интерфейс:**
```
Мои записи

┌─────────────────────────────────┐
│ 3 апреля, 15:30       🙁 (3/10) │
│ "Сегодня был тяжёлый день..."   │
│ [Подробнее]                     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 2 апреля, 10:15       🙂 (7/10) │
│ "Хорошо выспался, бодрое утро"  │
│ [Подробнее]                     │
└─────────────────────────────────┘

[+ Создать запись]
```

**API endpoint:**
```
GET /api/diary/entries

Response:
{
  "entries": [
    {
      "id": 42,
      "transcription": "Сегодня был тяжёлый день...",
      "pain_level": 3,
      "emoji": "🙁",
      "input_type": "voice",
      "created_at": "2026-04-03T15:30:00"
    },
    ...
  ]
}
```

---

## 🗄️ База данных

### **Таблица: diary_entries**

```sql
CREATE TABLE diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,              -- Пока один пользователь (для MVP)
    transcription TEXT NOT NULL,
    input_type TEXT NOT NULL,               -- 'voice' или 'text'
    pain_level INTEGER NOT NULL,            -- 1, 3, 5, 7, 10
    emoji TEXT NOT NULL,                    -- '😊', '🙂', '😐', '🙁', '😢'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Пример записи:**
```sql
INSERT INTO diary_entries (transcription, input_type, pain_level, emoji)
VALUES ('Сегодня был тяжёлый день...', 'voice', 3, '🙁');
```

---

## 🔨 Бэкенд (Flask)

### **ВАЖНО: Использование виртуального окружения**

**Все зависимости должны устанавливаться в venv, НЕ глобально!**

**Причины:**
- Изоляция зависимостей проекта
- Избежание конфликтов версий
- Whisper — тяжёлая библиотека (не засорять систему)
- Легко воспроизвести на другом компьютере

---

### **backend/requirements.txt**

```txt
Flask==3.0.0
Flask-CORS==4.0.0
openai-whisper==20231117
```

---

### **backend/app.py**

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import whisper
import tempfile
import os

app = Flask(__name__)
CORS(app)

# Whisper модель (base для скорости)
model = whisper.load_model("base")

# Подключение к БД
def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Создание таблицы (если не существует)
def init_db():
    conn = get_db()
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
    conn.commit()
    conn.close()

# API: Расшифровка голоса
@app.route('/api/diary/voice', methods=['POST'])
def transcribe_voice():
    try:
        audio_file = request.files['audio']
        
        # Сохранить временно
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
            audio_file.save(tmp.name)
            tmp_path = tmp.name
        
        # Расшифровать через Whisper
        result = model.transcribe(tmp_path, language='ru')
        transcription = result['text']
        
        # Удалить временный файл
        os.unlink(tmp_path)
        
        return jsonify({
            'transcription': transcription,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

# API: Сохранить запись
@app.route('/api/diary/save', methods=['POST'])
def save_entry():
    try:
        data = request.json
        
        conn = get_db()
        conn.execute('''
            INSERT INTO diary_entries (transcription, input_type, pain_level, emoji)
            VALUES (?, ?, ?, ?)
        ''', (
            data['transcription'],
            data['input_type'],
            data['pain_level'],
            data['emoji']
        ))
        conn.commit()
        entry_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        conn.close()
        
        return jsonify({
            'id': entry_id,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

# API: Получить записи
@app.route('/api/diary/entries', methods=['GET'])
def get_entries():
    try:
        conn = get_db()
        rows = conn.execute('''
            SELECT * FROM diary_entries
            ORDER BY created_at DESC
            LIMIT 50
        ''').fetchall()
        conn.close()
        
        entries = [{
            'id': row['id'],
            'transcription': row['transcription'],
            'input_type': row['input_type'],
            'pain_level': row['pain_level'],
            'emoji': row['emoji'],
            'created_at': row['created_at']
        } for row in rows]
        
        return jsonify({'entries': entries})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5003, debug=True)
```

---

## 🎨 Фронтенд

### **frontend/client/diary.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Дневник — ТихийТыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    
    <div class="container">
        <h1>Дневник настроения</h1>
        
        <!-- Выбор режима -->
        <div id="modeSelection" class="mode-selection">
            <h2>Как хочешь записать?</h2>
            <div class="mode-buttons">
                <button onclick="selectMode('voice')" class="mode-btn">
                    🎤 Голосом
                </button>
                <button onclick="selectMode('text')" class="mode-btn">
                    ⌨️ Текстом
                </button>
            </div>
        </div>
        
        <!-- Голосовой режим -->
        <div id="voiceMode" class="hidden">
            <h2>🎤 Голосовая запись</h2>
            <button id="recordBtn" class="record-btn">Нажми и говори</button>
            <div id="recordingStatus" class="hidden">
                <p>Идёт запись... <span id="timer">0:00</span></p>
                <button id="stopBtn" class="stop-btn">Остановить</button>
            </div>
            <div id="transcription" class="transcription hidden"></div>
        </div>
        
        <!-- Текстовый режим -->
        <div id="textMode" class="hidden">
            <h2>⌨️ Текстовая запись</h2>
            <textarea id="textInput" placeholder="Напиши как прошёл день..."></textarea>
        </div>
        
        <!-- Эмодзи-шкала (показывается после ввода) -->
        <div id="emojiScale" class="emoji-scale hidden">
            <h3>Как себя чувствуешь?</h3>
            <div class="emoji-buttons">
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
        </div>
        
        <!-- Кнопка сохранения -->
        <button id="saveBtn" class="save-btn hidden">Сохранить</button>
        
        <!-- Ссылка на список записей -->
        <a href="entries.html" class="view-entries">Посмотреть записи</a>
    </div>
    
    <script src="assets/js/app.js"></script>
</body>
</html>
```

---

### **frontend/client/assets/js/app.js**

```javascript
let currentMode = null;
let transcription = '';
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;
let seconds = 0;

// Выбор режима
function selectMode(mode) {
    currentMode = mode;
    
    document.getElementById('modeSelection').classList.add('hidden');
    
    if (mode === 'voice') {
        document.getElementById('voiceMode').classList.remove('hidden');
    } else {
        document.getElementById('textMode').classList.remove('hidden');
        // Показать эмодзи-шкалу сразу для текстового режима
        document.getElementById('emojiScale').classList.remove('hidden');
    }
}

// Голосовая запись
document.getElementById('recordBtn')?.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await sendAudioToBackend(audioBlob);
        };
        
        mediaRecorder.start();
        
        // UI
        document.getElementById('recordBtn').classList.add('hidden');
        document.getElementById('recordingStatus').classList.remove('hidden');
        
        // Таймер
        seconds = 0;
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('timer').textContent = 
                `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
        
    } catch (err) {
        alert('Не удалось получить доступ к микрофону');
    }
});

document.getElementById('stopBtn')?.addEventListener('click', () => {
    mediaRecorder.stop();
    clearInterval(timerInterval);
    
    document.getElementById('recordingStatus').classList.add('hidden');
});

async function sendAudioToBackend(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    try {
        const response = await fetch('http://localhost:5003/api/diary/voice', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            transcription = data.transcription;
            document.getElementById('transcription').textContent = 
                `Расшифровка: "${transcription}"`;
            document.getElementById('transcription').classList.remove('hidden');
            
            // Показать эмодзи-шкалу
            document.getElementById('emojiScale').classList.remove('hidden');
        } else {
            alert('Ошибка расшифровки: ' + data.error);
        }
    } catch (err) {
        alert('Ошибка отправки аудио');
    }
}

// Эмодзи-шкала
let selectedPainLevel = null;
let selectedEmoji = null;

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Убрать выделение у всех
        document.querySelectorAll('.emoji-btn').forEach(b => 
            b.classList.remove('selected'));
        
        // Выделить выбранный
        btn.classList.add('selected');
        
        selectedPainLevel = parseInt(btn.dataset.value);
        selectedEmoji = btn.dataset.emoji;
        
        // Показать кнопку сохранения
        document.getElementById('saveBtn').classList.remove('hidden');
    });
});

// Сохранение записи
document.getElementById('saveBtn')?.addEventListener('click', async () => {
    if (!selectedPainLevel || !selectedEmoji) {
        alert('Выбери как себя чувствуешь');
        return;
    }
    
    // Получить текст
    let text = '';
    if (currentMode === 'voice') {
        text = transcription;
    } else {
        text = document.getElementById('textInput').value.trim();
        if (!text) {
            alert('Напиши что-нибудь');
            return;
        }
    }
    
    // Отправить на бэкенд
    try {
        const response = await fetch('http://localhost:5003/api/diary/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transcription: text,
                input_type: currentMode,
                pain_level: selectedPainLevel,
                emoji: selectedEmoji
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Запись сохранена!');
            window.location.href = 'entries.html';
        } else {
            alert('Ошибка сохранения: ' + data.error);
        }
    } catch (err) {
        alert('Ошибка отправки данных');
    }
});
```

---

### **frontend/client/entries.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мои записи — ТихийТыл</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    
    <div class="container">
        <h1>Мои записи</h1>
        
        <div id="entriesList"></div>
        
        <a href="diary.html" class="btn-primary">+ Создать запись</a>
    </div>
    
    <script>
        // Загрузить записи
        async function loadEntries() {
            try {
                const response = await fetch('http://localhost:5003/api/diary/entries');
                const data = await response.json();
                
                const list = document.getElementById('entriesList');
                
                if (data.entries.length === 0) {
                    list.innerHTML = '<p>Пока нет записей</p>';
                    return;
                }
                
                data.entries.forEach(entry => {
                    const card = document.createElement('div');
                    card.className = 'entry-card';
                    
                    const date = new Date(entry.created_at);
                    const dateStr = date.toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    card.innerHTML = `
                        <div class="entry-header">
                            <span class="entry-date">${dateStr}</span>
                            <span class="entry-emoji">${entry.emoji} (${entry.pain_level}/10)</span>
                        </div>
                        <div class="entry-text">
                            ${entry.transcription.substring(0, 100)}${entry.transcription.length > 100 ? '...' : ''}
                        </div>
                    `;
                    
                    list.appendChild(card);
                });
            } catch (err) {
                alert('Ошибка загрузки записей');
            }
        }
        
        loadEntries();
    </script>
</body>
</html>
```

---

### **frontend/client/assets/css/style.css**

```css
:root {
    --bg-primary: #0F1923;
    --bg-secondary: #162230;
    --bg-card: #1A2A3A;
    --text-primary: #E8ECF0;
    --text-secondary: #9EACBA;
    --accent: #4A90A4;
    --accent-hover: #5BA3B8;
    --accent-subtle: rgba(74, 144, 164, 0.12);
    --border: rgba(255, 255, 255, 0.06);
    --radius: 12px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    padding: 40px 20px;
}

.container {
    max-width: 600px;
    margin: 0 auto;
}

h1 {
    font-size: 32px;
    margin-bottom: 32px;
    text-align: center;
}

h2 {
    font-size: 24px;
    margin-bottom: 24px;
}

h3 {
    font-size: 18px;
    margin-bottom: 16px;
}

/* Выбор режима */
.mode-selection {
    text-align: center;
    margin-bottom: 48px;
}

.mode-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
}

.mode-btn {
    padding: 24px 48px;
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
}

.mode-btn:hover {
    border-color: var(--accent);
    background: var(--accent-subtle);
}

/* Голосовой режим */
.record-btn, .stop-btn {
    display: block;
    width: 100%;
    padding: 20px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 18px;
    cursor: pointer;
    margin-bottom: 16px;
}

.record-btn:hover, .stop-btn:hover {
    background: var(--accent-hover);
}

.stop-btn {
    background: #c44;
}

#recordingStatus {
    text-align: center;
    margin-bottom: 16px;
}

.transcription {
    padding: 16px;
    background: var(--bg-card);
    border-radius: var(--radius);
    margin-bottom: 24px;
}

/* Текстовый режим */
#textInput {
    width: 100%;
    min-height: 200px;
    padding: 16px;
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    font-family: inherit;
    font-size: 16px;
    resize: vertical;
    margin-bottom: 24px;
}

#textInput:focus {
    outline: none;
    border-color: var(--accent);
}

/* Эмодзи-шкала */
.emoji-scale {
    margin-bottom: 24px;
}

.emoji-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
}

.emoji-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: var(--bg-card);
    border: 2px solid transparent;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s;
}

.emoji-btn:hover {
    border-color: var(--accent);
}

.emoji-btn.selected {
    border-color: var(--accent);
    background: var(--accent-subtle);
}

.emoji {
    font-size: 32px;
}

.label {
    font-size: 12px;
    color: var(--text-secondary);
}

/* Кнопка сохранения */
.save-btn {
    display: block;
    width: 100%;
    padding: 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 18px;
    cursor: pointer;
    margin-bottom: 24px;
}

.save-btn:hover {
    background: var(--accent-hover);
}

/* Список записей */
.entry-card {
    padding: 20px;
    background: var(--bg-card);
    border-radius: var(--radius);
    margin-bottom: 16px;
}

.entry-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--text-secondary);
}

.entry-emoji {
    font-size: 16px;
}

.entry-text {
    color: var(--text-primary);
}

/* Ссылки */
.view-entries, .btn-primary {
    display: inline-block;
    padding: 12px 24px;
    background: var(--accent);
    color: white;
    text-decoration: none;
    border-radius: var(--radius);
    text-align: center;
}

.view-entries:hover, .btn-primary:hover {
    background: var(--accent-hover);
}

/* Утилиты */
.hidden {
    display: none !important;
}
```

---

## ✅ Критерии готовности

- [ ] Backend создан и запускается (`python app.py`)
- [ ] БД создаётся автоматически
- [ ] Whisper распознаёт голос (на русском)
- [ ] Голосовой режим работает (запись → расшифровка → сохранение)
- [ ] Текстовый режим работает
- [ ] Эмодзи-шкала работает (5 вариантов)
- [ ] Записи сохраняются в БД
- [ ] Список записей показывает сохранённые данные
- [ ] Дизайн соответствует лендингу (цвета, шрифты)
- [ ] Код закоммичен в Git

---

## 🚀 Запуск

### **Backend (с venv)**

```bash
# 1. Перейти в папку backend
cd ~/Developer/tihiytyl-app/backend

# 2. Создать виртуальное окружение (ТОЛЬКО ОДИН РАЗ)
python3 -m venv venv

# 3. Активировать venv (КАЖДЫЙ РАЗ при работе)
source venv/bin/activate     # macOS/Linux
# или
venv\Scripts\activate        # Windows

# Проверить что venv активирован (должен быть префикс (venv))
# (venv) user@computer:~/Developer/tihiytyl-app/backend$

# 4. Установить зависимости (ТОЛЬКО ОДИН РАЗ или при обновлении)
pip install -r requirements.txt

# Whisper скачает модель при первом запуске (может занять время)

# 5. Запустить Flask
python app.py

# Ожидаемый вывод:
# * Running on http://0.0.0.0:5003
# * Debugger is active!

# 6. Когда закончил работу (опционально)
deactivate
```

**ПРАКТИЧНО:** 
- Всегда активируй venv перед работой: `source venv/bin/activate`
- Проверяй префикс `(venv)` в терминале
- Если забыл активировать — пакеты установятся глобально (плохо!)

---

### **Frontend**

```bash
# Вариант 1: Открыть напрямую
cd ~/Developer/tihiytyl-app/frontend/client
open diary.html

# Вариант 2: Через локальный сервер (рекомендуется)
cd ~/Developer/tihiytyl-app/frontend/client
python3 -m http.server 8000
# Открыть http://localhost:8000/diary.html
```

---

## 📝 Заметки

**Виртуальное окружение (venv):**
- ОБЯЗАТЕЛЬНО использовать для изоляции зависимостей
- Создаётся один раз: `python3 -m venv venv`
- Активируется каждый раз: `source venv/bin/activate`
- Проверка активации: в терминале должен быть префикс `(venv)`
- Папка `venv/` НЕ коммитится в Git (добавлена в .gitignore)

**Другие заметки:**
- Для MVP используем SQLite (один пользователь, `user_id=1`)
- Whisper модель `base` (быстрая, достаточная для русского)
- Аутентификация пока не нужна
- CORS включён для разработки

---

**Модуль 1 готов к реализации!** ✅
