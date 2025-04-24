# ERP.AERO REST API (TypeScript)

## 🚀 Описание

**ERP.AERO** — REST API-сервис для хранения и управления файлами с JWT авторизацией и поддержкой refresh-токенов. Реализован на **Node.js (Express)** с использованием **TypeScript** и **MySQL**. Поддерживает работу с несколькими устройствами одновременно.

---

## ⚙️ Быстрый старт

### 1. 📦 Запуск MySQL через Docker

```bash
docker run --name erp-aero-mysql \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=erp_aero \
  -p 3306:3306 -d mysql:8.0
```

### 2. 🛠 Инициализация базы данных

```bash
docker cp ./init_db.sql erp-aero-mysql:/init_db.sql

docker exec -i erp-aero-mysql mysql -uroot -pyourpassword erp_aero --execute="source /init_db.sql;"
```

### 3. 🧪 Настройка окружения

Создайте файл `.env` по примеру:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=erp_aero
token_secret=your_jwt_secret
refresh_token_secret=your_refresh_secret
```

### 4. 🚀 Установка зависимостей и запуск

```bash
npm install
npm run build         # npm tsc
npm start             # node dist/index.js
```

---

## 🧭 Основные эндпоинты

### 🔐 Аутентификация

| Метод | URL                   | Описание                                 |
| ----- | --------------------- | ---------------------------------------- |
| POST  | /api/signup           | Регистрация (id/email, password)         |
| POST  | /api/signin           | Вход                                     |
| POST  | /api/signin/new_token | Обновление access_token по refresh_token |
| GET   | /api/logout           | Выход (x-refresh-token в заголовке)      |
| GET   | /api/info             | Получение id текущего пользователя       |

### 📁 Работа с файлами (требуется access_token)

| Метод  | URL                    | Описание                                          |
| ------ | ---------------------- | ------------------------------------------------- |
| POST   | /api/file/upload       | Загрузка файла (multipart/form-data, поле `file`) |
| GET    | /api/file/list         | Получение списка файлов (list_size, page)         |
| GET    | /api/file/:id          | Информация о конкретном файле                     |
| GET    | /api/file/download/:id | Скачивание файла                                  |
| DELETE | /api/file/delete/:id   | Удаление файла                                    |
| PUT    | /api/file/update/:id   | Замена файла (multipart/form-data, поле `file`)   |

---

## 🧪 Примеры запросов (PowerShell)

### Загрузка файла

```powershell
curl.exe -X POST "http://localhost:3000/api/file/upload" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@C:\путь\к\файлу.txt"
```

---

## 📌 Особенности

- ✅ Написано на TypeScript
- ✅ CORS открыт для всех доменов
- ✅ Refresh токены работают независимо по устройствам
- ✅ После выхода токен деактивируется, остальные сессии продолжают работать

---
