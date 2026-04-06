# Модуль 4: Дашборд психолога — бизнес-логика

from datetime import datetime
from models import get_db


def verify_code(code):
    """Проверить код-позывной и залогировать доступ"""
    if not code:
        return {'valid': False, 'error': 'Код не указан'}

    code = code.strip().upper()
    conn = get_db()

    # Проверить код
    access_code = conn.execute('''
        SELECT id, user_id, expires_at, is_active
        FROM access_codes
        WHERE code = ?
    ''', (code,)).fetchone()

    if not access_code:
        conn.close()
        return {'valid': False, 'error': 'Код не найден'}

    if not access_code['is_active']:
        conn.close()
        return {'valid': False, 'error': 'Код деактивирован'}

    # Проверить срок действия
    if access_code['expires_at']:
        expires_at = datetime.fromisoformat(access_code['expires_at'])
        if datetime.now() > expires_at:
            conn.close()
            return {'valid': False, 'error': 'Срок действия кода истёк'}

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

    # Дата первой записи клиента
    first_entry = conn.execute('''
        SELECT MIN(created_at) as first_date
        FROM diary_entries
        WHERE user_id = ?
    ''', (user_id,)).fetchone()

    conn.commit()
    conn.close()

    return {
        'valid': True,
        'user_id': user_id,
        'access_code_id': access_code_id,
        'client_since': first_entry['first_date'] if first_entry else None
    }


def get_client_stats(user_id):
    """Детальная статистика клиента для психолога"""
    conn = get_db()

    # Общая информация
    total_entries = conn.execute('''
        SELECT COUNT(*) as count
        FROM diary_entries
        WHERE user_id = ?
    ''', (user_id,)).fetchone()

    date_range = conn.execute('''
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

    # Динамика по дням (для графика)
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

    # Использование техник
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

    return {
        'overview': {
            'total_entries': total_entries['count'],
            'first_entry_date': date_range['first_date'],
            'last_entry_date': date_range['last_date'],
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
                'success_rate': round((t['success_count'] / t['usage_count']) * 100, 1) if t['usage_count'] else 0,
                'avg_pain_before': round(t['avg_pain_before'], 1) if t['avg_pain_before'] else None,
                'avg_pain_after': round(t['avg_pain_after'], 1) if t['avg_pain_after'] else None,
                'avg_improvement': round(t['avg_pain_change'], 1) if t['avg_pain_change'] else None
            } for t in techniques
        ]
    }


def get_client_entries(user_id, limit=50, offset=0):
    """Все записи дневника клиента"""
    conn = get_db()

    total = conn.execute('''
        SELECT COUNT(*) as count
        FROM diary_entries
        WHERE user_id = ?
    ''', (user_id,)).fetchone()

    entries = conn.execute('''
        SELECT
            id, transcription, input_type,
            pain_level, emoji, created_at
        FROM diary_entries
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ''', (user_id, limit, offset)).fetchall()

    conn.close()

    return {
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
    }


def get_access_info(access_code_id):
    """Информация об использовании кода доступа"""
    conn = get_db()

    code_info = conn.execute('''
        SELECT code, created_at, last_accessed_at
        FROM access_codes
        WHERE id = ?
    ''', (access_code_id,)).fetchone()

    if not code_info:
        conn.close()
        return None

    access_count = conn.execute('''
        SELECT COUNT(*) as count
        FROM access_logs
        WHERE access_code_id = ?
    ''', (access_code_id,)).fetchone()

    conn.close()

    return {
        'code': code_info['code'],
        'access_count': access_count['count'],
        'last_accessed_at': code_info['last_accessed_at'],
        'created_at': code_info['created_at']
    }
