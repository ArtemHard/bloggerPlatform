## Задача

Реализовать использование Mongoose в `src/domain/users/infrastructure/user.repository.ts` с DDD подходом, а так же остальных связанных слоёв напрмиер user.service

Точка входа для инициализации: `src/db/mongo.db.ts`

## Основные требования

1. **Схема Mongoose**: Создать на основе существующих интерфейсов
2. **Репозиторий**: Заменить текущую реализацию на операции через Mongoose
3. **CRUD операции**: Сохранение и изменение записей через Mongoose модели

## Примеры реализации

### Базовая схема и модель:

```typescript
const userSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  wallets: { type: [walletSchema], default: [] },
});

export const UserModel = model<User, UserModelType>('users-l4', userSchema);
```

### Репозиторий:

```typescript
export class UsersRepository {
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findOne({ _id: id });
  }

  async createUser(dto: CreateUserDto) {
    const user = new UserModel(dto);
    // бизнес-логика
    if (user.age > 18) {
      user.wallets = [
        { balance: 100, createdAt: new Date(), currency: Currency.BTC },
      ];
    }
    await user.save();
  }

  async save(user: UserDocument) {
    return user.save();
  }
}
```

### Сервис (application слой):

```typescript
export class UserService {
  constructor(private userRepository: UsersRepository) {}

  async createUser(dto: CreateUserDto) {
    const user = new UserModel(dto);
    // бизнес-логика
    await this.userRepository.save(user);
  }
}
```

### DDD с методами в схеме:

```typescript
const userMethods = {
  convertMoney(fromWalletId: string, toWalletId: string, amount: number) {
    // логика конвертации
  },
};

const userStatics = {
  createUser(dto: CreateUserDto) {
    // фабричный метод
  },
};

userSchema.methods = userMethods;
userSchema.statics = userStatics;
```

## Порядок выполнения

1. Создать Mongoose схемы на основе существующих интерфейсов
2. Реализовать репозиторий с базовыми CRUD операциями
3. Обновить сервисы для работы с новым репозиторием
4. Проверить типизацию и функциональность

## Проверка

После каждого этапа:

```bash
npm run watch
npm run dev
```

## Критерии готовности

- Типизация без ошибок
- Приложение запускается через `npm run dev`
- Соблюдаются правила из `src/__prompts__/common-rules.md`
