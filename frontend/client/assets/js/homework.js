const API_BASE = 'http://localhost:5002';
let currentStatus = 'all';

// Загрузить домашки
async function loadHomework(status) {
    currentStatus = status;
    try {
        const response = await fetch(
            `${API_BASE}/api/homework/list/1?status=${status}`
        );
        const data = await response.json();
        renderHomework(data.homework);
    } catch (err) {
        console.error('Ошибка загрузки домашек:', err);
        document.getElementById('homeworkList').innerHTML =
            '<p style="color: var(--text-secondary); text-align: center;">Ошибка загрузки</p>';
    }
}

// Отрисовка домашек
function renderHomework(homework) {
    const container = document.getElementById('homeworkList');

    if (homework.length === 0) {
        const label = currentStatus === 'pending' ? 'текущих' :
                      currentStatus === 'completed' ? 'выполненных' : '';
        container.innerHTML = `
            <div class="empty-state">
                <p>Нет ${label} заданий</p>
            </div>
        `;
        return;
    }

    let html = '<div class="homework-list">';

    homework.forEach(hw => {
        const statusClass = hw.status;
        const statusText = hw.status === 'completed' ? '✅ Выполнено' :
                          hw.status === 'skipped' ? '⏭️ Пропущено' : '⏳ Ожидает';

        html += `
            <div class="homework-card ${statusClass}">
                <div class="homework-header">
                    <h3>${escapeHtml(hw.title)}</h3>
                    <span class="homework-status">${statusText}</span>
                </div>

                ${hw.description ? `<p class="homework-description">${escapeHtml(hw.description)}</p>` : ''}

                ${hw.technique_name ? `
                    <div class="homework-technique">
                        🛡️ Техника: ${escapeHtml(hw.technique_name)}
                        ${hw.status === 'pending' ? `<button onclick="startTechnique(${hw.technique_id})" class="btn-link">Начать</button>` : ''}
                    </div>
                ` : ''}

                ${hw.status === 'pending' ? `
                    <div class="homework-actions">
                        <button onclick="completeHomework(${hw.id})" class="btn-primary">
                            ✅ Выполнил
                        </button>
                        <button onclick="skipHomework(${hw.id})" class="btn-secondary">
                            ⏭️ Пропустить
                        </button>
                    </div>
                ` : ''}

                <div class="homework-date">
                    Назначено: ${formatDate(hw.created_at)}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Выполнить домашку
async function completeHomework(homeworkId) {
    if (!confirm('Отметить задание как выполненное?')) return;

    try {
        const response = await fetch(
            `${API_BASE}/api/homework/complete/${homeworkId}`,
            { method: 'POST' }
        );
        const data = await response.json();

        if (data.success) {
            loadHomework(currentStatus);
        }
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

// Пропустить домашку
async function skipHomework(homeworkId) {
    if (!confirm('Пропустить это задание?')) return;

    try {
        const response = await fetch(
            `${API_BASE}/api/homework/skip/${homeworkId}`,
            { method: 'POST' }
        );
        const data = await response.json();

        if (data.success) {
            loadHomework(currentStatus);
        }
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

// Начать технику
function startTechnique(techniqueId) {
    window.location.href = `technique-player.html?id=${techniqueId}`;
}

// Фильтры
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b =>
            b.classList.remove('active'));
        btn.classList.add('active');
        loadHomework(btn.dataset.status);
    });
});

// Форматирование даты
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
    });
}

// Защита от XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация
loadHomework('all');
