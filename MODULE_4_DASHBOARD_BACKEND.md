# 📋 ТЗ Модуль 4 (Часть 1): Дашборд психолога — Backend

## 🎯 Цель

Создать backend для дашборда психолога: вход по коду-позывному, получение детальной статистики клиента, логирование доступа.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** Дашборд психолога (backend)  
**Предыдущие модули:** 
- Модуль 1: Базовый дневник ✅
- Модуль 2: Библиотека техник ✅
- Модуль 3: Профиль клиента ✅

**ВАЖНО:** 
- Используй venv!
- Порт: **5002** (не 5003!)

---

## 📁 Структура файлов

```
backend/
  venv/              ← УЖЕ ЕСТЬ
  app.py             ← ОБНОВИТЬ (добавить роуты психолога)
  models.py          ← ОБНОВИТЬ (добавить таблицу access_logs)
  psychologist.py    ← СОЗДАТЬ (бизнес-логика дашборда)
  requirements.txt   ← БЕЗ ИЗМЕНЕНИЙ
  database.db        ← Обновится автоматически
```

---

## 🗄️ База данных

### **Таблица: access_logs**

**Назначение:** Логирование доступа психологов к данным клиента

```sql
CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_code_id INTEGER NOT NULL,
    user_id INTEGER,                      -- ID клиента
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_code_id) REFERENCES access_codes(id)
);

-- Индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_access_logs_code 
ON access_logs(access_code_id);
```

**Примеры записей:**
```sql
INSERT INTO access_logs (access_code_id, user_id) VALUES
(1, 1),  -- Психолог зашёл по коду клиента 1
(1, 1);  -- Зашёл ещё раз
```

---

### **Обновление: access_codes**

**Добавь поле для отслеживания последнего доступа:**

```sql
-- Добавить колонку если её нет
ALTER TABLE access_codes 
ADD COLUMN last_accessed_at TIMESTAMP;
```

---

## 🔧 Backend: psychologist.py

**Создай файл:** `backend/psychologist.py`

### **Архитектура:**

Используем функции-импорты (как diary.py, techniques.py, profile.py), **не Blueprint**.

```python
from datetime import datetime
from models import get_db
```

---

### **API Endpoint 1: POST /api/psychologist/verify-code**

**Назначение:** Проверить код-позывной и получить доступ к данным клиента

**Логика:**
1. Проверить код существует и активен
2. Проверить не истёк срок действия
3. Записать в access_logs
4. Обновить last_accessed_at
5. Вернуть user_id клиента

```python
@app.route('/api/psychologist/verify-code', methods=['POST'])
def verify_code():
    """
    Проверить код-позывной клиента
    
    Body:
        JSON: {"code": "БУРЯ-347"}
    
    Returns:
        JSON: {
            "valid": true,
            "user_id": 1,
            "access_code_id": 1,
            "client_since": "2026-04-01"
        }
        
        Или {"valid": false, "error": "..."}
    """
    try:
        data = request.get_json(silent=True)
        code = data.get('code', '').strip().upper()
        
        if not code:
            return jsonify({'valid': False, 'error': 'Код не указан'}), 400
        
        conn = get_db()
        
        # Проверить код
        access_code = conn.execute('''
            SELECT id, user_id, expires_at, is_active
            FROM access_codes
            WHERE code = ?
        ''', (code,)).fetchone()
        
        if not access_code:
            conn.close()
            return jsonify({'valid': False, 'error': 'Код не найден'})
        
        # Проверить активность
        if not access_code['is_active']:
            conn.close()
            return jsonify({'valid': False, 'error': 'Код деактивирован'})
        
        # Проверить срок действия
        if access_code['expires_at']:
            expires_at = datetime.fromisoformat(access_code['expires_at'])
            if datetime.now() > expires_at:
                conn.close()
                return jsonify({'valid': False, 'error': 'Срок действия кода истёк'})
        
        user_id = access_code['user_id']
        access_code_id = access_code['id']
        
        # Записать в логи
        conn.execute('''
            INSERT INTO access_logs (access_code_id, user_id)
            VALUES (?, ?)
        ''', (access_code_id, user_id))
        
        # Обновить последний доступ
        conn.execute('''
            UPDATE access_codes
            SET last_accessed_at = datetime('now')
            WHERE id = ?
        ''', (access_code_id,))
        
        # Получить дату первой записи клиента
        first_entry = conn.execute('''
            SELECT MIN(created_at) as first_date
            FROM diary_entries
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'valid': True,
            'user_id': user_id,
            'access_code_id': access_code_id,
            'client_since': first_entry['first_date'] if first_entry else None
        })
        
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500
```

---

### **API Endpoint 2: GET /api/psychologist/client-stats/<user_id>**

**Назначение:** Получить детальную статистику клиента

**Что возвращаем:**
- Общая информация (всего записей, период)
- Динамика состояния (данные для графика)
- Использование техник
- Эффективность техник

```python
@app.route('/api/psychologist/client-stats/<int:user_id>', methods=['GET'])
def get_client_stats(user_id):
    """
    Получить детальную статистику клиента
    
    Returns:
        JSON: {
            "overview": {...},
            "timeline": [...],
            "techniques": [...]
        }
    """
    try:
        conn = get_db()
        
        # 1. Общая информация
        total_entries = conn.execute('''
            SELECT COUNT(*) as count
            FROM diary_entries
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        first_entry = conn.execute('''
            SELECT MIN(created_at) as first_date,
                   MAX(created_at) as last_date
            FROM diary_entries
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        avg_pain = conn.execute('''
            SELECT AVG(pain_level) as avg_pain
            FROM diary_entries
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        # 2. Динамика по дням (для графика)
        timeline = conn.execute('''
            SELECT 
                DATE(created_at) as date,
                AVG(pain_level) as avg_pain,
                COUNT(*) as entries_count
            FROM diary_entries
            WHERE user_id = ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ''', (user_id,)).fetchall()
        
        # 3. Использование техник
        techniques = conn.execute('''
            SELECT 
                t.name,
                t.category,
                COUNT(*) as usage_count,
                SUM(CASE WHEN tu.helped THEN 1 ELSE 0 END) as success_count,
                AVG(tu.pain_before) as avg_pain_before,
                AVG(tu.pain_after) as avg_pain_after,
                AVG(tu.pain_change) as avg_pain_change
            FROM technique_usage tu
            JOIN techniques t ON tu.technique_id = t.id
            WHERE tu.user_id = ?
            GROUP BY t.id
            ORDER BY usage_count DESC
        ''', (user_id,)).fetchall()
        
        conn.close()
        
        return jsonify({
            'overview': {
                'total_entries': total_entries['count'],
                'first_entry_date': first_entry['first_date'],
                'last_entry_date': first_entry['last_date'],
                'avg_pain_level': round(avg_pain['avg_pain'], 1) if avg_pain['avg_pain'] else None
            },
            'timeline': [
                {
                    'date': row['date'],
                    'avg_pain': round(row['avg_pain'], 1),
                    'entries_count': row['entries_count']
                } for row in timeline
            ],
            'techniques': [
                {
                    'name': t['name'],
                    'category': t['category'],
                    'usage_count': t['usage_count'],
                    'success_count': t['success_count'],
                    'success_rate': round((t['success_count'] / t['usage_count']) * 100, 1),
                    'avg_pain_before': round(t['avg_pain_before'], 1) if t['avg_pain_before'] else None,
                    'avg_pain_after': round(t['avg_pain_after'], 1) if t['avg_pain_after'] else None,
                    'avg_improvement': round(t['avg_pain_change'], 1) if t['avg_pain_change'] else None
                } for t in techniques
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### **API Endpoint 3: GET /api/psychologist/client-entries/<user_id>**

**Назначение:** Получить все записи дневника клиента

```python
@app.route('/api/psychologist/client-entries/<int:user_id>', methods=['GET'])
def get_client_entries(user_id):
    """
    Получить все записи дневника клиента
    
    Query params:
        limit: int (опционально, по умолчанию 50)
        offset: int (опционально, для пагинации)
    
    Returns:
        JSON: {
            "entries": [...],
            "total": 100
        }
    """
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        conn = get_db()
        
        # Всего записей
        total = conn.execute('''
            SELECT COUNT(*) as count
            FROM diary_entries
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        # Записи
        entries = conn.execute('''
            SELECT 
                id,
                transcription,
                input_type,
                pain_level,
                emoji,
                created_at
            FROM diary_entries
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ''', (user_id, limit, offset)).fetchall()
        
        conn.close()
        
        return jsonify({
            'entries': [
                {
                    'id': e['id'],
                    'transcription': e['transcription'],
                    'input_type': e['input_type'],
                    'pain_level': e['pain_level'],
                    'emoji': e['emoji'],
                    'created_at': e['created_at']
                } for e in entries
            ],
            'total': total['count']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### **API Endpoint 4: GET /api/psychologist/access-info/<access_code_id>**

**Назначение:** Получить информацию об использовании кода

```python
@app.route('/api/psychologist/access-info/<int:access_code_id>', methods=['GET'])
def get_access_info(access_code_id):
    """
    Получить информацию об использовании кода доступа
    
    Returns:
        JSON: {
            "access_count": 5,
            "last_accessed_at": "...",
            "created_at": "..."
        }
    """
    try:
        conn = get_db()
        
        # Информация о коде
        code_info = conn.execute('''
            SELECT 
                code,
                created_at,
                last_accessed_at
            FROM access_codes
            WHERE id = ?
        ''', (access_code_id,)).fetchone()
        
        # Количество доступов
        access_count = conn.execute('''
            SELECT COUNT(*) as count
            FROM access_logs
            WHERE access_code_id = ?
        ''', (access_code_id,)).fetchone()
        
        conn.close()
        
        if not code_info:
            return jsonify({'error': 'Код не найден'}), 404
        
        return jsonify({
            'code': code_info['code'],
            'access_count': access_count['count'],
            'last_accessed_at': code_info['last_accessed_at'],
            'created_at': code_info['created_at']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

## 🔧 Обновить: models.py

**Добавь в функцию `init_db()`:**

```python
def init_db():
    conn = sqlite3.connect('database.db')
    
    # ... существующие таблицы ...
    
    # НОВАЯ ТАБЛИЦА для Модуля 4
    
    # Логи доступа психологов
    conn.execute('''
        CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            access_code_id INTEGER NOT NULL,
            user_id INTEGER,
            accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (access_code_id) REFERENCES access_codes(id)
        )
    ''')
    
    conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_access_logs_code 
        ON access_logs(access_code_id)
    ''')
    
    # Добавить колонку в access_codes если её нет
    try:
        conn.execute('''
            ALTER TABLE access_codes 
            ADD COLUMN last_accessed_at TIMESTAMP
        ''')
    except:
        # Колонка уже существует
        pass
    
    conn.commit()
    conn.close()
```

---

## 🔧 Обновить: app.py

**ВАЖНО: Изменить порт на 5002!**

```python
# Добавить импорт в app.py (функции-импорты, не Blueprint):
from psychologist import (
    verify_code, get_client_stats,
    get_client_entries, get_access_info
)

# Добавить роуты в секцию Модуль 4
# Порт уже 5002 — менять не нужно
```

---

## ✅ Критерии готовности (Backend)

- [ ] venv активирован
- [ ] Таблица access_logs создана
- [ ] Колонка last_accessed_at добавлена в access_codes
- [ ] psychologist.py создан
- [ ] models.py обновлён
- [ ] app.py обновлён (импорт + роуты, без Blueprint)
- [ ] Backend запускается на порту 5002
- [ ] API endpoints отвечают:
  - [ ] POST /api/psychologist/verify-code
  - [ ] GET /api/psychologist/client-stats/<user_id>
  - [ ] GET /api/psychologist/client-entries/<user_id>
  - [ ] GET /api/psychologist/access-info/<access_code_id>

---

## 🧪 Тестирование

**Тест 1: Проверка кода:**
```bash
curl -X POST http://localhost:5002/api/psychologist/verify-code \
  -H "Content-Type: application/json" \
  -d '{"code": "БУРЯ-347"}'

# Ожидается: {"valid": true, "user_id": 1, ...}
```

**Тест 2: Статистика клиента:**
```bash
curl http://localhost:5002/api/psychologist/client-stats/1

# Ожидается: {"overview": {...}, "timeline": [...], "techniques": [...]}
```

**Тест 3: Записи клиента:**
```bash
curl http://localhost:5002/api/psychologist/client-entries/1

# Ожидается: {"entries": [...], "total": 10}
```

**Тест 4: Информация о доступе:**
```bash
curl http://localhost:5002/api/psychologist/access-info/1

# Ожидается: {"code": "БУРЯ-347", "access_count": 3, ...}
```

---

## 📝 Заметки

- **Порт 5002** (не 5003!)
- venv обязателен
- Логируем каждый доступ психолога
- Проверяем срок действия кода
- Детальная статистика для психолога (не фильтруем негатив)

---

**Backend готов к реализации!** ✅

**Следующий шаг:** Часть 2 — Frontend (интерфейс дашборда)
