import { codeHighlighter } from './codeHighlighter';
import { TableParser } from './tableParser';

/**
 * @fileoverview Модули для обработки markdown текста
 */

/**
 * Утилитарный класс для экранирования HTML сущностей.
 */
class HtmlEscaper {
  static escape(text) {
    if (!text) return '';
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
  }
}

/**
 * Обрабатывает все инлайн-элементы Markdown (жирный, курсив, ссылки и т.д.).
 */
class InlineProcessor {
  constructor() {
    // Правила для блочных элементов, которые должны обрабатываться до общих правил
    this.blockRules = [
      {
        regex: /^###### (.*$)/gm,
        replace: '<div class="text-[1.125rem] font-bold mt-2 mb-2">$1</div>',
      },
      {
        regex: /^##### (.*$)/gm,
        replace: '<div class="text-[1.250rem] font-bold mt-2 mb-2">$1</div>',
      },
      {
        regex: /^#### (.*$)/gm,
        replace: '<div class="text-[1.375rem] font-bold mt-2 mb-2">$1</div>',
      },
      { regex: /^### (.*$)/gm, replace: '<div class="text-[1.5rem] font-bold mt-2 mb-2">$1</div>' },
      {
        regex: /^## (.*$)/gm,
        replace: '<div class="text-[1.625rem] font-bold mt-2 mb-2">$1</div>',
      },
      { regex: /^# (.*$)/gm, replace: '<div class="text-[1.750rem] font-bold mt-2 mb-2">$1</div>' },
    ];

    // Общие инлайн правила
    this.inlineRules = [
      { regex: /\*\*(.*?)\*\*/g, replace: '<strong>$1</strong>' }, // **Bold**
      { regex: /__(.*?)__/g, replace: '<strong>$1</strong>' }, // __Bold__
      { regex: /\*(.*?)\*/g, replace: '<em>$1</em>' }, // *Italic*
      { regex: /_(.*?)_/g, replace: '<em>$1</em>' }, // _Italic_
      { regex: /~~(.*?)~~/g, replace: '<del>$1</del>' }, // ~~Strikethrough~~
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/g,
        replace:
          '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline decoration-theme hover:text-theme-a">$1</a>',
      }, // Links
      { regex: /!\[([^\]]*)\]\(([^)]+)\)/g, replace: '<img src="$2" alt="$1">' }, // Images
    ];

    this.codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  }

  /**
   * Обрабатывает блоки кода (Code Blocks). Должно выполняться первым.
   * @param {string} markdown - Входящий текст.
   * @returns {string} Текст с обработанными блоками кода.
   */
  processCodeBlocks(markdown) {
    return markdown.replace(this.codeBlockRegex, (match, lang, code) => {
      // Используем внешний CodeHighlighter для подсветки синтаксиса
      const coloredCode = codeHighlighter.colorise(code);
      return `<pre class="border-b-2 border-t-2 border-border overflow-x-auto"><code class="language-${lang}">${coloredCode}</code></pre>`;
    });
  }

  /**
   * Применяет все правила инлайн-разметки.
   * @param {string} text - Текст после обработки блоков кода.
   * @returns {string} Текст с примененными inline-тегами.
   */
  processInlineRules(text) {
    let result = text;

    // 1. Обработка общих инлайн правил (Bold, Italic, Links и т.д.)
    for (const rule of this.inlineRules) {
      result = result.replace(rule.regex, rule.replace);
    }

    // 2. Обработка оставшихся блочных/структурных правил (Заголовки, HR, Блокквоты)
    for (const rule of this.blockRules) {
      result = result.replace(rule.regex, rule.replace);
    }

    // 3. Обработка оставшихся инлайн-символов:
    // Горизонтальные разделители (--- или ***)
    result = result.replace(/^---$/gm, '<hr>');
    result = result.replace(/^\*\*\*$/gm, '<hr>');

    // Блокквоты
    result = result.replace(
      /^> (.*$)/gm,
      '<blockquote class="p-2 bg-stripes-diagonal-transparent italic border-border border-t-2 border-b-2">$1</blockquote>'
    );

    // Экранирование inline кода (обратный проход для `...`)
    result = result.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

    return result;
  }
}

/**
 * Отвечает за обработку списков и параграфов.
 */
class StructureProcessor {
  constructor() {
    // Регулярное выражение для определения потенциального элемента списка
    this.ulRegex = /^[\*\-] (.*)$/;
    this.olRegex = /^\d+\. (.*)$/;
  }

  /**
   * Внутренняя логика для обработки маркированных списков.
   */
  handleUnorderedList(text) {
    const result = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      if (!this.ulRegex.test(lines[i])) {
        result.push(lines[i]);
        i++;
        continue;
      }

      result.push('<ul class="pl-2">');
      while (i < lines.length && this.ulRegex.test(lines[i])) {
        result.push(`<li>${lines[i].substring(2)}</li>`);
        i++;
      }
      result.push('</ul>');
    }

    return result.join('\n');
  }

  /**
   * Внутренняя логика для обработки нумерованных списков.
   */
  handleOrderedList(text) {
    const result = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      if (!this.olRegex.test(lines[i])) {
        result.push(lines[i]);
        i++;
        continue;
      }

      result.push('<ol class="pl-2">');
      let curNum = 1;
      while (i < lines.length && this.olRegex.test(lines[i])) {
        result.push(`<li>${curNum++}) ${lines[i].replace(this.olRegex, '').trim()}</li>`);
        i++;
      }
      result.push('</ol>');
    }

    return result.join('\n');
  }

  /**
   * Оборачивает параграфы, если они не содержат блочные элементы.
   * @param {string} text - Текст после обработки списков и блоков.
   * @returns {string} Текст с обернутыми параграфами.
   */
  processParagraphs(text) {
    const paragraphs = text.split('\n\n');
    return paragraphs
      .map((para) => {
        para = para.trim();
        if (!para) return '';

        // Проверка, содержит ли параграф уже блочные элементы (теги)
        const isBlockElement = /(<h|\/ul>|<ol>|<pre>|<blockquote|<hr|<table)/i.test(para);

        if (isBlockElement || para.startsWith('<')) {
          return para;
        }

        // Замена внутренних переносов строк на <br> внутри параграфа
        const processedPara = para.replace(/\n/g, '<br>');
        return `<p>${processedPara}</p>`;
      })
      .join('\n');
  }
}

/**
 * Основной класс-оркестратор для парсинга Markdown.
 */
class MarkdownParser {
  constructor() {
    // Инициализируем парсер таблиц, так как TableParser — это класс.
    this.tableParser = TableParser;
    this.inlineProcessor = new InlineProcessor();
    this.structureProcessor = new StructureProcessor();
  }

  /**
   * Главный метод парсинга, который выполняет последовательную обработку Markdown.
   * @param {string} markdown - Входящий текст в формате Markdown.
   * @returns {string} Готовый HTML-код.
   */
  parse(markdown) {
    if (!markdown) return '';

    const htmlWithCodeBlocks = this.inlineProcessor.processCodeBlocks(markdown);
    const htmlWithInlineRules = this.inlineProcessor.processInlineRules(htmlWithCodeBlocks);
    const htmlWithTables = this.tableParser.parse(htmlWithInlineRules);
    const htmlWithULists = this.structureProcessor.handleUnorderedList(htmlWithTables);
    const htmlWithOLists = this.structureProcessor.handleUnorderedList(htmlWithULists);
    const htmlWithParagraphs = this.structureProcessor.processParagraphs(htmlWithOLists);

    return htmlWithParagraphs.replace(/\n{2,}/g, '\n').trim();
  }
}

export const markdownParser = new MarkdownParser();
