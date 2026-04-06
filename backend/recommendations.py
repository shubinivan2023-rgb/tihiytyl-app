from models import get_db


def get_recommendation(pain_level, user_id=1):
    """
    Получить рекомендованную технику на основе истории

    Логика:
    1. pain_level > 5 → техника не нужна
    2. Есть успешная техника (helped=true) → предложить её
    3. Нет истории → стандартная (дыхательная)
    """
    # Шкала боли: 1 = нет боли, 10 = невыносимая
    # При низкой боли (< 5) техника не нужна
    if pain_level < 5:
        return {'technique': None}

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
        ORDER BY success_count DESC, avg_improvement ASC
        LIMIT 1
    ''', (user_id,)).fetchone()

    if successful:
        conn.close()
        return {
            'technique': {
                'id': successful['id'],
                'name': successful['name'],
                'category': successful['category'],
                'reason': 'personal_history',
                'message': f'Тебе раньше помогало "{successful["name"]}". Попробуем?'
            }
        }

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
        return {
            'technique': {
                'id': default['id'],
                'name': default['name'],
                'category': default['category'],
                'reason': 'default',
                'message': 'Начнём с дыхательной техники для быстрого успокоения'
            }
        }

    return {'technique': None}
