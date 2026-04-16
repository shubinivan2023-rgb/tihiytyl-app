from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import whisper
import tempfile
import os

from models import init_db
from diary import save_entry, get_entries
from techniques import (
    get_all_techniques, get_technique_by_id,
    get_technique_by_category, save_technique_usage
)
from profile import (
    get_active_code, regenerate_code,
    get_stats, get_preferences, update_preferences
)
from recommendations import get_recommendation
from psychologist import (
    verify_code, get_client_stats,
    get_client_entries, get_access_info
)
from homework import (
    create_homework, get_homework_list,
    complete_homework, skip_homework,
    delete_homework, get_homework_stats
)
from cbt import save_cbt_session, get_cbt_sessions

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'client')
PSYCHOLOGIST_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'psychologist')
AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'audio')

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)

# Whisper модель (base для скорости)
model = whisper.load_model("base")


# === Модуль 1: Дневник ===

@app.route('/api/diary/voice', methods=['POST'])
def transcribe_voice():
    if 'audio' not in request.files:
        return jsonify({'error': 'Аудиофайл не найден', 'success': False}), 400

    audio_file = request.files['audio']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path, language='ru')
        transcription = result['text']
        return jsonify({'transcription': transcription, 'success': True})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
    finally:
        os.unlink(tmp_path)


@app.route('/api/diary/save', methods=['POST'])
def save_diary_entry():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Нет данных', 'success': False}), 400

    required = ['transcription', 'input_type', 'pain_level', 'emoji']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Отсутствует поле: {field}', 'success': False}), 400

    try:
        entry_id = save_entry(
            data['transcription'],
            data['input_type'],
            data['pain_level'],
            data['emoji']
        )
        return jsonify({'id': entry_id, 'success': True})
    except ValueError as e:
        return jsonify({'error': str(e), 'success': False}), 400
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/diary/entries', methods=['GET'])
def get_diary_entries():
    try:
        entries = get_entries()
        return jsonify({'entries': entries})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


# === Модуль 2: Техники самопомощи ===

@app.route('/api/techniques', methods=['GET'])
def api_get_techniques():
    try:
        techniques = get_all_techniques()
        return jsonify({'techniques': techniques})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/techniques/<int:technique_id>', methods=['GET'])
def api_get_technique(technique_id):
    try:
        technique = get_technique_by_id(technique_id)
        if not technique:
            return jsonify({'error': 'Техника не найдена', 'success': False}), 404
        return jsonify(technique)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/techniques/category/<category>', methods=['GET'])
def api_get_technique_by_category(category):
    try:
        order = request.args.get('order', 1, type=int)
        technique = get_technique_by_category(category, order)
        if not technique:
            return jsonify({'error': 'Техника не найдена', 'success': False}), 404
        return jsonify(technique)
    except ValueError as e:
        return jsonify({'error': str(e), 'success': False}), 400
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/techniques/usage', methods=['POST'])
def api_save_technique_usage():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Нет данных', 'success': False}), 400

    required = ['technique_id', 'pain_before', 'pain_after']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Отсутствует поле: {field}', 'success': False}), 400

    try:
        result = save_technique_usage(
            data['technique_id'],
            data['pain_before'],
            data['pain_after'],
            data.get('diary_entry_id')
        )
        return jsonify({'success': True, **result})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


# === Модуль 3: Профиль клиента ===

@app.route('/api/profile/access-code', methods=['GET'])
def api_get_access_code():
    try:
        result = get_active_code()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/profile/access-code/regenerate', methods=['POST'])
def api_regenerate_access_code():
    try:
        result = regenerate_code()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/profile/stats', methods=['GET'])
def api_get_stats():
    try:
        result = get_stats()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/profile/preferences', methods=['GET', 'POST'])
def api_preferences():
    if request.method == 'GET':
        try:
            result = get_preferences()
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        data = request.get_json(silent=True)
        if not data or 'default_input_mode' not in data:
            return jsonify({'error': 'Отсутствует поле: default_input_mode', 'success': False}), 400
        try:
            result = update_preferences(data['default_input_mode'])
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations', methods=['GET'])
def api_get_recommendation():
    pain_level = request.args.get('pain_level', type=int)
    if not pain_level:
        return jsonify({'error': 'pain_level required'}), 400
    try:
        result = get_recommendation(pain_level)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# === Модуль 4: Дашборд психолога ===

@app.route('/api/psychologist/verify-code', methods=['POST'])
def api_verify_code():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'valid': False, 'error': 'Нет данных'}), 400
    code = data.get('code', '')
    result = verify_code(code)
    if not result['valid']:
        return jsonify(result), 400 if result['error'] == 'Код не указан' else 200
    return jsonify(result)


@app.route('/api/psychologist/client-stats/<int:user_id>', methods=['GET'])
def api_get_client_stats(user_id):
    try:
        result = get_client_stats(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/psychologist/client-entries/<int:user_id>', methods=['GET'])
def api_get_client_entries(user_id):
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        date = request.args.get('date', None, type=str)
        result = get_client_entries(user_id, limit, offset, date=date)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/psychologist/access-info/<int:access_code_id>', methods=['GET'])
def api_get_access_info(access_code_id):
    try:
        result = get_access_info(access_code_id)
        if not result:
            return jsonify({'error': 'Код не найден'}), 404
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# === Модуль 5: Домашние задания ===

@app.route('/api/homework/create', methods=['POST'])
def api_create_homework():
    data = request.get_json(silent=True)
    if not data or not data.get('user_id') or not data.get('title'):
        return jsonify({'error': 'user_id и title обязательны', 'success': False}), 400
    try:
        result = create_homework(
            data['user_id'],
            data['title'],
            data.get('description'),
            data.get('technique_id')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/homework/list/<int:user_id>', methods=['GET'])
def api_get_homework_list(user_id):
    try:
        status_filter = request.args.get('status', 'all')
        result = get_homework_list(user_id, status_filter)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/homework/complete/<int:homework_id>', methods=['POST'])
def api_complete_homework(homework_id):
    data = request.get_json(silent=True) or {}
    try:
        result = complete_homework(homework_id, data.get('notes'))
        if not result:
            return jsonify({'error': 'Домашка не найдена'}), 404
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/homework/skip/<int:homework_id>', methods=['POST'])
def api_skip_homework(homework_id):
    try:
        result = skip_homework(homework_id)
        if not result:
            return jsonify({'error': 'Домашка не найдена'}), 404
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/homework/delete/<int:homework_id>', methods=['DELETE'])
def api_delete_homework(homework_id):
    try:
        result = delete_homework(homework_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/homework/stats/<int:user_id>', methods=['GET'])
def api_get_homework_stats(user_id):
    try:
        result = get_homework_stats(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# === КБТ-сессии ===

@app.route('/api/cbt/save', methods=['POST'])
def api_save_cbt_session():
    data = request.get_json(silent=True)
    if not data or 'pain_before' not in data or 'answers' not in data:
        return jsonify({'error': 'pain_before и answers обязательны', 'success': False}), 400
    try:
        result = save_cbt_session(
            data.get('diary_entry_id'),
            data['pain_before'],
            data.get('pain_after'),
            data['answers']
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/cbt/sessions/<int:user_id>', methods=['GET'])
def api_get_cbt_sessions(user_id):
    try:
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        data = get_cbt_sessions(user_id, limit=limit, offset=offset)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# === Раздача аудио ===

@app.route('/audio/<path:filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)


# === Раздача фронтенда ===

# Дашборд психолога
@app.route('/psychologist/')
def serve_psychologist_index():
    return send_from_directory(PSYCHOLOGIST_DIR, 'index.html')


@app.route('/psychologist/<path:path>')
def serve_psychologist_static(path):
    return send_from_directory(PSYCHOLOGIST_DIR, path)


# Клиентский интерфейс
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5002, debug=True)
