import random
from datetime import datetime, timedelta

from models import get_db

# Список слов для позывных (военная/природная тематика)
CALLSIGN_WORDS = [
    'БУРЯ', 'ТИХИЙ', 'ВОЛНА', 'ГРОМ', 'ВЕТЕР', 'ОГОНЬ',
    'СОКОЛ', 'ОРЁЛ', 'БАРС', 'ВОЛК', 'МЕДВЕДЬ', 'ЛЕВ',
    'СЕВЕР', 'ЮГ', 'ВОСТОК', 'ЗАПАД', 'РАССВЕТ', 'ЗАКАТ',
    'МОЛНИЯ', 'ТУМАН', 'СНЕГ', 'ДОЖДЬ', 'ГРОЗА', 'РАДУГА'
]


def generate_access_code():
    """Генерирует уникальный код-позывной формата СЛОВО-ЦЦЦ"""
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
        return generate_access_code()

    return code


def get_active_code(user_id=1):
    """Получить активный код или создать новый"""
    conn = get_db()

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
        return {
            'code': active_code['code'],
            'is_connected': active_code['psychologist_id'] is not None,
            'created_at': active_code['created_at'],
            'expires_at': active_code['expires_at']
        }

    # Создать новый код
    new_code = generate_access_code()
    expires_at = datetime.now() + timedelta(days=7)

    conn.execute('''
        INSERT INTO access_codes (code, user_id, expires_at)
        VALUES (?, ?, ?)
    ''', (new_code, user_id, expires_at))
    conn.commit()
    conn.close()

    return {
        'code': new_code,
        'is_connected': False,
        'created_at': datetime.now().isoformat(),
        'expires_at': expires_at.isoformat()
    }


def regenerate_code(user_id=1):
    """Создать новый код (деактивировать старый)"""
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

    return {
        'code': new_code,
        'is_connected': False,
        'created_at': datetime.now().isoformat(),
        'expires_at': expires_at.isoformat()
    }


def get_stats(user_id=1):
    """Позитивная статистика для клиента"""
    conn = get_db()

    # 1. Практики за последние 7 дней
    practices = conn.execute('''
        SELECT COUNT(DISTINCT DATE(created_at)) as days_practiced
        FROM diary_entries
        WHERE user_id = ?
        AND created_at >= datetime('now', '-7 days')
    ''', (user_id,)).fetchone()

    # 2. Тренд (последние 3 дня vs 7-10 дней назад)
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

    # 3. Техники которые помогают (только helped=true)
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
    # Шкала боли: 1 = нет боли, 10 = невыносимая
    # Меньше pain_level = лучше
    trend = 'stable'
    if avg_recent['avg_pain'] and avg_older['avg_pain']:
        if avg_recent['avg_pain'] < avg_older['avg_pain'] - 1:
            trend = 'improving'
        # Если хуже → всё равно 'stable' (не пугаем)

    return {
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
    }


def get_preferences(user_id=1):
    """Получить настройки пользователя"""
    conn = get_db()
    prefs = conn.execute('''
        SELECT default_input_mode
        FROM user_preferences
        WHERE user_id = ?
    ''', (user_id,)).fetchone()
    conn.close()

    if prefs:
        return {'default_input_mode': prefs['default_input_mode']}
    return {'default_input_mode': 'voice'}


def update_preferences(default_input_mode, user_id=1):
    """Обновить настройки пользователя"""
    conn = get_db()

    existing = conn.execute('''
        SELECT user_id FROM user_preferences WHERE user_id = ?
    ''', (user_id,)).fetchone()

    if existing:
        conn.execute('''
            UPDATE user_preferences
            SET default_input_mode = ?,
                updated_at = datetime('now')
            WHERE user_id = ?
        ''', (default_input_mode, user_id))
    else:
        conn.execute('''
            INSERT INTO user_preferences (user_id, default_input_mode)
            VALUES (?, ?)
        ''', (user_id, default_input_mode))

    conn.commit()
    conn.close()
    return {'success': True}
