# API для работы с ботами

- Файл `bots.js` — серверная логика для работы с таблицей Supabase `bots`.
- Используйте переменные окружения `SUPABASE_URL` и `SUPABASE_KEY` для подключения.
- Деплойте вместе с фронтендом на Vercel.

## Эндпоинты
- `GET /api/bots` — получить всех ботов
- `POST /api/bots` — добавить/обновить список ботов (body: `{ bots: ["bot1", "bot2"] }`)
- `PUT /api/bots` — обновить статус бота (body: `{ name, status, loaded_by }`)
