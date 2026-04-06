# Тихий Тыл — Приложение психологической поддержки

> Инструмент для ветеранов и психологов, работающих с ПТСР

**Сайт:** https://тихийтыл.рф  
**Статус:** MVP Development

---

## Что это

Тихий Тыл — приложение для психологической поддержки ветеранов боевых действий. Три направления: голосовой дневник, библиотека техник самопомощи, связь с психологом.

**Ключевые ограничения:**
- Нет AI-диалогу (цензура российских LLM + юридические риски)
- Нет автоанализу без психолога
- Психолог остаётся в контуре — не замена терапии

---

## Установка

```bash
# Клонировать
git clone https://github.com/shubinivan2023-rgb/tihiytyl-app.git
cd tihiytyl-app

# Создать виртуальное окружение
cd backend
python3 -m venv venv

# Активировать venv и установить зависимости
source venv/bin/activate
pip install -r requirements.txt
```

## Запуск

```bash
cd backend
source venv/bin/activate
python app.py
```

Открыть в браузере: `http://localhost:5002`

Сервер запускается на порту **5002**, раздаёт и API и фронтенд.  
БД (`database.db`) создаётся автоматически при первом запуске.

### Остановка

`Ctrl+C` в терминале.

Если порт занят (сервер завис в фоне):

```bash
lsof -ti:5002 | xargs kill -9
```

### Сброс базы данных

Пересоздать БД с нуля (новые таблицы, актуальные seed-данные):

```bash
rm backend/database.db
cd backend && source venv/bin/activate && python app.py
```

### Установка новых Python-пакетов

```bash
cd backend
source venv/bin/activate
pip install <пакет>
pip freeze > requirements.txt
```

Глобальная установка пакетов **запрещена** — только через venv.

---

## Структура проекта

```
tihiytyl-app/
├── landing/                 # Промо-сайт (тихийтыл.рф)
│   └── index.html
├── backend/                 # Flask API (порт 5002)
│   ├── app.py              # Сервер + все эндпоинты
│   ├── models.py           # Схема БД + seed данные
│   ├── diary.py            # Логика дневника
│   ├── techniques.py       # Логика техник
│   ├── profile.py          # Профиль + код-позывной + статистика
│   ├── recommendations.py  # Персонализированные рекомендации
│   ├── psychologist.py     # Дашборд психолога
│   ├── homework.py         # Домашние задания
│   ├── requirements.txt    # Зависимости Python
│   └── audio/techniques/   # Аудио-файлы техник (не в git)
├── frontend/client/         # Интерфейс клиента
│   ├── index.html          # Главная (5 карточек)
│   ├── diary.html          # Дневник настроения
│   ├── entries.html        # Список записей
│   ├── techniques.html     # Библиотека техник
│   ├── technique-player.html # Плеер техники
│   ├── profile.html        # Профиль клиента
│   ├── homework.html       # Домашние задания
│   └── assets/css+js/      # Стили и скрипты
├── frontend/psychologist/   # Дашборд психолога
│   ├── index.html          # Вход по коду-позывному
│   ├── dashboard.html      # Дашборд (статистика + график)
│   └── assets/css+js/      # Стили и скрипты
├── CLAUDE.md               # Инструкции для Claude
├── MODULE_*.md             # ТЗ по модулям
└── VENV_INSTRUCTIONS.md    # Инструкция по venv
```

---

## Модули

- [x] **Модуль 0:** Лендинг — `/landing/index.html`
- [x] **Модуль 1:** Дневник настроения — `/diary.html`
- [x] **Модуль 2:** Библиотека техник — `/techniques.html`
- [x] **Модуль 3:** Профиль клиента — `/profile.html`
- [x] **Модуль 4:** Дашборд для психолога — `/psychologist/`
- [x] **Модуль 5:** Домашние задания — `/homework.html`

### Быстрые ссылки (localhost:5002)

| Страница | Ссылка |
|----------|--------|
| Лендинг | открыть `landing/index.html` в браузере |
| Главная (клиент) | http://localhost:5002/ |
| Дневник | http://localhost:5002/diary.html |
| Мои записи | http://localhost:5002/entries.html |
| Техники | http://localhost:5002/techniques.html |
| Домашние задания | http://localhost:5002/homework.html |
| Профиль | http://localhost:5002/profile.html |
| Дашборд психолога | http://localhost:5002/psychologist/ |

---

## Стек

- **Backend:** Flask 3.0, SQLite, Whisper base (STT)
- **Frontend:** Vanilla JS, Montserrat, тёмная тема
- **Шкала боли:** медицинский стандарт (1 = нет боли, 10 = невыносимая)

---

## Ссылки

- **Промо-сайт:** https://тихийтыл.рф
- **Research:** https://github.com/shubinivan2023-rgb/tihiytyl-research

---

MIT License
