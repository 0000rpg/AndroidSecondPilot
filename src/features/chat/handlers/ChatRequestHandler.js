/**
 * @fileoverview Базовый обработчик цепочки обязанностей для запросов чата.
 */
export class ChatRequestHandler {
  #next = null;

  /**
   * Устанавливает следующего обработчика цепочки.
   * @param {ChatRequestHandler} handler
   * @returns {ChatRequestHandler}
   */
  setNext(handler) {
    this.#next = handler;
    return handler;
  }

  /**
   * Передаёт запрос следующему обработчику.
   * @param {Object} request
   * @returns {Promise<Object>}
   */
  async passToNext(request) {
    if (this.#next) {
      return this.#next.handle(request);
    }
    return request;
  }

  /**
   * Обрабатывает запрос. По умолчанию передаёт его дальше.
   * @param {Object} request
   * @returns {Promise<Object>}
   */
  async handle(request) {
    return this.passToNext(request);
  }
}
