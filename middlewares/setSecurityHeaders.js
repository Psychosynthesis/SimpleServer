export const setSecurityHeaders = (req, res, next) => {
  const isProd = typeof process.env.NODE_ENV === 'string' && !process.env.NODE_ENV.toLowerCase().includes('dev');

  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff', // Блокирует попытки браузера угадать MIME-тип, защищает от MIME-sniffing атак
    'X-Frame-Options': 'DENY', // Запрещает отображение страницы в <frame>, <iframe>, <embed> (защита от clickjacking)
    'X-XSS-Protection': '1; mode=block', // Включает XSS-фильтр браузера с блокировкой страницы при обнаружении
    'Access-Control-Allow-Methods': 'GET, POST', // Разрешенные HTTP-методы для CORS-запросов
    'Cross-Origin-Resource-Policy': 'same-site', // Контролирует могут ли другие сайты загружать ваши ресурсы (изображения, скрипты), same-site значит что не могут
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups', // Изолирует окно от окон других доменов, но разрешает popup'ы
    'Cross-Origin-Embedder-Policy': isProd ? 'require-corp' : 'unsafe-none', // Требует явного разрешения для встраивания ресурсов с других доменов
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()', // Доступ к API устройства нам не нужен
    'Referrer-Policy': 'no-referrer', // Контролирует передачу Referer заголовка (отключаем передачу инфы об источнике перехода)

    // Политика безопасности контента - более строгая в production
    'Content-Security-Policy': isProd
      ? "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'"
      : "default-src *; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'",
  };

  // Устанавливаем заголовки, фильтруя пустые значения
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      res.set(key, value);
    }
  });

  next();
};

/*
Подробнее о Content-Security-Policy:
PROD версия:
 — default-src 'self' - загружать ресурсы только с того же домена
 — style-src 'self' 'unsafe-inline' - стили только с того же домена + inline стили
 — script-src 'self' - скрипты только с того же домена

DEV версия:
 — default-src * 'unsafe-inline' 'unsafe-eval' - разрешены все источники, inline и eval
 — style-src * 'unsafe-inline' - стили с любых источников + inline
 — script-src * 'unsafe-inline' 'unsafe-eval' - скрипты с любых источников + inline + eval
*/

export const stricktHTTPSHeaders = (req, res, next) => {
  const isProd = typeof process.env.NODE_ENV === 'string' && !process.env.NODE_ENV.toLowerCase().includes('dev');

  isProd && res.set({
    'Strict-Transport-Security': isProd ? 'max-age=31536000; includeSubDomains' : '', // В production принудительное используем HTTPS
    'Expect-CT': isProd ? 'enforce, max-age=86400' : '', // Требует наличие Certificate Transparency логов для сертификатов
  });

  next();
};
