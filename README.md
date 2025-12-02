```bash
░█▀▄░▀█▀░█▀▀░█▀█░█▀▀░█▀█░█▀▀░█▀▀
░█░█░░█░░▀▀█░█▀▀░█▀▀░█░█░▀▀█░█▀▀
░▀▀░░▀▀▀░▀▀▀░▀░░░▀▀▀░▀░▀░▀▀▀░▀▀▀
```
[![npm version](https://img.shields.io/npm/v/dispensecolor=%23047dec)](https://www.npmjs.org/package/dispense)

Простой HTTP-сервер на Node.js + Express для быстрого поднятия локального сервера.  
Основной кейс: есть папка `public` (или любая другая) — нужно быстро начать её раздавать.

CLI-команда: `dispense run`

## Install
```bash
# Глобально (удобно для быстрого использования везде)
npm install -g dispense

# Локально в проект (dev-зависимость)
npm install dispense
```

## Fast start
```bash
# Если установлен глобально
dispense run

# Если установлен локально
npx dispense run
```

## CLI options
```bash
dispense run [options]
 -a,   --api <path>         путь до файла с вашим кастомным роутером для api (дефолтный для Express синтаксис)
 -p,   --port <number>      порт (default 3000 или process.env.PORT)
 -d,   --public <path>      папка со статикой (default ./public)
 -nsh, --no-sec-headers     отключить security-заголовки
 -o,   --origins <list>     список origin для API CORS (separated by ,)
 -h,   --help               показать помощь
```

## Examples:
```bash
# По умолчанию
dispense run              # раздаёт ./public

# Другая папка
dispense run --public ./dist

# Порт 4000, статика из ./your-dir
dispense run --port 4000 --public ./your-dir

# Без security-заголовков
dispense run --no-sec-headers

# Явный список origin для /api
dispense run --allowed-origins http://localhost:3000,https://example.com

# Важно: путь считается от текущей директории, где вы запускаете команду
cd /path/to/project
dispense run --public ./build
```

### Custom API router

По умолчанию dispense использует встроенный роутер под `/api`.
Можно передать свой роутер (файл/папку), который экспортирует Express Router:

```js
// custom-api-router.js
import { Router } from 'express';

const router = Router({ mergeParams: true });

router.get('/ping', (req, res) => {
  res.json({ ok: true });
});

export default router;
```
Запуск с кастомным роутером:
```js
dispense run --api-router ./custom-api-router.js
```
Путь считается от текущей рабочей директории.

## Enviroment
```bash
# Если не указывать --port, берётся PORT или 3000
PORT=8080 dispense run

# Можно комбинировать с другими параметрами
PORT=5000 dispense run --public ./Public
```

## Start via PM2
```bash
# Установка (если ещё нет)
npm install -g pm2 dispense

# Запуск
pm2 start dispense --name dev-server -- run --port 3000 --public ./Public

# Управление
pm2 restart dispense
pm2 stop dispense
pm2 delete dispense
```

Корректно обрабатываются `SIGINT`, `SIGTERM` и `shutdown` от PM2 (`graceful shutdown`).

## Start from cloned repo
```bash
# После клонирования репо
npm install
npm start       # эквивалентно: node ./bin/run.js run
npx dispense    # при установке из репо - тоже работает


# Ручной запуск с параметрами
node ./bin/run.js run --port 4000 --public ./Public
```

## Files descriptions
 - `server.js` — создание и запуск Express-сервера (createServer, startServer).
 - `bin/run.js` — CLI-обвязка (команда server).
 - `public/*` — Раздача статики + роутер фронтенда
 - Базовый API под `/api`.
 - Примеры `middlewares` - примитивная проверка клиента и basicAuth (при установке из NPM недоступно)
 - `CORS` + security-заголовки (можно выключить).
 - Логирование ошибок и аккуратное завершение работы.

### License
MIT
