# EFDS2-Backend

После клонирования репозитория выполняется
`$ npm install`

Также необходим файл .env, содержащий:
* CONNECTION_STRING для подключения к БД
* PORT номер порта для запуска
* CRYPTO_ITERATIONS число итераций при шифровании пароля
* CRYPTO_KEYLEN длина зашифрованного пароля
* JWT_SECRET ключ для получения токена

Для запуска сервера выполняется
`$ npm run start`

Для запуска SWAGGER'а выполняется
 `$ npm run start`,
 затем в браузере открывается 
  `localhost:CONNECTION_PORT/swagger/index.html`
