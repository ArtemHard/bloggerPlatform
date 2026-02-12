export function generateUniqueID<T extends { id: string }>(
  collection: T[],
  maxAttempts = 10
): string {
  const generate = (attempts: number): string => {
    const id = crypto.randomUUID();
    // Проверяем, что ни один объект в массиве не имеет такого id
    const exists = collection.some(item => item.id === id);

    if (!exists) {
      return id;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Не удалось сгенерировать уникальный ID за указанное количество попыток.');
    }

    return generate(attempts + 1);
  };

  return generate(0);
}
