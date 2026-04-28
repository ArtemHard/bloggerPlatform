## Задача

Необходимо реализовать использование Mongoose в src/domain/users/infrastructure/user.repository.ts.

точка входа для инициализации mongoose src\db\mongo.db.ts

## Нужно:

определить Mongoose-схему для User на основе интерфейса из src/domain/users/types/user.db.interface.ts;

заменить существующую работу с user на корректные операции через Mongoose;

сохранять и изменять записи в базе данных через модель Mongoose.

## Пример реализации

ts
const userSchema = new mongoose.Schema<User>({
name: { type: String, required: true },
age: { type: Number, required: true },
wallets: { type: [walletSchema], default: [] },
});

export const UserModel = model<User, UserModelType>('users-l4', userSchema);

const user = new UserModel(dto);

user.wallets = [];

if (user.age > 18) {
user.wallets = [
{ balance: 100, createdAt: new Date(), currency: Currency.BTC },
];
}

await this.userRepository.save(user);

## Контекст

Учитывать правила из rules.md.
Общаться и писать ответы на русском языке.
Не переписывать реализации других ручек.

## Что нужно сделать

Реализовывать изменения поэтапно.
После каждого этапа проверять типизацию и запуск:
npm run watch
npm run dev
Исправлять все ошибки до успешного результата.

## Критерии готовности

Типизация без ошибок.
Приложение запускается через npm run dev.
Изменения соответствуют rules.md.

<!-- реализация DDD с доменной сущностью user -->
