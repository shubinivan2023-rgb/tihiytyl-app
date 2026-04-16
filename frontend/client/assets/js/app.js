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

            // Если боль >= 5 — получить рекомендацию и предложить технику
            if (selectedPainLevel >= 5) {
                saveBtn.classList.add('hidden');
                await offerRecommendedTechnique(selectedPainLevel);
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

// Умные рекомендации техник
async function offerRecommendedTechnique(painLevel) {
    try {
        const response = await fetch(`${API_BASE}/api/recommendations?pain_level=${painLevel}`);
        const data = await response.json();

        if (data.technique) {
            showTechniqueOfferModal(data.technique);
        } else {
            // Фоллбэк — статическое предложение
            document.getElementById('techniqueOffer').classList.remove('hidden');
        }
    } catch (err) {
        // При ошибке — статическое предложение
        document.getElementById('techniqueOffer').classList.remove('hidden');
    }
}

function showTechniqueOfferModal(technique) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'techniqueOfferModal';

    modal.innerHTML = `
        <div class="modal-content">
            <h3>Хочешь попробовать технику?</h3>
            <p>${technique.message}</p>
            <div class="modal-actions">
                <button class="btn-primary" id="modalAcceptBtn">
                    Да, попробуем
                </button>
                <button class="btn-secondary" id="modalSkipBtn">
                    Нет, спасибо
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('modalAcceptBtn').addEventListener('click', () => {
        window.location.href = `technique-player.html?id=${technique.id}&pain_before=${selectedPainLevel}&entry_id=${lastSavedEntryId}&seq=1`;
    });

    document.getElementById('modalSkipBtn').addEventListener('click', () => {
        modal.remove();
        showTalkOfferModal();
    });
}

// === КБТ-флоу ===

const CBT_QUESTIONS = [
    'Опиши свои эмоции не фильтруя: тревога, грусть, страх, злость, обида...',
    'Какие мысли не дают тебе покоя, что ты всё время прокручиваешь в голове?',
    'Чего ты боишься? Страхи, сомнения, риски... Опиши их все.',
    'Чего ты сейчас хочешь? Опиши свои желания и потребности.',
    'Что ты сейчас сделал? Расскажи о своих действиях которые ты предпринял.',
];

let cbtAnswers = [];

// Шаг 1: «А хочешь мы просто поговорим?»
function showTalkOfferModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'talkOfferModal';

    modal.innerHTML = `
        <div class="modal-content">
            <h3>А хочешь мы просто поговорим?</h3>
            <div class="modal-actions">
                <button class="btn-primary" id="talkYesBtn">Да</button>
                <button class="btn-secondary" id="talkNoBtn">Нет</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('talkYesBtn').addEventListener('click', () => {
        modal.remove();
        cbtAnswers = [];
        showCbtQuestion(0);
    });

    document.getElementById('talkNoBtn').addEventListener('click', () => {
        modal.remove();
        showSupportMessage();
    });
}

// Шаг 2: Показать КБТ-вопрос
function showCbtQuestion(index) {
    if (index >= CBT_QUESTIONS.length) {
        showCbtPainEvaluation();
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'cbtQuestionModal';

    modal.innerHTML = `
        <div class="modal-content cbt-modal">
            <div class="cbt-progress">Вопрос ${index + 1} из ${CBT_QUESTIONS.length}</div>
            <h3>${CBT_QUESTIONS[index]}</h3>
            <textarea id="cbtAnswer" class="cbt-textarea" placeholder="Напиши здесь..." required></textarea>
            <div class="modal-actions">
                <button class="btn-primary" id="cbtNextBtn">Далее</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cbtNextBtn').addEventListener('click', () => {
        const answer = document.getElementById('cbtAnswer').value.trim();
        if (!answer) {
            alert('Напиши что-нибудь');
            return;
        }
        cbtAnswers.push({
            question_number: index + 1,
            answer: answer,
            skipped: false
        });
        modal.remove();
        showCbtQuestion(index + 1);
    });
}

// Шаг 3: Переоценка боли после КБТ
function showCbtPainEvaluation() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'cbtPainModal';

    modal.innerHTML = `
        <div class="modal-content cbt-modal">
            <h3>На сколько плохо ты себя ощущаешь?</h3>
            <p class="cbt-subtitle">По шкале от 1 до 10, где 10 — максимально плохо</p>
            <div class="cbt-pain-scale">
                ${[1,2,3,4,5,6,7,8,9,10].map(n => `
                    <button class="cbt-pain-btn" data-value="${n}">${n}</button>
                `).join('')}
            </div>
            <button class="btn-primary hidden" id="cbtSubmitPainBtn">Готово</button>
        </div>
    `;

    document.body.appendChild(modal);

    let cbtPainAfter = null;

    modal.querySelectorAll('.cbt-pain-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.cbt-pain-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            cbtPainAfter = parseInt(btn.dataset.value);
            document.getElementById('cbtSubmitPainBtn').classList.remove('hidden');
        });
    });

    document.getElementById('cbtSubmitPainBtn').addEventListener('click', async () => {
        await saveCbtSession(cbtPainAfter);
        modal.remove();
        showCbtResultMessage(cbtPainAfter);
    });
}

// Сохранить КБТ-сессию на бэкенд
async function saveCbtSession(painAfter) {
    try {
        await fetch(`${API_BASE}/api/cbt/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                diary_entry_id: lastSavedEntryId,
                pain_before: selectedPainLevel,
                pain_after: painAfter,
                answers: cbtAnswers
            })
        });
    } catch (err) {
        console.error('Ошибка сохранения КБТ-сессии:', err);
    }
}

// Шаг 4: Поддерживающая фраза по результату КБТ
function showCbtResultMessage(painAfter) {
    const painChange = painAfter - selectedPainLevel;
    let message;

    if (painChange <= -2) {
        message = 'Ты молодец, что поговорил о своих чувствах. Тебе уже лучше — это важно.';
    } else if (painChange <= -1) {
        message = 'Хорошо, что ты смог выразить свои мысли. Маленькие шаги — тоже шаги.';
    } else {
        message = 'Спасибо, что поделился. Помни — ты не один, и обратиться к психологу не стыдно.';
    }

    showFinalMessage(message);
}

// Поддерживающая фраза при отказе от разговора
function showSupportMessage() {
    const messages = [
        'Помни, что я рядом. Ты можешь всегда вернуться.',
        'Ты можешь всегда вернуться. Помни, что я рядом.',
    ];
    showFinalMessage(messages[Math.floor(Math.random() * messages.length)]);
}

// Финальная фраза + возврат на главную
function showFinalMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'supportModal';

    modal.innerHTML = `
        <div class="modal-content support-modal">
            <p class="support-message">${message}</p>
            <button class="btn-primary" id="supportOkBtn">На главную</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('supportOkBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Фоллбэк — статические кнопки (если рекомендации недоступны)
document.getElementById('acceptTechnique')?.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/techniques/category/breathing?order=1`);
        const tech = await response.json();
        if (tech.id) {
            window.location.href = `technique-player.html?id=${tech.id}&pain_before=${selectedPainLevel}&entry_id=${lastSavedEntryId}&seq=1`;
        }
    } catch (err) {
        alert('Ошибка загрузки техники');
    }
});

document.getElementById('skipTechnique')?.addEventListener('click', () => {
    document.getElementById('techniqueOffer').classList.add('hidden');
    showTalkOfferModal();
});
