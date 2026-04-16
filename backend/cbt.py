from models import get_db

# 5 вопросов КБТ
CBT_QUESTIONS = [
    'Опиши свои эмоции не фильтруя: тревога, грусть, страх, злость, обида...',
    'Какие мысли не дают тебе покоя, что ты всё время прокручиваешь в голове?',
    'Чего ты боишься? Страхи, сомнения, риски... Опиши их все.',
    'Чего ты сейчас хочешь? Опиши свои желания и потребности.',
    'Что ты сейчас сделал? Расскажи о своих действиях которые ты предпринял.',
]


def save_cbt_session(diary_entry_id, pain_before, pain_after, answers):
    """
    Сохранить КБТ-сессию с ответами.
    answers — список dict: [{question_number, answer, skipped}, ...]
    """
    conn = get_db()

    pain_change = pain_after - pain_before if pain_after is not None else None

    cursor = conn.execute('''
        INSERT INTO cbt_sessions (diary_entry_id, pain_before, pain_after, pain_change)
        VALUES (?, ?, ?, ?)
    ''', (diary_entry_id, pain_before, pain_after, pain_change))

    session_id = cursor.lastrowid

    for ans in answers:
        q_num = ans['question_number']
        q_text = CBT_QUESTIONS[q_num - 1] if q_num <= len(CBT_QUESTIONS) else ''
        conn.execute('''
            INSERT INTO cbt_answers (session_id, question_number, question_text, answer, skipped)
            VALUES (?, ?, ?, ?, ?)
        ''', (session_id, q_num, q_text, ans.get('answer', ''), ans.get('skipped', False)))

    conn.commit()
    conn.close()

    return {
        'success': True,
        'session_id': session_id,
        'pain_change': pain_change
    }


def get_cbt_sessions(user_id, limit=20, offset=0):
    """Получить КБТ-сессии клиента для дашборда психолога с пагинацией."""
    conn = get_db()

    total = conn.execute(
        'SELECT COUNT(*) as count FROM cbt_sessions WHERE user_id = ?',
        (user_id,)
    ).fetchone()['count']

    sessions = conn.execute('''
        SELECT cs.id, cs.pain_before, cs.pain_after, cs.pain_change, cs.created_at,
               de.transcription as diary_text, de.emoji
        FROM cbt_sessions cs
        LEFT JOIN diary_entries de ON cs.diary_entry_id = de.id
        WHERE cs.user_id = ?
        ORDER BY cs.created_at DESC
        LIMIT ? OFFSET ?
    ''', (user_id, limit, offset)).fetchall()

    result = []
    for s in sessions:
        # Загрузить ответы
        answers = conn.execute('''
            SELECT question_number, question_text, answer, skipped
            FROM cbt_answers
            WHERE session_id = ?
            ORDER BY question_number
        ''', (s['id'],)).fetchall()

        result.append({
            'id': s['id'],
            'pain_before': s['pain_before'],
            'pain_after': s['pain_after'],
            'pain_change': s['pain_change'],
            'created_at': s['created_at'],
            'diary_text': s['diary_text'],
            'emoji': s['emoji'],
            'answers': [
                {
                    'question_number': a['question_number'],
                    'question_text': a['question_text'],
                    'answer': a['answer'],
                    'skipped': bool(a['skipped'])
                } for a in answers
            ]
        })

    conn.close()
    return {'sessions': result, 'total': total}
