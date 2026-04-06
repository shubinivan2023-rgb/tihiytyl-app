const API_BASE = 'http://localhost:5002';

// Загрузить код доступа
async function loadAccessCode() {
    try {
        const response = await fetch(`${API_BASE}/api/profile/access-code`);
        const data = await response.json();

        document.getElementById('accessCode').textContent = data.code;

        const status = data.is_connected
            ? 'Статус: Связан с психологом'
            : 'Статус: Не связан с психологом';
        document.getElementById('connectionStatus').textContent = status;

    } catch (err) {
        document.getElementById('accessCode').textContent = 'Ошибка загрузки';
        document.getElementById('connectionStatus').textContent = 'Ошибка загрузки статуса';
    }
}

// Сгенерировать новый код
document.getElementById('regenerateBtn').addEventListener('click', async () => {
    if (!confirm('Сгенерировать новый код? Старый код перестанет работать.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/profile/access-code/regenerate`, {
            method: 'POST'
        });
        const data = await response.json();

        document.getElementById('accessCode').textContent = data.code;
        document.getElementById('connectionStatus').textContent = 'Статус: Не связан с психологом';
        alert('Новый код создан!');

    } catch (err) {
        alert('Ошибка создания кода');
    }
});

// Загрузить статистику
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/profile/stats`);
        const data = await response.json();

        // Практики за неделю
        document.getElementById('daysPracticed').textContent =
            `${data.days_practiced} из 7 дней`;

        // Тренд
        const trendText = data.trend === 'improving'
            ? 'Становится лучше'
            : 'Стабильно';
        document.getElementById('trend').textContent = trendText;

        // Техники
        const techniquesList = document.getElementById('techniquesList');

        if (data.helpful_techniques.length === 0) {
            techniquesList.innerHTML = '<p class="meta">Пока нет данных. Попробуй техники, чтобы увидеть что работает!</p>';
            return;
        }

        techniquesList.innerHTML = '';
        data.helpful_techniques.forEach(tech => {
            const card = document.createElement('div');
            card.className = 'technique-stat-card';

            card.innerHTML = `
                <div class="technique-name">${tech.name}</div>
                <div class="technique-stats">
                    Помогло ${tech.success_count} раз из ${tech.total_uses}
                </div>
            `;

            techniquesList.appendChild(card);
        });

    } catch (err) {
        document.getElementById('daysPracticed').textContent = 'Ошибка загрузки';
        document.getElementById('trend').textContent = 'Ошибка загрузки';
    }
}

// Загрузить настройки
async function loadPreferences() {
    try {
        const response = await fetch(`${API_BASE}/api/profile/preferences`);
        const data = await response.json();

        const voiceBtn = document.getElementById('voiceModeBtn');
        const textBtn = document.getElementById('textModeBtn');

        if (data.default_input_mode === 'voice') {
            voiceBtn.classList.add('active');
            textBtn.classList.remove('active');
        } else {
            textBtn.classList.add('active');
            voiceBtn.classList.remove('active');
        }

    } catch (err) {
        console.error('Ошибка загрузки настроек:', err);
    }
}

// Изменить режим
async function changeMode(mode) {
    try {
        await fetch(`${API_BASE}/api/profile/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ default_input_mode: mode })
        });

        const voiceBtn = document.getElementById('voiceModeBtn');
        const textBtn = document.getElementById('textModeBtn');

        if (mode === 'voice') {
            voiceBtn.classList.add('active');
            textBtn.classList.remove('active');
        } else {
            textBtn.classList.add('active');
            voiceBtn.classList.remove('active');
        }

    } catch (err) {
        alert('Ошибка сохранения настроек');
    }
}

// Обработчики кнопок
document.getElementById('voiceModeBtn').addEventListener('click', () => changeMode('voice'));
document.getElementById('textModeBtn').addEventListener('click', () => changeMode('text'));

// Инициализация
loadAccessCode();
loadStats();
loadPreferences();
