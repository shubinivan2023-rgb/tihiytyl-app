const API_BASE = 'http://localhost:5002';

async function loadTechniques() {
    try {
        const response = await fetch(`${API_BASE}/api/techniques`);
        const data = await response.json();

        const byCategory = {
            breathing: [],
            grounding: [],
            relaxation: []
        };

        data.techniques.forEach(tech => {
            if (byCategory[tech.category]) {
                byCategory[tech.category].push(tech);
            }
        });

        renderCategory('breathingTechniques', byCategory.breathing);
        renderCategory('groundingTechniques', byCategory.grounding);
        renderCategory('relaxationTechniques', byCategory.relaxation);
    } catch (err) {
        alert('Ошибка загрузки техник');
    }
}

function renderCategory(containerId, techniques) {
    const container = document.getElementById(containerId);

    if (techniques.length === 0) {
        container.innerHTML = '<p class="meta">Пока нет техник в этой категории</p>';
        return;
    }

    techniques.forEach(tech => {
        const card = document.createElement('div');
        card.className = 'technique-card';
        card.innerHTML = `
            <h3>${tech.name}</h3>
            <p class="duration">${tech.duration} мин</p>
            <p class="description">${tech.description}</p>
            <div class="actions">
                <button onclick="startTechnique(${tech.id})" class="btn-primary">Начать</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function startTechnique(techniqueId) {
    window.location.href = `technique-player.html?id=${techniqueId}`;
}

loadTechniques();
