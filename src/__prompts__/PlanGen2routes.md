Задача: реализовать auth endpoints /password-recovery и /new-password.

Контекст:

- Роут расположен в src/auth/api/auth.router.ts.
- Пример функций для отправки письма уже лежат в src/auth/adapters/nodemailer.service.ts и src/auth/adapters/emailExamples.ts при необходимости добавь нужные функции и используй их.
- требованиям ручек в src/**prompts**/api.json.
- Реализовать восстановление пароля через email с кодом.
- Реализовать подтверждение восстановления пароля через код из ссылки в письме.
- В письме обязательно должна быть HTML-ссылка <a>, ведущая на /password-recovery?recoveryCode=...
- Учитывать правила из rules.md.
- Общаться и писать ответы на русском языке.
- не переписывай реализации других ручек

Что нужно сделать:

1. Изучить rules.md, текущий auth.router.ts, nodemailer.service.ts, emailExamples.ts и структуру api.json.
2. Спроектировать и добавить endpoints:
   - POST /password-recovery — отправка письма с recovery code на email.
   - POST /new-password — подтверждение нового пароля по recoveryCode.
3. Использовать существующие функции отправки письма из adapters, не дублировать логику.
4. Добавить/обновить описание ручек в src/**prompts**/api.json.
5. Сформировать письмо с recovery-ссылкой вида:
   <a href='https://somesite.com/password-recovery?recoveryCode=your_recovery_code'>recovery password</a>
6. Реализовывать поэтапно.
7. После каждого этапа проверять типизацию и запуск:
   - npm run watch
   - npm run dev
8. Исправлять все ошибки до успешного результата.

Критерии готовности:

- Оба endpoint’а работают.
- Типизация без ошибок.
- Приложение запускается через npm run dev.
- Изменения соответствуют rules.md.
- Логика отправки письма используется через nodemailer.service.ts и emailExamples.ts.
