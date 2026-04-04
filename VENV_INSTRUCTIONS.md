# 🐍 Инструкции по работе с venv для проекта ТихийТыл

## Для Claude Code: ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ

**ПРАКТИЧЕСКОЕ ТРЕБОВАНИЕ:** Весь Python код в проекте должен использовать виртуальное окружение (venv).

---

## 🎯 Почему venv обязателен

1. **Изоляция зависимостей:** Whisper, Flask и другие пакеты не должны устанавливаться глобально
2. **Конфликты версий:** Другие проекты могут требовать другие версии пакетов
3. **Чистота системы:** Не засоряем системный Python
4. **Воспроизводимость:** Легко развернуть на другой машине или сервере
5. **Безопасность:** Если что-то сломается — только внутри venv

---

## 📁 Структура проекта с venv

```
tihiytyl-app/
├── backend/
│   ├── venv/                ← Виртуальное окружение (НЕ коммитись!)
│   │   ├── bin/python       # Изолированный Python
│   │   ├── bin/pip          # Изолированный pip
│   │   └── lib/             # Пакеты проекта
│   ├── app.py
│   ├── requirements.txt
│   └── .gitignore           ← Должен содержать: venv/
└── ...
```

---

## 🔧 Команды для создания и настройки

### **1. Создание venv (ОДИН РАЗ)**

```bash
cd ~/Developer/tihiytyl-app/backend

# Создать venv
python3 -m venv venv

# Результат: появится папка venv/
```

---

### **2. Активация venv (КАЖДЫЙ РАЗ при работе)**

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

**Проверка активации:**
```bash
# В терминале должен появиться префикс:
(venv) user@computer:~/Developer/tihiytyl-app/backend$
       ^^^^^
       ← это означает что venv активирован!
```

**Проверка путей:**
```bash
# Убедись что используется Python из venv
which python
# Должно быть: ~/Developer/tihiytyl-app/backend/venv/bin/python

which pip
# Должно быть: ~/Developer/tihiytyl-app/backend/venv/bin/pip
```

---

### **3. Установка зависимостей (в venv!)**

```bash
# ВАЖНО: venv должен быть активирован!
# Проверь префикс (venv) в терминале

pip install -r requirements.txt

# Whisper скачает модель при первом запуске (может занять 5-10 минут)
```

---

### **4. Запуск приложения**

```bash
# ВАЖНО: venv активирован!
python app.py

# Ожидаемый вывод:
# * Running on http://0.0.0.0:5003
# * Debugger is active!
```

---

### **5. Деактивация venv (когда закончил)**

```bash
deactivate

# Префикс (venv) исчезнет
```

---

## ⚠️ ЧТО ДЕЛАТЬ ЕСЛИ...

### **Забыл активировать venv**

**Симптом:**
```bash
# Нет префикса (venv)
user@computer:~/Developer/tihiytyl-app/backend$

# pip install устанавливает глобально
pip install flask
# Ошибка или установка в систему!
```

**Решение:**
```bash
# 1. Активируй venv
source venv/bin/activate

# 2. Теперь устанавливай
pip install -r requirements.txt
```

---

### **venv не создаётся**

**Ошибка:**
```
The virtual environment was not created successfully
```

**Решение:**
```bash
# Установи python3-venv
# macOS (через Homebrew):
brew install python3

# Ubuntu/Debian:
sudo apt-get install python3-venv

# Попробуй снова
python3 -m venv venv
```

---

### **ModuleNotFoundError при запуске**

**Ошибка:**
```python
ModuleNotFoundError: No module named 'flask'
```

**Причина:** venv не активирован или пакеты не установлены

**Решение:**
```bash
# 1. Активируй venv
source venv/bin/activate

# 2. Проверь что активирован
which python
# Должно быть в venv/bin/python

# 3. Установи пакеты
pip install -r requirements.txt
```

---

### **Permission denied**

**Ошибка:**
```
Permission denied: '/usr/local/lib/python3.11/site-packages'
```

**Причина:** Пытаешься установить глобально без venv

**Решение:**
```bash
# НЕ используй sudo!
# Вместо этого активируй venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🔄 Workflow на каждый день

```bash
# 1. Открыл терминал
cd ~/Developer/tihiytyl-app/backend

# 2. Активировал venv
source venv/bin/activate

# 3. Работаешь
python app.py
# или
pip install new-package

# 4. Закончил работу
deactivate  # опционально
```

---

## 📦 Добавление новых пакетов

```bash
# 1. Активируй venv
source venv/bin/activate

# 2. Установи пакет
pip install новый-пакет

# 3. Обнови requirements.txt
pip freeze > requirements.txt

# 4. Закоммить requirements.txt
git add requirements.txt
git commit -m "feat: добавить новый-пакет"
```

---

## 🌐 Деплой на сервер (будущее)

```bash
# На сервере тоже используем venv!

# 1. Клонируем репо
git clone https://github.com/user/tihiytyl-app.git
cd tihiytyl-app/backend

# 2. Создаём venv
python3 -m venv venv

# 3. Активируем
source venv/bin/activate

# 4. Устанавливаем
pip install -r requirements.txt

# 5. Запускаем
python app.py
```

---

## ✅ Чек-лист для Claude Code

Перед написанием кода или инструкций, убедись:

- [ ] В инструкции указано: "Создай venv"
- [ ] В инструкции указано: "Активируй venv перед установкой"
- [ ] requirements.txt создан
- [ ] .gitignore содержит venv/
- [ ] В README.md есть инструкции по venv
- [ ] Все команды pip выполняются ПОСЛЕ активации venv

---

## 🎯 Шаблон README для backend/

```markdown
# Backend

## Установка

1. Создай виртуальное окружение:
   ```bash
   python3 -m venv venv
   ```

2. Активируй venv:
   ```bash
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows
   ```

3. Установи зависимости:
   ```bash
   pip install -r requirements.txt
   ```

## Запуск

```bash
# Активируй venv
source venv/bin/activate

# Запусти сервер
python app.py
```

## Разработка

Всегда активируй venv перед работой!
```

---

## 🚨 ПРАКТИЧЕСКИЕ ОШИБКИ

**НЕ ДЕЛАЙ:**

❌ `pip install flask` без venv  
❌ `sudo pip install ...` (НИКОГДА!)  
❌ Коммитить папку `venv/` в Git  
❌ Использовать глобальный Python для проекта  

**ДЕЛАЙ:**

✅ `source venv/bin/activate` ПЕРЕД любой работой  
✅ `pip install` только ПОСЛЕ активации venv  
✅ Добавь `venv/` в `.gitignore`  
✅ Используй `requirements.txt` для зависимостей  

---

## 💡 Итого

**venv — это не опция, это обязательное требование для проекта ТихийТыл!**

Причины:
1. Whisper — тяжёлая библиотека
2. Много зависимостей (Flask, SQLite, и др.)
3. Планируется деплой на сервер
4. Профессиональный подход к разработке

**Каждая инструкция должна начинаться с активации venv!**
