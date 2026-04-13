/**
 * @fileoverview Репозиторий для взаимодействия с внешними LLM API.
 *
 * Назначение: Управляет логикой подключения к различным провайдерам LLM (OpenRouter, LM Studio).
 */

// =============================================================================
// 1. Утилиты: Парсинг потока данных SSE (Single Responsibility)
// =============================================================================

/**
 * Класс для парсинга потоковых ответов в формате Server-Sent Events (SSE).
 */
class StreamParser {
  constructor(body) {
    this.reader = body.getReader();
    this.decoder = new TextDecoder('utf-8');
    this.buffer = '';
  }

  /**
   * Асинхронно читает и парсит поток данных SSE, генерируя чанки контента.
   * @returns {AsyncGenerator<{content: string, reasoning_details?: any}>} Генератор чанков.
   */
  async *parseStream() {
    try {
      while (true) {
        const { done, value } = await this.reader.read();
        if (done) break;

        this.buffer += this.decoder.decode(value, { stream: true });
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.error) throw new Error(json.error.message);

              const delta = json.choices?.[0]?.delta;
              if (delta) {
                const chunk = {};
                if (delta.content !== undefined && delta.content !== null) {
                  chunk.content = delta.content;
                }
                // Обработка различных полей для reasoning
                const reasoning = delta.reasoning_details ?? delta.reasoning_content;
                if (reasoning !== undefined && reasoning !== null) {
                  chunk.reasoning_details = reasoning;
                }
                if (Object.keys(chunk).length > 0) {
                  yield chunk;
                }
              }
            } catch (e) {
              console.warn('Ошибка парсинга SSE:', e, 'Line:', trimmed);
            }
          }
        }
      }
    } finally {
      try {
        await this.reader.cancel();
      } catch (e) {}
    }
  }
}

// =============================================================================
// 2. Стратегии: Конкретные провайдеры LLM (Open/Closed Principle)
// =============================================================================

/**
 * Абстрактный базовый класс для всех LLM-провайдеров.
 * Определяет общий контракт для отправки запроса и получения потока данных.
 */
class BaseLlmProvider {
  constructor(config) {
    if (!config || !config.url || !config.model) {
      throw new Error('Конфигурация провайдера неполная.');
    }
    this.config = config;
  }

  /**
   * Выполняет асинхронный запрос к API и возвращает объект Response.
   * @param {Array<Object>} messages - История сообщений.
   * @returns {Promise<Response>} Объект ответа Fetch API.
   */
  async sendRequest(messages) {
    throw new Error('Метод sendRequest должен быть реализован в дочернем классе.');
  }

  /**
   * Получает потоковый ответ и парсит его с помощью StreamParser.
   * @param {Response} response - Сырой объект ответа.
   * @returns {AsyncGenerator<{content: string, reasoning_details?: any}>} Генератор чанков.
   */
  async getStream(response) {
    const parser = new StreamParser(response.body);
    return parser.parseStream();
  }
}

/**
 * Реализация для OpenRouter API.
 */
class OpenRouterProvider extends BaseLlmProvider {
  constructor(config) {
    super(config);
    if (typeof config.apiKey !== 'string') throw new Error('OpenRouter требует apiKey.');
  }

  async sendRequest(messages) {
    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        stream: true,
      }),
      signal: AbortController.signal, // Используем глобальный сигнал для отмены
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errData = await response.json();
        errorMsg = errData.error?.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return response;
  }
}

/**
 * Реализация для LM Studio / OpenAI-совместимых API.
 */
class LmStudioProvider extends BaseLlmProvider {
  async sendRequest(messages) {
    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        stream: true,
      }),
      signal: AbortController.signal, // Используем глобальный сигнал для отмены
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errData = await response.json();
        errorMsg = errData.error?.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return response;
  }
}

// =============================================================================
// 3. Репозиторий: Координатор запросов (Facade/Repository)
// =============================================================================

/**
 * Класс-фасад, координирующий взаимодействие с LLM провайдерами.
 * Отвечает за общую логику обработки ошибок и таймаутов.
 */
class LlmRepository {
  constructor() {}

  /**
   * Выбирает нужный провайдер и выполняет потоковый запрос.
   * @param {Object} config - Конфигурация (type, url, model, apiKey).
   * @param {Array<Object>} messages - История сообщений.
   * @returns {AsyncGenerator<{content: string, reasoning_details?: any}>} Генератор чанков.
   */
  async sendStreamingRequest(config, messages) {
    const controller = new AbortController();
    // Устанавливаем таймаут на 120 секунд (было 120000 мс)
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let provider;
    try {
      // Фабричный метод выбора провайдера
      if (config.type === 'openrouter') {
        provider = new OpenRouterProvider(config);
      } else if (config.type === 'lmstudio' || config.type === 'openai') {
        provider = new LmStudioProvider(config);
      } else {
        throw new Error(`Неподдерживаемый тип провайдера: ${config.type}`);
      }

      // Выполнение запроса через выбранную стратегию
      const response = await provider.sendRequest(messages);
      const streamGenerator = await provider.getStream(response);
      return streamGenerator;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Превышено время ожидания ответа (2 минуты)');
      }
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Ошибка сети. Проверьте подключение.');
      }
      // Перебрасываем ошибку, если она не связана с сетью/таймаутом
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const llmRepository = new LlmRepository();
