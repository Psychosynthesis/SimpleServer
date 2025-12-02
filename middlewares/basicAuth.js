import { CREDS } from '../shared/index.js';

export const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Проверка наличия заголовка
    if (!authHeader) {
        return sendUnauthorized(res, next);
    }

    // Проверка формата заголовка
    const [authType, credentials] = authHeader.split(' ');
    if (authType !== 'Basic' || !credentials) {
        return sendUnauthorized(res, next);
    }

    try {
        // Декодирование и проверка учетных данных
        const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
        const [user, pass] = decoded.split(':');

        // Проверка наличия обеих частей
        if (!user || !pass) {
            return sendUnauthorized(res, next);
        }

        // Проверка учетных данных
        if (user === CREDS.username && pass === CREDS.pass) {
            return next();
        }

        return sendUnauthorized(res, next);
    } catch (error) {
        // Специальная обработка ошибок декодирования
        const err = new Error('Invalid authentication format');
        err.status = 400;
        return next(err);
    }
};

// Вспомогательная функция для отправки ошибки 401
const sendUnauthorized = (res, next) => {
    // Если заголовки уже отправлены - передаем ошибку дальше
    if (res.headersSent) {
        const err = new Error('Authentication required');
        err.status = 401;
        return next(err);
    }

    // Устанавливаем заголовки и отправляем ошибку
    res.setHeader('WWW-Authenticate', 'Basic');
    const err = new Error('You are not authenticated');
    err.status = 401;
    return next(err);
}
