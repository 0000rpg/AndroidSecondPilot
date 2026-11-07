/**
 * @fileoverview Абстрактная фабрика семейства объектов провайдера LLM.
 */
export class LlmProviderFactory {
  /**
   * Создаёт построитель конфигурации.
   * @returns {LlmConfigBuilder}
   */
  createConfigBuilder() {
    throw new Error('Метод createConfigBuilder должен быть реализован.');
  }

  /**
   * Создаёт клиент провайдера.
   * @param {Object} config
   * @returns {BaseLlmProvider}
   */
  createProvider(config) {
    throw new Error('Метод createProvider должен быть реализован.');
  }
}
