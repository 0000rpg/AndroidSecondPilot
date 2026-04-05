class MdTableParser {
  /**
   * Преобразует markdown-таблицу в HTML
   * @param {string} markdown
   * @returns {string} HTML с таблицами
   */
  parse(markdown) {
    const lines = markdown.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      // Ищем потенциальное начало таблицы: строка, содержащая '|', не внутри HTML-тегов
      if (
        this.isPossibleTableRow(line) &&
        i + 1 < lines.length &&
        this.isSeparatorRow(lines[i + 1])
      ) {
        // Собираем все строки таблицы
        const tableRows = [line, lines[i + 1]];
        let j = i + 2;
        while (j < lines.length && this.isPossibleTableRow(lines[j])) {
          tableRows.push(lines[j]);
          j++;
        }
        // Конвертируем собранный блок в HTML-таблицу
        const htmlTable = this.convertTable(tableRows);
        result.push(htmlTable);
        i = j;
      } else {
        result.push(line);
        i++;
      }
    }
    return result.join('\n');
  }

  /**
   * Проверяет, может ли строка быть строкой таблицы (содержит '|')
   * @param {string} line
   * @returns {boolean}
   */
  isPossibleTableRow(line) {
    return /^\s*\|?[^|\n]+\|/.test(line) || /^\s*[^|\n]+\|/.test(line);
  }

  /**
   * Проверяет, является ли строка разделительной (например, |---|---|)
   * @param {string} line
   * @returns {boolean}
   */
  isSeparatorRow(line) {
    return /^\s*\|?[\s:-]+\|[\s:-]+\|?\s*$/.test(line) || /^\s*[\s:-]+\|[\s:-]+\s*$/.test(line);
  }

  /**
   * Преобразует массив строк таблицы в HTML
   * @param {string[]} rows - строки: заголовок, разделитель, данные
   * @returns {string}
   */
  convertTable(rows) {
    const headerRow = rows[0];
    const separatorRow = rows[1];
    const bodyRows = rows.slice(2);

    // Парсим заголовок
    const headerCells = this.parseRow(headerRow);
    // Парсим выравнивание из строки разделителя
    const alignments = this.parseAlignments(separatorRow);

    // Формируем <thead>
    const thead = `<thead>\n<tr>\n${headerCells
      .map((cell, idx) => {
        const align = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : '';
        return `<th${align}>${cell.trim()}</th>`;
      })
      .join('\n')}\n</tr>\n</thead>`;

    // Формируем <tbody>
    const tbodyRows = bodyRows
      .map((row) => {
        const cells = this.parseRow(row);
        return `<tr>\n${cells
          .map((cell, idx) => {
            const align = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : '';
            return `<td${align}>${cell.trim()}</td>`;
          })
          .join('\n')}\n</tr>`;
      })
      .join('\n');

    return `<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-border">${thead}<tbody>\n${tbodyRows}\n</tbody></table></div>`;
  }

  /**
   * Разбивает строку таблицы на ячейки (учитывает экранированные пайпы)
   * @param {string} row
   * @returns {string[]}
   */
  parseRow(row) {
    // Убираем начальный и конечный пробелы, а также возможный внешний пайп
    let trimmed = row.trim();
    if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
    if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);

    // Разделяем по пайпу, но не внутри экранированного \|
    const cells = trimmed.split(/(?<!\\)\|/g);
    return cells.map((cell) => cell.replace(/\\\|/g, '|')); // восстанавливаем экранированные пайпы
  }

  /**
   * Определяет выравнивание для каждого столбца на основе строки разделителя
   * @param {string} separatorRow
   * @returns {string[]} массив align: 'left', 'center', 'right' или null
   */
  parseAlignments(separatorRow) {
    const cells = this.parseRow(separatorRow);
    return cells.map((cell) => {
      const leftDash = /^:?-+:?$/.test(cell);
      if (!leftDash) return null;
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
      if (cell.endsWith(':')) return 'right';
      if (cell.startsWith(':')) return 'left';
      return null; // по умолчанию выравнивание не задаётся
    });
  }
}

export const TableParser = new MdTableParser();
