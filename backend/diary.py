from models import get_db

VALID_PAIN_LEVELS = {1, 3, 5, 7, 10}
VALID_INPUT_TYPES = {'voice', 'text'}


def save_entry(transcription, input_type, pain_level, emoji):
    if not transcription or not transcription.strip():
        raise ValueError('Текст записи не может быть пустым')
    if input_type not in VALID_INPUT_TYPES:
        raise ValueError(f'Неверный тип записи: {input_type}')
    if pain_level not in VALID_PAIN_LEVELS:
        raise ValueError(f'Неверный уровень: {pain_level}')

    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO diary_entries (transcription, input_type, pain_level, emoji) VALUES (?, ?, ?, ?)',
        (transcription.strip(), input_type, pain_level, emoji)
    )
    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return entry_id


def get_entries(limit=50):
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM diary_entries ORDER BY created_at DESC LIMIT ?',
        (limit,)
    ).fetchall()
    conn.close()

    return [{
        'id': row['id'],
        'transcription': row['transcription'],
        'input_type': row['input_type'],
        'pain_level': row['pain_level'],
        'emoji': row['emoji'],
        'created_at': row['created_at']
    } for row in rows]
