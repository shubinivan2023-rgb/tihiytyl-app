const API_BASE = 'http://localhost:5002';

let currentMode = null;
let transcription = '';
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;
let seconds = 0;
let selectedPainLevel = null;
let selectedEmoji = null;
let lastSavedEntryId = null;

// Выбор режима
function selectMode(mode) {
    currentMode = mode;
    document.getElementById('modeSelection').classList.add('hidden');

    if (mode === 'voice') {
        document.getElementById('voiceMode').classList.remove('hidden');
    } else {
        document.getElementById('textMode').classList.remove('hidden');
        document.getElementById('emojiScale').classList.remove('hidden');
    }
}

// Голосовая запись — начать
document.getElementById('recordBtn')?.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            // Остановить микрофон
            stream.getTracks().forEach(track => track.stop());

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await sendAudioToBackend(audioBlob);
        };

        mediaRecorder.start();

        // UI
        document.getElementById('recordBtn').classList.add('hidden');
        document.getElementById('recordingStatus').classList.remove('hidden');

        // Таймер
        seconds = 0;
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('timer').textContent =
                `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);

    } catch (err) {
        alert('Не удалось получить доступ к микрофону');
    }
});

// Голосовая запись — остановить
document.getElementById('stopBtn')?.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    clearInterval(timerInterval);
    document.getElementById('recordingStatus').classList.add('hidden');
    document.getElementById('transcriptionLoading').classList.remove('hidden');
});

// Отправить аудио на бэкенд
async function sendAudioToBackend(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
        const response = await fetch(`${API_BASE}/api/diary/voice`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        document.getElementById('transcriptionLoading').classList.add('hidden');

        if (data.success) {
            transcription = data.transcription;
            document.getElementById('transcriptionText').textContent = transcription;
            document.getElementById('transcription').classList.remove('hidden');
            document.getElementById('emojiScale').classList.remove('hidden');
        } else {
            alert('Ошибка расшифровки: ' + data.error);
            // Разрешить повторную запись
            document.getElementById('recordBtn').classList.remove('hidden');
        }
    } catch (err) {
        document.getElementById('transcriptionLoading').classList.add('hidden');
        alert('Ошибка отправки аудио. Проверь, что бэкенд запущен.');
        document.getElementById('recordBtn').classList.remove('hidden');
    }
}

// Эмодзи-шкала
document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-btn').forEach(b =>
            b.classList.remove('selected'));

        btn.classList.add('selected');
        selectedPainLevel = parseInt(btn.dataset.value);
        selectedEmoji = btn.dataset.emoji;

        document.getElementById('saveBtn').classList.remove('hidden');
    });
});

// Сохранение записи
document.getElementById('saveBtn')?.addEventListener('click', async () => {
    if (!selectedPainLevel || !selectedEmoji) {
        alert('Выбери как себя чувствуешь');
        return;
    }

    let text = '';
    if (currentMode === 'voice') {
        text = transcription;
    } else {
        text = document.getElementById('textInput').value.trim();
        if (!text) {
            alert('Напиши что-нибудь');
            return;
        }
    }

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохраняю...';

    try {
        const response = await fetch(`${API_BASE}/api/diary/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transcription: text,
                input_type: currentMode,
                pain_level: selectedPainLevel,
                emoji: selectedEmoji
            })
        });

        const data = await response.json();

        if (data.success) {
            lastSavedEntryId = data.id;

            // Если оценка <= 5 — предложить технику
            if (selectedPainLevel <= 5) {
                saveBtn.classList.add('hidden');
                document.getElementById('techniqueOffer').classList.remove('hidden');
            } else {
                window.location.href = 'entries.html';
            }
        } else {
            alert('Ошибка сохранения: ' + data.error);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить';
        }
    } catch (err) {
        alert('Ошибка отправки данных. Проверь, что бэкенд запущен.');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить';
    }
});

// Предложение техники — принять
document.getElementById('acceptTechnique')?.addEventListener('click', async () => {
    try {
        // Получить первую дыхательную технику
        const response = await fetch(`${API_BASE}/api/techniques/category/breathing?order=1`);
        const tech = await response.json();
        if (tech.id) {
            window.location.href = `technique-player.html?id=${tech.id}&pain_before=${selectedPainLevel}&entry_id=${lastSavedEntryId}&seq=1`;
        }
    } catch (err) {
        alert('Ошибка загрузки техники');
    }
});

// Предложение техники — пропустить
document.getElementById('skipTechnique')?.addEventListener('click', () => {
    window.location.href = 'entries.html';
});
