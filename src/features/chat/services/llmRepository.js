class LlmRepository {
  /**
   * Отправляет потоковый запрос к LLM
   * @param {Object} config - конфигурация провайдера
   * @param {Array} messages - массив сообщений {role, content}
   * @returns {Promise<AsyncIterable>} - асинхронный итератор чанков
   */
  async sendStreamingRequest(config, messages) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let response;
    try {
      if (config.type === 'openrouter') {
        response = await fetch(config.url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages: messages,
            stream: true,
          }),
          signal: controller.signal,
        });
      } else {
        // LM Studio (совместим с OpenAI)
        response = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.model,
            messages: messages,
            stream: true,
          }),
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error?.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      return this._parseStream(response.body);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Превышено время ожидания ответа (2 минуты)');
      }
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Ошибка сети. Проверьте подключение.');
      }
      throw err;
    }
  }

  async *_parseStream(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

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
                if (delta.reasoning_details !== undefined && delta.reasoning_details !== null) {
                  chunk.reasoning_details = delta.reasoning_details;
                }
                // Отдаём чанк только если есть полезные данные, иначе null был
                if (Object.keys(chunk).length > 0) {
                  // console.log('Chunk from LLM:', chunk);
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
        await reader.cancel();
      } catch (e) {}
    }
  }
}

export const llmRepository = new LlmRepository();
