const API_BASE = 'http://localhost:5002';

// Параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const techniqueId = urlParams.get('id');
const painBefore = parseInt(urlParams.get('pain_before')) || 5;
const diaryEntryId = urlParams.get('entry_id') || null;
// Какая по счёту техника в последовательности (1 или 2)
const sequenceIndex = parseInt(urlParams.get('seq')) || 1;

let technique = null;
let painAfter = null;

// Загрузить технику
async function loadTechnique() {
    try {
        const response = await fetch(`${API_BASE}/api/techniques/${techniqueId}`);
        if (!response.ok) {
            alert('Техника не найдена');
            return;
        }
        technique = await response.json();

        document.getElementById('techniqueName').textContent = technique.name;
        document.getElementById('techniqueDuration').textContent = `${technique.duration} мин`;

        if (technique.instructions) {
            document.getElementById('instructions').textContent = technique.instructions;
            document.getElementById('instructions').classList.remove('hidden');
        }

        // Установить аудио
        const audioSource = document.getElementById('audioSource');
        audioSource.src = `${API_BASE}${technique.audio_path}`;
        document.getElementById('audioElement').load();
    } catch (err) {
        alert('Ошибка загрузки техники');
    }
}

// Аудио-проигрыватель
const audio = document.getElementById('audioElement');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

playBtn.addEventListener('click', () => {
    audio.play();
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
});

pauseBtn.addEventListener('click', () => {
    audio.pause();
    pauseBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = progress + '%';
    }
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    showAfterTechniqueEvaluation();
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Показать оценку после техники
function showAfterTechniqueEvaluation() {
    audio.pause();
    document.getElementById('techniquePlayer').classList.add('hidden');
    document.getElementById('afterTechnique').classList.remove('hidden');
}

// Досрочное завершение
document.getElementById('finishBtn').addEventListener('click', () => {
    showAfterTechniqueEvaluation();
});

// Выбор эмодзи после техники
document.querySelectorAll('.after-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.after-emoji').forEach(b =>
            b.classList.remove('selected'));
        btn.classList.add('selected');

        painAfter = parseInt(btn.dataset.value);
        document.getElementById('submitAfterBtn').classList.remove('hidden');
    });
});

// Отправить результат
document.getElementById('submitAfterBtn').addEventListener('click', async () => {
    if (!painAfter) {
        alert('Выбери как себя чувствуешь');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/techniques/usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                technique_id: parseInt(techniqueId),
                diary_entry_id: diaryEntryId ? parseInt(diaryEntryId) : null,
                pain_before: painBefore,
                pain_after: painAfter
            })
        });

        const result = await response.json();
        handleTechniqueResult(result);
    } catch (err) {
        alert('Ошибка сохранения результата');
    }
});

// Обработка результата
// Шкала боли: 1 = нет боли, 10 = невыносимая
// pain_change = after - before, отрицательный = улучшение (боль уменьшилась)
function handleTechniqueResult(result) {
    const painChange = result.pain_change;

    document.getElementById('afterTechnique').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');

    const messageEl = document.getElementById('resultMessage');
    const actionsEl = document.getElementById('resultActions');

    if (painChange <= -2) {
        // Значительное улучшение (боль уменьшилась на 2+)
        messageEl.textContent = 'Отлично! Тебе стало значительно лучше';
        actionsEl.innerHTML = `
            <a href="index.html" class="btn-primary">На главную</a>
        `;
    } else if (painChange <= -1 && sequenceIndex < 2) {
        // Небольшое улучшение, можно предложить ещё
        messageEl.textContent = 'Хорошо! Маленькие шаги\nХочешь попробовать ещё одну технику?';
        actionsEl.innerHTML = `
            <div style="display:flex; gap:10px; flex-direction:column;">
                <button onclick="startNextTechnique()" class="btn-primary">Да, попробуем</button>
                <button onclick="declineTechnique()" class="btn-secondary">Нет, спасибо</button>
            </div>
        `;
    } else if (painChange > -1 && sequenceIndex < 2) {
        // Не помогло, предложить другую
        messageEl.textContent = 'Эта техника не помогла. Попробуем другую?';
        actionsEl.innerHTML = `
            <div style="display:flex; gap:10px; flex-direction:column;">
                <button onclick="startNextTechnique()" class="btn-primary">Да, попробуем</button>
                <button onclick="declineTechnique()" class="btn-secondary">Нет, спасибо</button>
            </div>
        `;
    } else {
        // Вторая техника — в любом случае завершаем
        if (painChange <= -1) {
            messageEl.textContent = 'Хорошо, есть небольшое улучшение';
        } else {
            messageEl.textContent = 'Техники не помогли.';
        }
        // После 2 техник — предложить поговорить
        actionsEl.innerHTML = `
            <button onclick="declineTechnique()" class="btn-primary">Продолжить</button>
        `;
    }
}

// Запуск следующей техники (визуальная/заземление после дыхательной)
async function startNextTechnique() {
    try {
        const response = await fetch(`${API_BASE}/api/techniques/category/grounding?order=1`);
        const tech = await response.json();
        if (tech.id) {
            window.location.href = `technique-player.html?id=${tech.id}&pain_before=${painAfter}&entry_id=${diaryEntryId || ''}&seq=2`;
        }
    } catch (err) {
        alert('Ошибка загрузки техники');
    }
}

// Отказ от техники → КБТ-флоу
function declineTechnique() {
    document.getElementById('resultScreen').classList.add('hidden');
    showTalkOfferModal();
}

// === КБТ-флоу (при отказе от продолжения техник) ===

const CBT_QUESTIONS = [
    'Опиши свои эмоции не фильтруя: тревога, грусть, страх, злость, обида...',
    'Какие мысли не дают тебе покоя, что ты всё время прокручиваешь в голове?',
    'Чего ты боишься? Страхи, сомнения, риски... Опиши их все.',
    'Чего ты сейчас хочешь? Опиши свои желания и потребности.',
    'Что ты сейчас сделал? Расскажи о своих действиях которые ты предпринял.',
];

let cbtAnswers = [];

function showTalkOfferModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
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

function showCbtQuestion(index) {
    if (index >= CBT_QUESTIONS.length) {
        showCbtPainEvaluation();
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content cbt-modal">
            <div class="cbt-progress">Вопрос ${index + 1} из ${CBT_QUESTIONS.length}</div>
            <h3>${CBT_QUESTIONS[index]}</h3>
            <textarea id="cbtAnswer" class="cbt-textarea" placeholder="Напиши здесь..."></textarea>
            <div class="modal-actions">
                <button class="btn-primary" id="cbtNextBtn">Далее</button>
                <button class="btn-secondary" id="cbtSkipBtn">Пропустить вопрос</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cbtNextBtn').addEventListener('click', () => {
        const answer = document.getElementById('cbtAnswer').value.trim();
        cbtAnswers.push({ question_number: index + 1, answer: answer || '', skipped: !answer });
        modal.remove();
        showCbtQuestion(index + 1);
    });

    document.getElementById('cbtSkipBtn').addEventListener('click', () => {
        cbtAnswers.push({ question_number: index + 1, answer: '', skipped: true });
        modal.remove();
        showCbtQuestion(index + 1);
    });
}

function showCbtPainEvaluation() {
    const modal = document.createElement('div');
    modal.className = 'modal';
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

async function saveCbtSession(cbtPainAfter) {
    try {
        await fetch(`${API_BASE}/api/cbt/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                diary_entry_id: diaryEntryId ? parseInt(diaryEntryId) : null,
                pain_before: painBefore,
                pain_after: cbtPainAfter,
                answers: cbtAnswers
            })
        });
    } catch (err) {
        console.error('Ошибка сохранения КБТ-сессии:', err);
    }
}

function showCbtResultMessage(cbtPainAfter) {
    const change = cbtPainAfter - painBefore;
    let message;
    if (change <= -2) {
        message = 'Ты молодец, что поговорил о своих чувствах. Тебе уже лучше — это важно.';
    } else if (change <= -1) {
        message = 'Хорошо, что ты смог выразить свои мысли. Маленькие шаги — тоже шаги.';
    } else {
        message = 'Спасибо, что поделился. Помни — ты не один, и обратиться к психологу не стыдно.';
    }
    showFinalMessage(message);
}

function showSupportMessage() {
    showFinalMessage('Помни, что я рядом. Ты можешь всегда вернуться.');
}

function showFinalMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
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

// Инициализация
loadTechnique();
