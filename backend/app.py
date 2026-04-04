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

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'client')
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


# === Раздача аудио ===

@app.route('/audio/<path:filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)


# === Раздача фронтенда ===

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5002, debug=True)
