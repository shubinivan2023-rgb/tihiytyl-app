# 📋 ТЗ Модуль 3 (Часть 1): Профиль клиента — Backend

## 🎯 Цель

Создать backend для профиля клиента: база данных, API endpoints для кода-позывного, статистики и умных рекомендаций техник.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** Профиль клиента (backend)  
**Предыдущие модули:** 
- Модуль 1: Базовый дневник ✅
- Модуль 2: Библиотека техник ✅

**ВАЖНО:** Используй venv! Все команды pip только после `source venv/bin/activate`

---

## 📁 Структура файлов

```
backend/
  venv/              ← УЖЕ ЕСТЬ
  app.py             ← ОБНОВИТЬ (добавить blueprints)
  models.py          ← ОБНОВИТЬ (добавить таблицы)
  profile.py         ← СОЗДАТЬ (логика профиля)
  recommendations.py ← СОЗДАТЬ (умные рекомендации)
  requirements.txt   ← БЕЗ ИЗМЕНЕНИЙ
  database.db        ← Обновится автоматически
```

---

## 🗄️ База данных

### **Таблица 1: access_codes**

**Назначение:** Коды-позывные для связи клиента с психологом

```sql
CREATE TABLE IF NOT EXISTS access_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,            -- "БУРЯ-347"
    user_id INTEGER DEFAULT 1,
    psychologist_id INTEGER,              -- NULL пока не связан
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,                 -- Срок действия 7 дней
    is_active BOOLEAN DEFAULT 1           -- Можно деактивировать старый код
);

-- Индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
```

**Примеры записей:**
```sql
INSERT INTO access_codes (code, user_id, expires_at, is_active) VALUES
('БУРЯ-347', 1, datetime('now', '+7 days'), 1),
('ТИХИЙ-892', 1, datetime('now', '+7 days'), 0);  -- Старый деактивирован
```

---

### **Таблица 2: user_preferences**

**Назначение:** Настройки пользователя (режим по умолчанию)

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY DEFAULT 1,
    default_input_mode TEXT DEFAULT 'voice',  -- 'voice' или 'text'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Примеры записей:**
```sql
INSERT INTO user_preferences (user_id, default_input_mode) VALUES
(1, 'voice');
```

---

## 🔧 Backend: profile.py

**Создай файл:** `backend/profile.py`

### **Импорты и setup:**

```python
from flask import request, jsonify
from models import get_db
import random
from datetime import datetime, timedelta

# Используем функции-импорты (не Blueprint)
# Функции импортируются в app.py напрямую
```

---

### **Генерация кода-позывного:**

**Формат:** `СЛОВО-ЦИФРЫ` (военный позывной)

**Примеры:** БУРЯ-347, ТИХИЙ-892, ВОЛНА-156

```python
# Список слов для позывных (военная/природная тематика)
CALLSIGN_WORDS = [
    'БУРЯ', 'ТИХИЙ', 'ВОЛНА', 'ГРОМ', 'ВЕТЕР', 'ОГОНЬ',
    'СОКОЛ', 'ОРЁЛ', 'БАРС', 'ВОЛК', 'МЕДВЕДЬ', 'ЛЕВ',
    'СЕВЕР', 'ЮГ', 'ВОСТОК', 'ЗАПАД', 'РАССВЕТ', 'ЗАКАТ',
    'МОЛНИЯ', 'ТУМАН', 'СНЕГ', 'ДОЖДЬ', 'ГРОЗА', 'РАДУГА'
]

def generate_access_code():
    """
    Генерирует уникальный код-позывной формата СЛОВО-ЦЦЦ
    
    Returns:
        str: Код вида "БУРЯ-347"
    """
    word = random.choice(CALLSIGN_WORDS)
    number = random.randint(100, 999)
    code = f"{word}-{number}"
    
    # Проверить уникальность в БД
    conn = get_db()
    existing = conn.execute(
        'SELECT code FROM access_codes WHERE code = ?', 
        (code,)
    ).fetchone()
    conn.close()
    
    if existing:
        # Рекурсивно генерировать пока не будет уникальный
        return generate_access_code()
    
    return code
```

---

### **API Endpoint 1: GET /api/profile/access-code**

**Назначение:** Получить активный код или создать новый

**Логика:**
1. Проверить есть ли активный код (is_active=1, не истёк)
2. Если есть → вернуть его
3. Если нет → сгенерировать новый, сохранить, вернуть

```python
@profile_bp.route('/api/profile/access-code', methods=['GET'])
def get_access_code():
    """
    Получить активный код доступа или создать новый
    
    Returns:
        JSON: {
            "code": "БУРЯ-347",
            "is_connected": false,
            "created_at": "2026-04-05T10:00:00",
            "expires_at": "2026-04-12T10:00:00"
        }
    """
    try:
        user_id = 1  # Для MVP один пользователь
        
        conn = get_db()
        
        # Проверить активный код
        active_code = conn.execute('''
            SELECT code, psychologist_id, created_at, expires_at
            FROM access_codes
            WHERE user_id = ? 
            AND is_active = 1
            AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY created_at DESC
            LIMIT 1
        ''', (user_id,)).fetchone()
        
        if active_code:
            conn.close()
            return jsonify({
                'code': active_code['code'],
                'is_connected': active_code['psychologist_id'] is not None,
                'created_at': active_code['created_at'],
                'expires_at': active_code['expires_at']
            })
        
        # Создать новый код
        new_code = generate_access_code()
        expires_at = datetime.now() + timedelta(days=7)
        
        conn.execute('''
            INSERT INTO access_codes (code, user_id, expires_at)
            VALUES (?, ?, ?)
        ''', (new_code, user_id, expires_at))
        conn.commit()
        conn.close()
        
        return jsonify({
            'code': new_code,
            'is_connected': False,
            'created_at': datetime.now().isoformat(),
            'expires_at': expires_at.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### **API Endpoint 2: POST /api/profile/access-code/regenerate**

**Назначение:** Создать новый код (деактивировать старый)

```python
@profile_bp.route('/api/profile/access-code/regenerate', methods=['POST'])
def regenerate_access_code():
    """
    Создать новый код доступа (старый деактивируется)
    
    Returns:
        JSON: Новый код
    """
    try:
        user_id = 1
        
        conn = get_db()
        
        # Деактивировать все старые коды
        conn.execute('''
            UPDATE access_codes
            SET is_active = 0
            WHERE user_id = ?
        ''', (user_id,))
        
        # Создать новый
        new_code = generate_access_code()
        expires_at = datetime.now() + timedelta(days=7)
        
        conn.execute('''
            INSERT INTO access_codes (code, user_id, expires_at)
            VALUES (?, ?, ?)
        ''', (new_code, user_id, expires_at))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'code': new_code,
            'is_connected': False,
            'created_at': datetime.now().isoformat(),
            'expires_at': expires_at.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### **API Endpoint 3: GET /api/profile/stats**

**Назначение:** Позитивная статистика для клиента

**ВАЖНО:** Показываем ТОЛЬКО позитив:
- ✅ Частота практик
- ✅ Позитивный тренд (или "стабильно")
- ✅ Техники которые помогают

**НЕ показываем:**
- ❌ Конкретные цифры боли
- ❌ Графики
- ❌ Негативный тренд (вместо "хуже" → "стабильно")

```python
@profile_bp.route('/api/profile/stats', methods=['GET'])
def get_stats():
    """
    Получить позитивную статистику для клиента
    
    Returns:
        JSON: {
            "days_practiced": 5,
            "trend": "improving",  // или "stable"
            "helpful_techniques": [...]
        }
    """
    try:
        user_id = 1
        
        conn = get_db()
        
        # 1. Практики за последние 7 дней
        practices = conn.execute('''
            SELECT COUNT(DISTINCT DATE(created_at)) as days_practiced
            FROM diary_entries
            WHERE user_id = ? 
            AND created_at >= datetime('now', '-7 days')
        ''', (user_id,)).fetchone()
        
        # 2. Тренд (сравниваем последние 3 дня vs 7-10 дней назад)
        avg_recent = conn.execute('''
            SELECT AVG(pain_level) as avg_pain
            FROM diary_entries
            WHERE user_id = ?
            AND created_at >= datetime('now', '-3 days')
        ''', (user_id,)).fetchone()
        
        avg_older = conn.execute('''
            SELECT AVG(pain_level) as avg_pain
            FROM diary_entries
            WHERE user_id = ?
            AND created_at BETWEEN datetime('now', '-10 days') 
                              AND datetime('now', '-7 days')
        ''', (user_id,)).fetchone()
        
        # 3. Техники которые помогают
        # Показываем только те где helped = true
        techniques = conn.execute('''
            SELECT 
                t.name,
                COUNT(*) as total_uses,
                SUM(CASE WHEN tu.helped THEN 1 ELSE 0 END) as success_count,
                ROUND(AVG(tu.pain_change), 1) as avg_improvement
            FROM technique_usage tu
            JOIN techniques t ON tu.technique_id = t.id
            WHERE tu.user_id = ?
            GROUP BY t.id
            HAVING success_count > 0
            ORDER BY success_count DESC
            LIMIT 3
        ''', (user_id,)).fetchall()
        
        conn.close()
        
        # Определить тренд
        # ВАЖНО: Меньше pain_level = лучше!
        trend = 'stable'
        if avg_recent['avg_pain'] and avg_older['avg_pain']:
            if avg_recent['avg_pain'] < avg_older['avg_pain'] - 1:
                trend = 'improving'  # Боль уменьшилась
            # Если боль выросла → всё равно 'stable' (не пугаем)
        
        return jsonify({
            'days_practiced': practices['days_practiced'] or 0,
            'trend': trend,
            'helpful_techniques': [
                {
                    'name': t['name'],
                    'total_uses': t['total_uses'],
                    'success_count': t['success_count'],
                    'avg_improvement': t['avg_improvement']
                } for t in techniques
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### **API Endpoint 4: GET/POST /api/profile/preferences**

**Назначение:** Получить или обновить настройки (режим по умолчанию)

```python
@profile_bp.route('/api/profile/preferences', methods=['GET', 'POST'])
def preferences():
    """
    GET: Получить настройки
    POST: Обновить настройки
    
    GET Returns:
        JSON: {"default_input_mode": "voice"}
    
    POST Body:
        JSON: {"default_input_mode": "text"}
    """
    user_id = 1
    
    if request.method == 'GET':
        try:
            conn = get_db()
            prefs = conn.execute('''
                SELECT default_input_mode
                FROM user_preferences
                WHERE user_id = ?
            ''', (user_id,)).fetchone()
            conn.close()
            
            if prefs:
                return jsonify({
                    'default_input_mode': prefs['default_input_mode']
                })
            else:
                # По умолчанию голос
                return jsonify({
                    'default_input_mode': 'voice'
                })
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    else:  # POST
        try:
            data = request.get_json(silent=True)
            
            conn = get_db()
            
            # Проверить существует ли запись
            existing = conn.execute('''
                SELECT user_id FROM user_preferences WHERE user_id = ?
            ''', (user_id,)).fetchone()
            
            if existing:
                # Обновить
                conn.execute('''
                    UPDATE user_preferences
                    SET default_input_mode = ?, 
                        updated_at = datetime('now')
                    WHERE user_id = ?
                ''', (data['default_input_mode'], user_id))
            else:
                # Создать
                conn.execute('''
                    INSERT INTO user_preferences (user_id, default_input_mode)
                    VALUES (?, ?)
                ''', (user_id, data['default_input_mode']))
            
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
```

---

## 🔧 Backend: recommendations.py

**Создай файл:** `backend/recommendations.py`

### **Умные рекомендации техник:**

**Логика:**
1. Если pain_level > 5 → техника не нужна
2. Проверить историю technique_usage
3. Если есть успешная техника (helped=true) → предложить её
4. Если нет истории → стандартная (дыхательная)

```python
from flask import request, jsonify
from models import get_db

# Используем функции-импорты (не Blueprint)
# Функции импортируются в app.py напрямую

@recommendations_bp.route('/api/recommendations', methods=['GET'])
def get_recommendation():
    """
    Получить рекомендованную технику на основе истории
    
    Query params:
        pain_level: int (1-10) - текущая оценка состояния
    
    Returns:
        JSON: {
            "technique": {
                "id": 1,
                "name": "Дыхание 4-7-8",
                "category": "breathing",
                "reason": "personal_history",  // или "default"
                "message": "Тебе раньше помогало..."
            }
        }
        
        Или {"technique": null} если не нужна
    """
    try:
        user_id = 1
        pain_level = request.args.get('pain_level', type=int)
        
        if not pain_level:
            return jsonify({'error': 'pain_level required'}), 400
        
        # Если хорошо себя чувствует, техника не нужна
        if pain_level > 5:
            return jsonify({'technique': None})
        
        conn = get_db()
        
        # Найти успешные техники из истории
        successful = conn.execute('''
            SELECT 
                t.id,
                t.name,
                t.category,
                COUNT(*) as usage_count,
                SUM(CASE WHEN tu.helped THEN 1 ELSE 0 END) as success_count,
                AVG(tu.pain_change) as avg_improvement
            FROM technique_usage tu
            JOIN techniques t ON tu.technique_id = t.id
            WHERE tu.user_id = ? 
            AND tu.helped = 1
            GROUP BY t.id
            HAVING success_count > 0
            ORDER BY success_count DESC, avg_improvement DESC
            LIMIT 1
        ''', (user_id,)).fetchone()
        
        if successful:
            # Нашли технику которая помогала
            conn.close()
            return jsonify({
                'technique': {
                    'id': successful['id'],
                    'name': successful['name'],
                    'category': successful['category'],
                    'reason': 'personal_history',
                    'message': f'Тебе раньше помогало "{successful["name"]}". Попробуем?'
                }
            })
        
        # Нет истории → стандартная техника (дыхательная)
        default = conn.execute('''
            SELECT id, name, category
            FROM techniques
            WHERE category = 'breathing' 
            AND order_in_category = 1
            LIMIT 1
        ''').fetchone()
        
        conn.close()
        
        if default:
            return jsonify({
                'technique': {
                    'id': default['id'],
                    'name': default['name'],
                    'category': default['category'],
                    'reason': 'default',
                    'message': 'Начнём с дыхательной техники для быстрого успокоения'
                }
            })
        
        return jsonify({'technique': None})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

## 🔧 Обновить: models.py

**Добавь в функцию `init_db()`:**

```python
def init_db():
    conn = sqlite3.connect('database.db')
    
    # ... существующие таблицы из Модулей 1-2 ...
    
    # НОВЫЕ ТАБЛИЦЫ для Модуля 3
    
    # Коды доступа для психологов
    conn.execute('''
        CREATE TABLE IF NOT EXISTS access_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            user_id INTEGER DEFAULT 1,
            psychologist_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_access_codes_code 
        ON access_codes(code)
    ''')
    
    # Настройки пользователя
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id INTEGER PRIMARY KEY DEFAULT 1,
            default_input_mode TEXT DEFAULT 'voice',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
```

---

## 🔧 Обновить: app.py

**Зарегистрируй новые blueprints:**

```python
from flask import Flask
from flask_cors import CORS

# Импорты blueprints
from profile import profile_bp
from recommendations import recommendations_bp
# ... остальные blueprints из Модулей 1-2 ...

app = Flask(__name__)
CORS(app)

# Регистрация blueprints
app.register_blueprint(profile_bp)
app.register_blueprint(recommendations_bp)
# ... остальные blueprints ...

# ... остальной код ...

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5002, debug=True)
```

---

## ✅ Критерии готовности (Backend)

- [ ] venv активирован перед работой
- [ ] Таблицы созданы (access_codes, user_preferences)
- [ ] profile.py создан
- [ ] recommendations.py создан
- [ ] models.py обновлён
- [ ] app.py обновлён (blueprints зарегистрированы)
- [ ] Backend запускается без ошибок
- [ ] API endpoints отвечают:
  - [ ] GET /api/profile/access-code
  - [ ] POST /api/profile/access-code/regenerate
  - [ ] GET /api/profile/stats
  - [ ] GET /api/profile/preferences
  - [ ] POST /api/profile/preferences
  - [ ] GET /api/recommendations

---

## 🧪 Тестирование

**Тест 1: Генерация кода:**
```bash
curl http://localhost:5002/api/profile/access-code
# Ожидается: {"code": "БУРЯ-347", "is_connected": false, ...}
```

**Тест 2: Регенерация:**
```bash
curl -X POST http://localhost:5002/api/profile/access-code/regenerate
# Ожидается: Новый код
```

**Тест 3: Статистика:**
```bash
curl http://localhost:5002/api/profile/stats
# Ожидается: {"days_practiced": 0, "trend": "stable", ...}
```

**Тест 4: Рекомендации:**
```bash
curl "http://localhost:5002/api/recommendations?pain_level=3"
# Ожидается: Рекомендация техники
```

**Тест 5: Настройки:**
```bash
# Получить
curl http://localhost:5002/api/profile/preferences

# Обновить
curl -X POST http://localhost:5002/api/profile/preferences \
  -H "Content-Type: application/json" \
  -d '{"default_input_mode": "text"}'
```

---

## 📝 Заметки

- venv обязателен!
- Все новые таблицы создаются автоматически при запуске
- Код-позывной уникален (рекурсивная генерация)
- Статистика показывает ТОЛЬКО позитив
- Рекомендации персонализированы (из истории)

---

**Backend готов к реализации!** ✅

**Следующий шаг:** Часть 2 — Frontend (HTML + JS)
