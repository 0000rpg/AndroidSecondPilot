import { TableParser } from './tableParser';

class MarkdownParser {
  constructor() {
    this.tableParser = TableParser;
    this.rules = [
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
      { regex: /\*\*(.*?)\*\*/g, replace: '<strong>$1</strong>' },
      { regex: /__(.*?)__/g, replace: '<strong>$1</strong>' },
      { regex: /\*(.*?)\*/g, replace: '<em>$1</em>' },
      { regex: /_(.*?)_/g, replace: '<em>$1</em>' },
      { regex: /~~(.*?)~~/g, replace: '<del>$1</del>' },
      { regex: /`(.*?)`/g, replace: '<code>$1</code>' },
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/g,
        replace:
          '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline decoration-theme hover:text-theme-a">$1</a>',
      },
      { regex: /!\[([^\]]*)\]\(([^)]+)\)/g, replace: '<img src="$2" alt="$1">' },
      { regex: /^---$/gm, replace: '<hr>' },
      { regex: /^\*\*\*$/gm, replace: '<hr>' },
      {
        regex: /^> (.*$)/gm,
        replace:
          '<blockquote class="p-2 bg-stripes-diagonal-transparent italic border-border border-t-2 border-b-2">$1</blockquote>',
      },
    ];
  }

  parseInlineCode(text) {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    return text.replace(codeBlockRegex, (match, lang, code) => {
      return this.codeColorise(
        `<pre class="border-b-2 border-t-2 border-border overflow-x-auto"><code class="language-${lang}">${this.escapeHtml(code.trim())}</code></pre>`
      );
    });
  }

  codeColorise(text) {
    const startRegex = /<pre[^>]*><code[^>]*>/;
    const startBlock = text.match(startRegex)[0];
    text = text.replace(startBlock, '732826startBlock2837028');

    const colorRulesRegex = [
      {
        regex: /([\-|+*^%@=\\]+)/g,
        replace: '<span class="text-pink-300">$1</span>',
      },
      { regex: /(\{+|\}+)/g, replace: '<span class="text-red-400">$1</span>' },
      { regex: /(\(+|\)+)/g, replace: '<span class="text-amber-400">$1</span>' },
      { regex: /(\[+|\]+)/g, replace: '<span class="text-purple-400">$1</span>' },
      {
        regex: /(\&quot;+|&amp;+|\|+|&lt;+|&gt;+)/g,
        replace: '<span class="text-lime-300">$1</span>',
      },
      {
        regex: /([\':!]|&#39;+)/g,
        replace: '<span class="text-blue-300">$1</span>',
      },
      {
        regex: /(?<!&(?:lt|gt|amp|quot|apos|#\d+|#x[0-9A-Fa-f]+));/g,
        replace: '<span class="text-cyan-300">$&</span>',
      },
      {
        regex: /([\,\.]+|# +|\n#+)/g,
        replace: '<span class="text-cyan-300">$1</span>',
      },
    ];
    for (const rule of colorRulesRegex) {
      text = text.replace(rule.regex, rule.replace);
    }

    text = text.replace('732826startBlock2837028', startBlock);

    return text;
  }

  parseLists(text) {
    let result = [];
    const lines = text.split('\n');

    // Маркированные списки
    let inUl = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isUlItem = /^[\*\-] (.*)$/.test(line);

      if (isUlItem && !inUl) {
        result.push('<ul class="pl-2">');
        inUl = true;
        result.push(`<li>– ${line.substring(2)}</li>`);
      } else if (isUlItem && inUl) {
        result.push(`<li>– ${line.substring(2)}</li>`);
      } else if (!isUlItem && inUl) {
        result.push('</ul>');
        inUl = false;
        result.push(line);
      } else {
        result.push(line);
      }
    }
    if (inUl) result.push('</ul>');

    // Нумерованные списки
    let finalResult = [];
    let inOl = false;
    const lines2 = result.join('\n').split('\n');
    let curNum = 1;

    for (let i = 0; i < lines2.length; i++) {
      const line = lines2[i];
      const isOlItem = /^\d+\. (.*)$/.test(line);

      if (isOlItem && !inOl) {
        finalResult.push('<ol class="pl-2">');
        inOl = true;
        finalResult.push(`<li>${curNum++}) ${line.replace(/^\d+\. /, '')}</li>`);
      } else if (isOlItem && inOl) {
        finalResult.push(`<li>${curNum++}) ${line.replace(/^\d+\. /, '')}</li>`);
      } else if (!isOlItem && inOl) {
        finalResult.push('</ol>');
        inOl = false;
        finalResult.push(line);
        curNum = 1;
      } else {
        finalResult.push(line);
      }
    }
    if (inOl) finalResult.push('</ol>');

    return finalResult.join('\n');
  }

  parseParagraphs(text) {
    const paragraphs = text.split('\n\n');
    return paragraphs
      .map((para) => {
        para = para.trim();
        if (!para) return '';

        if (
          para.startsWith('<') &&
          (para.includes('</h') ||
            para.includes('</ul>') ||
            para.includes('</ol>') ||
            para.includes('<pre>') ||
            para.includes('<blockquote>') ||
            para.includes('<hr>') ||
            para.includes('<table>'))
        ) {
          console.log(para);
          return para;
        }

        para = para.replace(/\n(?!<)/g, '<br>');
        return `<p>${para}</p>`;
      })
      .join('\n');
  }

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

  parseTables(text) {
    return this.tableParser.parse(text);
  }

  parse(markdown) {
    if (!markdown) return '';

    let html = markdown;
    html = this.parseInlineCode(html);

    for (const rule of this.rules) {
      html = html.replace(rule.regex, rule.replace);
    }

    html = this.parseTables(html);
    html = this.parseLists(html);
    html = this.parseParagraphs(html);
    html = html.replace(/\n{2,}/g, '\n').trim();

    return html;
  }
}

export const markdownParser = new MarkdownParser();
