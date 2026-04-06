# Модуль 5: Домашние задания — бизнес-логика

from models import get_db


def create_homework(user_id, title, description=None, technique_id=None):
    """Создать домашнее задание для клиента"""
    conn = get_db()

    cursor = conn.execute('''
        INSERT INTO homework (user_id, title, description, technique_id)
        VALUES (?, ?, ?, ?)
    ''', (user_id, title, description, technique_id))

    homework_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {'id': homework_id, 'success': True}


def get_homework_list(user_id, status_filter='all'):
    """Получить список домашних заданий клиента"""
    conn = get_db()

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

    return {
        'homework': [
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
    }


def complete_homework(homework_id, notes=None):
    """Отметить домашку как выполненную"""
    conn = get_db()

    homework = conn.execute(
        'SELECT id FROM homework WHERE id = ?',
        (homework_id,)
    ).fetchone()

    if not homework:
        conn.close()
        return None

    # Обновить статус
    conn.execute('''
        UPDATE homework SET status = 'completed' WHERE id = ?
    ''', (homework_id,))

    # Записать в историю
    conn.execute('''
        INSERT INTO homework_completion (homework_id, notes)
        VALUES (?, ?)
    ''', (homework_id, notes))

    conn.commit()
    conn.close()

    return {'success': True}


def skip_homework(homework_id):
    """Отметить домашку как пропущенную"""
    conn = get_db()

    homework = conn.execute(
        'SELECT id FROM homework WHERE id = ?',
        (homework_id,)
    ).fetchone()

    if not homework:
        conn.close()
        return None

    conn.execute('''
        UPDATE homework SET status = 'skipped' WHERE id = ?
    ''', (homework_id,))

    conn.commit()
    conn.close()

    return {'success': True}


def delete_homework(homework_id):
    """Удалить домашнее задание"""
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

    return {'success': True}


def get_homework_stats(user_id):
    """Статистика по домашкам клиента"""
    conn = get_db()

    total = conn.execute(
        'SELECT COUNT(*) as count FROM homework WHERE user_id = ?',
        (user_id,)
    ).fetchone()

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
    completion_rate = (completed_count / total_count * 100) if total_count > 0 else 0

    return {
        'total': total_count,
        'completed': completed_count,
        'pending': pending['count'],
        'skipped': skipped['count'],
        'completion_rate': round(completion_rate, 1)
    }
