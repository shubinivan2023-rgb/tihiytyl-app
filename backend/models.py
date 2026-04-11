import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    # Модуль 1: Дневник
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

    # Модуль 2: Техники самопомощи
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

    # Модуль 2: Использование техник
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
            INSERT INTO techniques (name, category, duration, description, instructions, audio_path, order_in_category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', [
            ('Дыхание 4-7-8', 'breathing', 5,
             'Простая дыхательная техника для быстрого успокоения',
             'Вдохни через нос на 4 счёта. Задержи дыхание на 7 счётов. Медленно выдохни через рот на 8 счётов. Повтори 4 цикла.',
             '/audio/techniques/breathing_478.mp3', 1),
            ('Квадратное дыхание', 'breathing', 5,
             'Дыхание на 4 счёта для снижения тревоги',
             'Вдохни на 4 счёта. Задержи на 4 счёта. Выдохни на 4 счёта. Задержи на 4 счёта. Повтори.',
             '/audio/techniques/square_breathing.mp3', 2),
            ('Заземление 5-4-3-2-1', 'grounding', 7,
             'Техника возвращения в настоящий момент через органы чувств',
             'Назови 5 вещей, которые видишь. 4 вещи, которые можешь потрогать. 3 звука, которые слышишь. 2 запаха. 1 вкус.',
             '/audio/techniques/grounding_54321.mp3', 1),
            ('Безопасное место', 'grounding', 7,
             'Визуализация безопасного пространства',
             'Закрой глаза. Представь место, где тебе спокойно и безопасно. Рассмотри детали. Почувствуй тепло и защищённость.',
             '/audio/techniques/safe_place.mp3', 2),
            ('Прогрессивная релаксация', 'relaxation', 15,
             'Последовательное расслабление мышц тела',
             'Напряги мышцы стоп на 5 секунд, затем расслабь. Перейди к голеням, бёдрам, животу, рукам, плечам, лицу.',
             '/audio/techniques/progressive_relaxation.mp3', 1),
            ('Сканирование тела', 'relaxation', 12,
             'Осознанное внимание к ощущениям в теле',
             'Закрой глаза. Направь внимание на макушку. Медленно перемещай внимание вниз по телу, замечая ощущения.',
             '/audio/techniques/body_scan.mp3', 2),
        ])

    # Модуль 3: Коды доступа для психологов
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

    # Модуль 3: Настройки пользователя
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id INTEGER PRIMARY KEY DEFAULT 1,
            default_input_mode TEXT DEFAULT 'voice',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Модуль 4: Логи доступа психологов
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

    # Модуль 4: Добавить колонку last_accessed_at в access_codes
    try:
        conn.execute('''
            ALTER TABLE access_codes
            ADD COLUMN last_accessed_at TIMESTAMP
        ''')
    except Exception:
        pass  # Колонка уже существует

    # Модуль 5: Домашние задания
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

    # Модуль 5: История выполнения домашек
    conn.execute('''
        CREATE TABLE IF NOT EXISTS homework_completion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            homework_id INTEGER NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (homework_id) REFERENCES homework(id)
        )
    ''')

    # КБТ-сессии (когда клиент отказался от техники и выбрал «поговорить»)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS cbt_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            diary_entry_id INTEGER,
            pain_before INTEGER NOT NULL,
            pain_after INTEGER,
            pain_change INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (diary_entry_id) REFERENCES diary_entries(id)
        )
    ''')

    conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_cbt_sessions_user
        ON cbt_sessions(user_id)
    ''')

    # Ответы на 5 КБТ-вопросов
    conn.execute('''
        CREATE TABLE IF NOT EXISTS cbt_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            question_number INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            answer TEXT,
            skipped BOOLEAN DEFAULT 0,
            FOREIGN KEY (session_id) REFERENCES cbt_sessions(id)
        )
    ''')

    conn.commit()
    conn.close()
