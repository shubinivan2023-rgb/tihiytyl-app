const API_BASE = 'http://localhost:5002';

const form = document.getElementById('loginForm');
const codeInput = document.getElementById('accessCode');
const errorMessage = document.getElementById('errorMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        showError('Введите код-позывной');
        return;
    }

    // Проверка формата (СЛОВО-ЦЦЦ)
    if (!/^[А-ЯЁ]+-\d{3}$/.test(code)) {
        showError('Неверный формат кода. Пример: БУРЯ-347');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/psychologist/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (data.valid) {
            // Сохранить в sessionStorage
            sessionStorage.setItem('userId', data.user_id);
            sessionStorage.setItem('accessCodeId', data.access_code_id);
            sessionStorage.setItem('clientCode', code);
            sessionStorage.setItem('clientSince', data.client_since);

            // Перейти на дашборд
            window.location.href = 'dashboard.html';
        } else {
            showError(data.error || 'Код не найден');
        }

    } catch (err) {
        console.error('Ошибка проверки кода:', err);
        showError('Ошибка соединения с сервером');
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Автофокус на поле ввода
codeInput.focus();
