/**
 * @fileoverview Index file для экспорта сервисов.
 */
import { StorageRepositoryFactory } from './storageRepository';
import { nativeFacade } from './nativeFacade';
// В будущем сюда можно добавить другие сервисы (если всё-таки будут)

/**
 * Экспонирует фабрику для получения экземпляра репозитория.
 * Потребителям следует использовать StorageRepositoryFactory.getAdapter() напрямую.
 */
export { StorageRepositoryFactory };
// Для совместимости с существующими импортами, экспортируем готовый экземпляр.
export const storageRepository = StorageRepositoryFactory.getAdapter();
export { nativeFacade };
