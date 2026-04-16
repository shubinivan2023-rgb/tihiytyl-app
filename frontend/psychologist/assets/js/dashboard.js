const API_BASE = 'http://localhost:5002';

// Проверка авторизации
const userId = sessionStorage.getItem('userId');
const accessCodeId = sessionStorage.getItem('accessCodeId');
const clientCode = sessionStorage.getItem('clientCode');
const clientSince = sessionStorage.getItem('clientSince');

if (!userId || !accessCodeId) {
    window.location.href = 'index.html';
}

// Показать код в хедере
document.getElementById('clientCode').textContent = clientCode;

// Пагинация
let currentOffset = 0;
const ENTRIES_PER_PAGE = 10;
let activeFilterDate = null;
let rawTimeline = []; // Сырые данные timeline для маппинга клика → дата

// Пагинация КБТ
let cbtOffset = 0;
const CBT_PER_PAGE = 10;

// Загрузить статистику
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/psychologist/client-stats/${userId}`);
        const data = await response.json();

        // Общая информация
        document.getElementById('totalEntries').textContent = data.overview.total_entries;
        document.getElementById('clientSince').textContent =
            formatDate(data.overview.first_entry_date);
        document.getElementById('avgPain').textContent =
            data.overview.avg_pain_level ? data.overview.avg_pain_level + '/10' : '—';
        document.getElementById('lastEntry').textContent =
            formatDate(data.overview.last_entry_date);

        // График динамики
        renderChart(data.timeline);

        // Таблица техник
        renderTechniquesTable(data.techniques);

    } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
    }
}

// Отрисовка графика
function renderChart(timeline) {
    const ctx = document.getElementById('painChart').getContext('2d');

    if (timeline.length === 0) {
        ctx.canvas.parentElement.innerHTML =
            '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Нет данных для графика</p>';
        return;
    }

    rawTimeline = timeline;
    const dates = timeline.map(t => formatDate(t.date));
    const painLevels = timeline.map(t => t.avg_pain);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Уровень боли',
                data: painLevels,
                borderColor: '#4A90A4',
                backgroundColor: 'rgba(74, 144, 164, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#4A90A4',
                pointRadius: 4,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#E8ECF0',
                pointHoverBorderColor: '#4A90A4',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const date = rawTimeline[index].date; // YYYY-MM-DD
                    filterByDate(date);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1A2A3A',
                    titleColor: '#E8ECF0',
                    bodyColor: '#9EACBA',
                    borderColor: '#4A90A4',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: (context) => `Боль: ${context.parsed.y}/10`,
                        footer: () => 'Нажми, чтобы посмотреть записи за эту дату'
                    },
                    footerColor: '#4A90A4',
                    footerFont: { size: 11 }
                }
            },
            scales: {
                y: {
                    min: 1,
                    max: 10,
                    reverse: false, // Стандартная ось: снижение боли = график вниз
                    ticks: { color: '#9EACBA' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: {
                        color: '#9EACBA',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// Таблица техник
function renderTechniquesTable(techniques) {
    const container = document.getElementById('techniquesTable');

    if (techniques.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Клиент ещё не использовал техники</p>';
        return;
    }

    let html = '<div class="techniques-table">';

    // Заголовок
    html += `
        <div class="technique-row header">
            <div>Техника</div>
            <div>Использований</div>
            <div>Эффективность</div>
            <div>Изменение боли</div>
        </div>
    `;

    // Данные
    techniques.forEach(tech => {
        // Отрицательный avg_improvement = боль уменьшилась = хорошо
        const improvement = tech.avg_improvement;
        const improvementText = improvement !== null
            ? (improvement > 0 ? '+' + improvement : improvement)
            : '—';

        html += `
            <div class="technique-row">
                <div class="technique-name">${tech.name}</div>
                <div>${tech.usage_count}</div>
                <div class="success-rate">${tech.success_rate}%</div>
                <div>${improvementText}</div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Загрузить записи
async function loadEntries() {
    try {
        let url = `${API_BASE}/api/psychologist/client-entries/${userId}?limit=${ENTRIES_PER_PAGE}&offset=${currentOffset}`;
        if (activeFilterDate) {
            url += `&date=${activeFilterDate}`;
        }
        const response = await fetch(url);
        const data = await response.json();

        renderEntries(data.entries);

        // Показать кнопку «Загрузить ещё» если есть ещё записи
        if (currentOffset + ENTRIES_PER_PAGE < data.total) {
            document.getElementById('loadMoreBtn').classList.remove('hidden');
        } else {
            document.getElementById('loadMoreBtn').classList.add('hidden');
        }

    } catch (err) {
        console.error('Ошибка загрузки записей:', err);
    }
}

// Отрисовка записей
function renderEntries(entries) {
    const container = document.getElementById('entriesTable');

    if (entries.length === 0 && currentOffset === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Нет записей</p>';
        return;
    }

    let html = currentOffset === 0 ? '<div class="entries-table">' : '';

    entries.forEach(entry => {
        const typeLabel = entry.input_type === 'voice' ? '🎤 голос' : '⌨️ текст';

        html += `
            <div class="entry-card">
                <div class="entry-header">
                    <span class="entry-date">${formatDateTime(entry.created_at)}</span>
                    <div class="entry-meta">
                        <span class="entry-emoji">${entry.emoji}</span>
                        <span class="entry-pain">${entry.pain_level}/10</span>
                        <span class="entry-type">${typeLabel}</span>
                    </div>
                </div>
                <div class="entry-text">${escapeHtml(entry.transcription)}</div>
            </div>
        `;
    });

    if (currentOffset === 0) {
        html += '</div>';
        container.innerHTML = html;
    } else {
        container.querySelector('.entries-table').insertAdjacentHTML('beforeend', html);
    }
}

// Кнопка «Загрузить ещё»
document.getElementById('loadMoreBtn').addEventListener('click', () => {
    currentOffset += ENTRIES_PER_PAGE;
    loadEntries();
});

// Фильтрация записей по дате
function filterByDate(date) {
    activeFilterDate = date;
    currentOffset = 0;
    document.getElementById('dateFilter').value = date;
    document.getElementById('resetDateFilter').classList.remove('hidden');
    loadEntries();

    // Скролл к записям
    document.querySelector('.entries-section').scrollIntoView({ behavior: 'smooth' });
}

function resetDateFilter() {
    activeFilterDate = null;
    currentOffset = 0;
    document.getElementById('dateFilter').value = '';
    document.getElementById('resetDateFilter').classList.add('hidden');
    loadEntries();
}

// Фильтр по дате — ввод вручную
document.getElementById('dateFilter').addEventListener('change', (e) => {
    if (e.target.value) {
        filterByDate(e.target.value);
    } else {
        resetDateFilter();
    }
});

// Кнопка сброса
document.getElementById('resetDateFilter').addEventListener('click', resetDateFilter);

// Выход
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Форматирование даты
function formatDate(dateStr) {
    if (!dateStr || dateStr === 'null') return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Защита от XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === КБТ-СЕССИИ ===

async function loadCbtSessions() {
    try {
        const response = await fetch(
            `${API_BASE}/api/cbt/sessions/${userId}?limit=${CBT_PER_PAGE}&offset=${cbtOffset}`
        );
        const data = await response.json();
        renderCbtSessions(data.sessions);

        // Показать кнопку «Загрузить ещё» если есть ещё сессии
        if (cbtOffset + CBT_PER_PAGE < data.total) {
            document.getElementById('loadMoreCbtBtn').classList.remove('hidden');
        } else {
            document.getElementById('loadMoreCbtBtn').classList.add('hidden');
        }
    } catch (err) {
        console.error('Ошибка загрузки КБТ-сессий:', err);
    }
}

function renderCbtSessions(sessions) {
    const container = document.getElementById('cbtSessionsList');

    if (sessions.length === 0 && cbtOffset === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Клиент ещё не проходил КБТ-сессии</p>';
        return;
    }

    let html = cbtOffset === 0 ? '<div class="cbt-sessions">' : '';

    sessions.forEach(session => {
        const painChangeText = session.pain_change !== null
            ? (session.pain_change > 0 ? '+' + session.pain_change : session.pain_change)
            : '—';
        const painChangeClass = session.pain_change !== null
            ? (session.pain_change < 0 ? 'improved' : session.pain_change > 0 ? 'worsened' : '')
            : '';

        html += `
            <div class="cbt-session-card">
                <div class="cbt-session-header cbt-toggle" onclick="this.closest('.cbt-session-card').classList.toggle('open')">
                    <span class="cbt-session-date">${formatDateTime(session.created_at)}</span>
                    <div class="cbt-session-pain">
                        <span>Боль: ${session.pain_before} → ${session.pain_after || '—'}</span>
                        <span class="pain-change ${painChangeClass}">(${painChangeText})</span>
                        <span class="cbt-chevron">▸</span>
                    </div>
                </div>

                <div class="cbt-answers">
                    ${session.answers.map(a => `
                        <div class="cbt-answer ${a.skipped ? 'skipped' : ''}">
                            <div class="cbt-question">${a.question_number}. ${escapeHtml(a.question_text)}</div>
                            <div class="cbt-answer-text">${a.skipped ? '<em>Пропущено</em>' : escapeHtml(a.answer)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    if (cbtOffset === 0) {
        html += '</div>';
        container.innerHTML = html;
    } else {
        container.querySelector('.cbt-sessions').insertAdjacentHTML('beforeend', html);
    }
}

// Кнопка «Загрузить ещё» для КБТ
document.getElementById('loadMoreCbtBtn').addEventListener('click', () => {
    cbtOffset += CBT_PER_PAGE;
    loadCbtSessions();
});

// === ДОМАШНИЕ ЗАДАНИЯ ===

// Загрузить статистику домашек
async function loadHomeworkStats() {
    try {
        const response = await fetch(`${API_BASE}/api/homework/stats/${userId}`);
        const data = await response.json();

        document.getElementById('hwTotal').textContent = data.total;
        document.getElementById('hwCompleted').textContent = data.completed;
        document.getElementById('hwRate').textContent = data.completion_rate + '%';
    } catch (err) {
        console.error('Ошибка загрузки статистики домашек:', err);
    }
}

// Загрузить список домашек
async function loadHomeworkList() {
    try {
        const response = await fetch(`${API_BASE}/api/homework/list/${userId}`);
        const data = await response.json();
        renderHomeworkTable(data.homework);
    } catch (err) {
        console.error('Ошибка загрузки домашек:', err);
    }
}

// Отрисовка таблицы домашек
function renderHomeworkTable(homework) {
    const container = document.getElementById('homeworkTable');

    if (homework.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Нет назначенных заданий</p>';
        return;
    }

    let html = '<div class="homework-table">';

    homework.forEach(hw => {
        const statusBadge = hw.status === 'completed' ? '✅ Выполнено' :
                           hw.status === 'skipped' ? '⏭️ Пропущено' : '⏳ Ожидает';

        html += `
            <div class="homework-row">
                <div class="hw-info">
                    <strong>${escapeHtml(hw.title)}</strong>
                    ${hw.technique_name ? `<span class="hw-technique">🛡️ ${escapeHtml(hw.technique_name)}</span>` : ''}
                </div>
                <div class="hw-status">${statusBadge}</div>
                <div class="hw-actions">
                    <button onclick="deleteHomework(${hw.id})" class="btn-danger-small">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Открыть модальное окно создания
document.getElementById('createHomeworkBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/techniques`);
        const data = await response.json();

        const select = document.getElementById('hwTechnique');
        select.innerHTML = '<option value="">Без техники</option>';

        data.techniques.forEach(tech => {
            select.innerHTML += `<option value="${tech.id}">${escapeHtml(tech.name)}</option>`;
        });
    } catch (err) {
        console.error('Ошибка загрузки техник:', err);
    }

    document.getElementById('createHomeworkModal').classList.remove('hidden');
});

// Закрыть модальное окно
function closeCreateModal() {
    document.getElementById('createHomeworkModal').classList.add('hidden');
    document.getElementById('createHomeworkForm').reset();
}

// Создать домашку
document.getElementById('createHomeworkForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('hwTitle').value.trim();
    const description = document.getElementById('hwDescription').value.trim();
    const techniqueId = document.getElementById('hwTechnique').value;

    if (!title) return;

    try {
        const response = await fetch(`${API_BASE}/api/homework/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: parseInt(userId),
                title: title,
                description: description || null,
                technique_id: techniqueId ? parseInt(techniqueId) : null
            })
        });

        const data = await response.json();

        if (data.success) {
            closeCreateModal();
            loadHomeworkStats();
            loadHomeworkList();
        }
    } catch (err) {
        console.error('Ошибка создания домашки:', err);
    }
});

// Удалить домашку
async function deleteHomework(homeworkId) {
    if (!confirm('Удалить это задание?')) return;

    try {
        const response = await fetch(
            `${API_BASE}/api/homework/delete/${homeworkId}`,
            { method: 'DELETE' }
        );

        const data = await response.json();

        if (data.success) {
            loadHomeworkStats();
            loadHomeworkList();
        }
    } catch (err) {
        console.error('Ошибка удаления:', err);
    }
}

// Инициализация
loadStats();
loadEntries();
loadCbtSessions();
loadHomeworkStats();
loadHomeworkList();
