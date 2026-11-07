/**
 * @fileoverview Абстрактный построитель конфигурации провайдера LLM.
 */
export class LlmConfigBuilder {
  /**
   * Формирует конфигурацию для репозитория LLM.
   * @param {Object} rawConfig
   * @returns {Object}
   */
  build(rawConfig) {
    throw new Error('Метод build должен быть реализован в конкретном построителе.');
  }
}
