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
            <a href="entries.html" class="btn-primary">К записям</a>
        `;
    } else if (painChange <= -1 && sequenceIndex < 2) {
        // Небольшое улучшение, можно предложить ещё
        messageEl.textContent = 'Хорошо! Маленькие шаги\nХочешь попробовать ещё одну технику?';
        actionsEl.innerHTML = `
            <div style="display:flex; gap:10px; flex-direction:column;">
                <button onclick="startNextTechnique()" class="btn-primary">Да, попробуем</button>
                <a href="entries.html" class="btn-secondary" style="text-decoration:none; text-align:center;">Нет, спасибо</a>
            </div>
        `;
    } else if (painChange > -1 && sequenceIndex < 2) {
        // Не помогло, предложить другую
        messageEl.textContent = 'Эта техника не помогла. Попробуем другую?';
        actionsEl.innerHTML = `
            <div style="display:flex; gap:10px; flex-direction:column;">
                <button onclick="startNextTechnique()" class="btn-primary">Да, попробуем</button>
                <a href="entries.html" class="btn-secondary" style="text-decoration:none; text-align:center;">Нет, спасибо</a>
            </div>
        `;
    } else {
        // Вторая техника — в любом случае завершаем
        if (painChange <= -1) {
            messageEl.textContent = 'Хорошо, есть небольшое улучшение';
        } else {
            messageEl.textContent = 'Техники не помогли. Рекомендуем связаться с психологом для поддержки.';
        }
        actionsEl.innerHTML = `
            <a href="entries.html" class="btn-primary">К записям</a>
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

// Инициализация
loadTechnique();
