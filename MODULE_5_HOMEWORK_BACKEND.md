# 📋 ТЗ Модуль 5 (Часть 1): Домашние задания — Backend

## 🎯 Цель

Создать систему домашних заданий: психолог назначает задания клиенту, клиент отмечает выполнение.

---

## 📍 Контекст

**Репозиторий:** `tihiytyl-app`  
**Модуль:** Домашние задания (backend)  
**Предыдущие модули:** Модули 1-4 ✅

**ВАЖНО:** 
- Используй venv!
- Порт: **5002**
- **Минимальная версия (MVP)**

---

## 📁 Структура файлов

```
backend/
  venv/              ← УЖЕ ЕСТЬ
  app.py             ← ОБНОВИТЬ (добавить роуты)
  models.py          ← ОБНОВИТЬ (добавить таблицы)
  homework.py        ← СОЗДАТЬ (логика домашек)
  requirements.txt   ← БЕЗ ИЗМЕНЕНИЙ
  database.db        ← Обновится автоматически
```

---

## 🗄️ База данных

### **Таблица 1: homework**

**Назначение:** Домашние задания от психолога клиенту

```sql
CREATE TABLE IF NOT EXISTS homework (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,                 -- ID клиента
    psychologist_id INTEGER,                  -- ID психолога (пока NULL для MVP)
    title TEXT NOT NULL,                      -- "Практикуй дыхательную технику"
    description TEXT,                         -- Детали задания
    technique_id INTEGER,                     -- Связь с техникой (опционально)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',            -- 'pending', 'completed', 'skipped'
    FOREIGN KEY (technique_id) REFERENCES techniques(id)
);

CREATE INDEX IF NOT EXISTS idx_homework_user 
ON homework(user_id);
```

**Примеры записей:**
```sql
INSERT INTO homework (user_id, title, description, technique_id, status) VALUES
(1, 'Практикуй дыхательную технику', 'Делай дыхание 4-7-8 каждое утро', 1, 'pending'),
(1, 'Записывай в дневник ежедневно', 'Минимум одна запись в день', NULL, 'completed');
```

---

### **Таблица 2: homework_completion**

**Назначение:** История выполнения домашек

```sql
CREATE TABLE IF NOT EXISTS homework_completion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    homework_id INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,                               -- Опциональные заметки клиента
    FOREIGN KEY (homework_id) REFERENCES homework(id)
);
```

**Примеры записей:**
```sql
INSERT INTO homework_completion (homework_id, notes) VALUES
(2, 'Записывал 5 дней подряд');
```

---

## 🔧 Backend: homework.py

**Создай файл:** `backend/homework.py`

### **Архитектура:**

Используем функции-импорты (как остальные модули), **не Blueprint**.

```python
from models import get_db
```

---

### **API Endpoint 1: POST /api/homework/create**

**Назначение:** Психолог создаёт домашку для клиента

```python
@app.route('/api/homework/create', methods=['POST'])
def create_homework():
    """
    Создать домашнее задание для клиента
    
    Body:
        JSON: {
            "user_id": 1,
            "title": "Практикуй дыхательную технику",
            "description": "Делай дыхание 4-7-8 каждое утро",
            "technique_id": 1  // опционально
        }
    
    Returns:
        JSON: {
            "id": 1,
            "success": true
        }
    """
    try:
        data = request.get_json(silent=True)
        
        if not data.get('user_id') or not data.get('title'):
            return jsonify({'error': 'user_id и title обязательны'}), 400
        
        conn = get_db()
        
        cursor = conn.execute('''
            INSERT INTO homework (user_id, title, description, technique_id)
            VALUES (?, ?, ?, ?)
        ''', (
            data['user_id'],
            data['title'],
            data.get('description'),
            data.get('technique_id')
        ))
        
        homework_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': homework_id,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
```

---

### **API Endpoint 2: GET /api/homework/list/<user_id>**

**Назначение:** Получить все домашки клиента

```python
@app.route('/api/homework/list/<int:user_id>', methods=['GET'])
def get_homework_list(user_id):
    """
    Получить список домашних заданий клиента
    
    Query params:
        status: 'pending' | 'completed' | 'all' (default: 'all')
    
    Returns:
        JSON: {
            "homework": [...]
        }
    """
    try:
        status_filter = request.args.get('status', 'all')
        
        conn = get_db()
        
        # Построить запрос с фильтром
        if status_filter == 'all':
            query = '''
                SELECT 
                    h.*,
                    t.name as technique_name
                FROM homework h
                LEFT JOIN techniques t ON h.technique_id = t.id
                WHERE h.user_id = ?
                ORDER BY h.created_at DESC
            '''
            params = (user_id,)
        else:
            query = '''
                SELECT 
                    h.*,
                    t.name as technique_name
                FROM homework h
                LEFT JOIN techniques t ON h.technique_id = t.id
                WHERE h.user_id = ? AND h.status = ?
                ORDER BY h.created_at DESC
            '''
            params = (user_id, status_filter)
        
        rows = conn.execute(query, params).fetchall()
        conn.close()
        
        homework = [
            {
                'id': row['id'],
                'title': row['title'],
                'description': row['description'],
                'technique_id': row['technique_id'],
                'technique_name': row['technique_name'],
                'status': row['status'],
                'created_at': row['created_at']
            } for row in rows
        ]
        
        return jsonify({'homework': homework})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### **API Endpoint 3: POST /api/homework/complete/<homework_id>**

**Назначение:** Клиент отмечает домашку выполненной

```python
@app.route('/api/homework/complete/<int:homework_id>', methods=['POST'])
def complete_homework(homework_id):
    """
    Отметить домашку как выполненную
    
    Body (опционально):
        JSON: {
            "notes": "Делал 5 дней подряд"
        }
    
    Returns:
        JSON: {
            "success": true
        }
    """
    try:
        data = request.get_json(silent=True) or {}
        notes = data.get('notes')
        
        conn = get_db()
        
        # Проверить существует ли домашка
        homework = conn.execute(
            'SELECT id FROM homework WHERE id = ?', 
            (homework_id,)
        ).fetchone()
        
        if not homework:
            conn.close()
            return jsonify({'error': 'Домашка не найдена'}), 404
        
        # Обновить статус
        conn.execute('''
            UPDATE homework
            SET status = 'completed'
            WHERE id = ?
        ''', (homework_id,))
        
        # Записать в историю
        conn.execute('''
            INSERT INTO homework_completion (homework_id, notes)
            VALUES (?, ?)
        ''', (homework_id, notes))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
```

---

### **API Endpoint 4: POST /api/homework/skip/<homework_id>**

**Назначение:** Клиент отмечает домашку пропущенной

```python
@app.route('/api/homework/skip/<int:homework_id>', methods=['POST'])
def skip_homework(homework_id):
    """
    Отметить домашку как пропущенную
    
    Returns:
        JSON: {
            "success": true
        }
    """
    try:
        conn = get_db()
        
        # Проверить существует ли домашка
        homework = conn.execute(
            'SELECT id FROM homework WHERE id = ?', 
            (homework_id,)
        ).fetchone()
        
        if not homework:
            conn.close()
            return jsonify({'error': 'Домашка не найдена'}), 404
        
        # Обновить статус
        conn.execute('''
            UPDATE homework
            SET status = 'skipped'
            WHERE id = ?
        ''', (homework_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
```

---

### **API Endpoint 5: DELETE /api/homework/delete/<homework_id>**

**Назначение:** Психолог удаляет домашку

```python
@app.route('/api/homework/delete/<int:homework_id>', methods=['DELETE'])
def delete_homework(homework_id):
    """
    Удалить домашнее задание
    
    Returns:
        JSON: {
            "success": true
        }
    """
    try:
        conn = get_db()
        
        # Удалить записи о выполнении
        conn.execute(
            'DELETE FROM homework_completion WHERE homework_id = ?',
            (homework_id,)
        )
        
        # Удалить домашку
        conn.execute(
            'DELETE FROM homework WHERE id = ?',
            (homework_id,)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
```

---

### **API Endpoint 6: GET /api/homework/stats/<user_id>**

**Назначение:** Статистика по домашкам для дашборда психолога

```python
@app.route('/api/homework/stats/<int:user_id>', methods=['GET'])
def get_homework_stats(user_id):
    """
    Получить статистику по домашкам клиента
    
    Returns:
        JSON: {
            "total": 10,
            "completed": 7,
            "pending": 2,
            "skipped": 1,
            "completion_rate": 70.0
        }
    """
    try:
        conn = get_db()
        
        # Всего домашек
        total = conn.execute(
            'SELECT COUNT(*) as count FROM homework WHERE user_id = ?',
            (user_id,)
        ).fetchone()
        
        # По статусам
        completed = conn.execute(
            "SELECT COUNT(*) as count FROM homework WHERE user_id = ? AND status = 'completed'",
            (user_id,)
        ).fetchone()
        
        pending = conn.execute(
            "SELECT COUNT(*) as count FROM homework WHERE user_id = ? AND status = 'pending'",
            (user_id,)
        ).fetchone()
        
        skipped = conn.execute(
            "SELECT COUNT(*) as count FROM homework WHERE user_id = ? AND status = 'skipped'",
            (user_id,)
        ).fetchone()
        
        conn.close()
        
        total_count = total['count']
        completed_count = completed['count']
        
        # Процент выполнения
        completion_rate = (completed_count / total_count * 100) if total_count > 0 else 0
        
        return jsonify({
            'total': total_count,
            'completed': completed_count,
            'pending': pending['count'],
            'skipped': skipped['count'],
            'completion_rate': round(completion_rate, 1)
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
    
    # НОВЫЕ ТАБЛИЦЫ для Модуля 5
    
    # Домашние задания
    conn.execute('''
        CREATE TABLE IF NOT EXISTS homework (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            psychologist_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            technique_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (technique_id) REFERENCES techniques(id)
        )
    ''')
    
    conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_homework_user 
        ON homework(user_id)
    ''')
    
    # История выполнения
    conn.execute('''
        CREATE TABLE IF NOT EXISTS homework_completion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            homework_id INTEGER NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (homework_id) REFERENCES homework(id)
        )
    ''')
    
    conn.commit()
    conn.close()
```

---

## 🔧 Обновить: app.py

**Добавить импорт (функции-импорты, не Blueprint):**

```python
from homework import (
    create_homework, get_homework_list,
    complete_homework, skip_homework,
    delete_homework, get_homework_stats
)

# Добавить роуты в секцию Модуль 5
# Порт уже 5002 — менять не нужно
```

---

## ✅ Критерии готовности (Backend)

- [ ] venv активирован
- [ ] Таблицы созданы (homework, homework_completion)
- [ ] homework.py создан
- [ ] models.py обновлён
- [ ] app.py обновлён (импорт + роуты, без Blueprint)
- [ ] Backend запускается на порту 5002
- [ ] API endpoints отвечают:
  - [ ] POST /api/homework/create
  - [ ] GET /api/homework/list/<user_id>
  - [ ] POST /api/homework/complete/<homework_id>
  - [ ] POST /api/homework/skip/<homework_id>
  - [ ] DELETE /api/homework/delete/<homework_id>
  - [ ] GET /api/homework/stats/<user_id>

---

## 🧪 Тестирование

**Тест 1: Создание домашки:**
```bash
curl -X POST http://localhost:5002/api/homework/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "Практикуй дыхательную технику",
    "description": "Делай дыхание 4-7-8 каждое утро",
    "technique_id": 1
  }'

# Ожидается: {"id": 1, "success": true}
```

**Тест 2: Список домашек:**
```bash
curl http://localhost:5002/api/homework/list/1

# Ожидается: {"homework": [...]}
```

**Тест 3: Выполнение:**
```bash
curl -X POST http://localhost:5002/api/homework/complete/1 \
  -H "Content-Type: application/json" \
  -d '{"notes": "Делал 5 дней"}'

# Ожидается: {"success": true}
```

**Тест 4: Статистика:**
```bash
curl http://localhost:5002/api/homework/stats/1

# Ожидается: {"total": 2, "completed": 1, ...}
```

---

## 📝 Заметки

- Порт 5002
- venv обязателен
- Минимальная версия (без дедлайнов, файлов)
- Статусы: pending, completed, skipped
- Связь с техниками опциональна

---

**Backend готов к реализации!** ✅

**Следующий шаг:** Часть 2 — Frontend (UI для клиента и психолога)
