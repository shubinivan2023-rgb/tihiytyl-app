from models import get_db

VALID_CATEGORIES = {'breathing', 'grounding', 'relaxation'}


def get_all_techniques():
    conn = get_db()
    rows = conn.execute('''
        SELECT * FROM techniques
        ORDER BY category, order_in_category
    ''').fetchall()
    conn.close()

    return [{
        'id': row['id'],
        'name': row['name'],
        'category': row['category'],
        'duration': row['duration'],
        'description': row['description'],
        'instructions': row['instructions'],
        'audio_path': row['audio_path'],
        'order_in_category': row['order_in_category']
    } for row in rows]


def get_technique_by_id(technique_id):
    conn = get_db()
    row = conn.execute(
        'SELECT * FROM techniques WHERE id = ?', (technique_id,)
    ).fetchone()
    conn.close()

    if not row:
        return None

    return {
        'id': row['id'],
        'name': row['name'],
        'category': row['category'],
        'duration': row['duration'],
        'description': row['description'],
        'instructions': row['instructions'],
        'audio_path': row['audio_path'],
        'order_in_category': row['order_in_category']
    }


def get_technique_by_category(category, order=1):
    if category not in VALID_CATEGORIES:
        raise ValueError(f'Неверная категория: {category}')

    conn = get_db()
    row = conn.execute(
        'SELECT * FROM techniques WHERE category = ? AND order_in_category = ?',
        (category, order)
    ).fetchone()
    conn.close()

    if not row:
        return None

    return {
        'id': row['id'],
        'name': row['name'],
        'category': row['category'],
        'duration': row['duration'],
        'description': row['description'],
        'instructions': row['instructions'],
        'audio_path': row['audio_path'],
        'order_in_category': row['order_in_category']
    }


def save_technique_usage(technique_id, pain_before, pain_after, diary_entry_id=None):
    pain_change = pain_after - pain_before
    helped = pain_change >= 1

    conn = get_db()
    cursor = conn.execute('''
        INSERT INTO technique_usage
        (technique_id, diary_entry_id, pain_before, pain_after, pain_change, helped)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (technique_id, diary_entry_id, pain_before, pain_after, pain_change, helped))
    usage_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        'id': usage_id,
        'pain_change': pain_change,
        'helped': helped
    }
