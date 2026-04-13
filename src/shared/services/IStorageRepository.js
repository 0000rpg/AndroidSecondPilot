/**
 * @typedef {Object} IStorageRepository
 * @property {(key: string, value: any) => boolean} setItem - Сохранить значение.
 * @property {(key: string, defaultValue?: any) => any} getItem - Получить значение.
 * @property {(key: string) => boolean} removeItem - Удалить ключ.
 * @property {() => boolean} clear - Очистить всё хранилище.
 * @property {(key: string) => boolean} has - Проверить наличие ключа.
 */

/**
 * @fileoverview Интерфейс для репозитория локального хранилища.
 * Используется для обеспечения контракта при внедрении зависимостей (DIP).
 */
export class IStorageRepository {
  // Здесь могут быть абстрактные методы, но в JS достаточно документации и соглашения.
}
