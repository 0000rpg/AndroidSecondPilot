/**
 * @fileoverview Модуль для подсветки синтаксиса кода в Markdown.
 * Отвечает только за преобразование чистого текста кода в HTML с применением CSS классов.
 */

class CodeHighlighter {
  constructor() {
    // Регулярные выражения и правила для подсветки синтаксиса
    this.colorRules = [
      {
        regex: /([\-|+*^%@=\\]+)/g,
        replace: '<span class="text-pink-300">$1</span>',
      },
      { regex: /(\{+|\}+)/g, replace: '<span class="text-red-400">$1</span>' },
      { regex: /(\(+|\)+)/g, replace: '<span class="text-amber-400">$1</span>' },
      { regex: /(\[+|\]+)/g, replace: '<span class="text-purple-400">$1</span>' },
      {
        regex: /(&quot;|&amp;|\|+|&lt;|&gt;+)/g,
        replace: '<span class="text-lime-300">$1</span>',
      },
      {
        regex: /([\':!]|&#39;+)/g,
        replace: '<span class="text-blue-300">$1</span>',
      },
      {
        // Захватывает последовательности символов, не являющиеся HTML-сущностями.
        regex: /(?<!&(?:lt|gt|amp|quot|apos|#\d+|#x[0-9A-Fa-f]+));/g,
        replace: '<span class="text-cyan-300">$&</span>',
      },
      {
        // Захватывает разделители и символы пунктуации.
        regex: /([\,\.]+|# +|\n#+)/g,
        replace: '<span class="text-cyan-300">$1</span>',
      },
    ];
  }

  /**
   * Экранирует HTML сущности в строке текста.
   * @param {string} text - Текст для экранирования.
   * @returns {string} Экранированный текст.
   */
  escapeHtml(text) {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
  }

  /**
   * Применяет подсветку синтаксиса к чистому коду.
   * @param {string} code - Чистый код без Markdown-разметки.
   * @returns {string} HTML с применением классов подсветки.
   */
  colorise(code) {
    let text = this.escapeHtml(code);

    for (const rule of this.colorRules) {
      text = text.replace(rule.regex, rule.replace);
    }

    return text;
  }

  /**
   * Обрабатывает блоки кода Markdown (```lang\n...\n```).
   * @param {string} markdown - Входящий текст с потенциальными блоками кода.
   * @returns {string} Текст с обработанными блоками кода.
   */
  processCodeBlocks(markdown) {
    // Регулярное выражение для захвата блоков: ```lang\n([\s\S]*?)```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

    return markdown.replace(codeBlockRegex, (match, lang, code) => {
      // 1. Подсвечиваем синтаксис
      const coloredCode = this.colorise(code);
      // 2. Оборачиваем в <pre> и <code> с соответствующими классами
      return `<pre class="border-b-2 border-t-2 border-border overflow-x-auto"><code class="language-${lang}">${coloredCode}</code></pre>`;
    });
  }
}

export const codeHighlighter = new CodeHighlighter();
