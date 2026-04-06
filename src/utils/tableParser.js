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
      // Ищем потенциальную таблицу: строка с '|' и следующая строка — разделитель
      if (
        this.isPossibleTableRow(line) &&
        i + 1 < lines.length &&
        this.isSeparatorRow(lines[i + 1])
      ) {
        const tableRows = [line, lines[i + 1]];
        let j = i + 2;
        while (j < lines.length && this.isPossibleTableRow(lines[j])) {
          tableRows.push(lines[j]);
          j++;
        }
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
   * Проверяет, может ли строка быть строкой таблицы (содержит '|' и не разделитель)
   * @param {string} line
   * @returns {boolean}
   */
  isPossibleTableRow(line) {
    return line.includes('|') && !this.isSeparatorRow(line);
  }

  /**
   * Проверяет, является ли строка разделительной (например, |---|---|)
   * @param {string} line
   * @returns {boolean}
   */
  isSeparatorRow(line) {
    // Удаляем начальные и конечные пробелы
    const trimmed = line.trim();
    if (!trimmed.includes('|')) return false;

    // Нормализуем: добавляем пайпы по краям, если их нет
    let normalized = trimmed;
    if (!normalized.startsWith('|')) normalized = '|' + normalized;
    if (!normalized.endsWith('|')) normalized = normalized + '|';

    // Разбиваем на ячейки, удаляя внешние пайпы
    const cells = normalized.slice(1, -1).split('|');
    for (let cell of cells) {
      const stripped = cell.trim();
      // Пустая ячейка допустима (например, в начале или конце)
      if (stripped === '') continue;
      // Ячейка разделителя должна состоять только из :, -, пробелов
      if (!/^[\s:;-]+$/.test(stripped)) return false;
      // Убираем пробелы и проверяем, что остаток соответствует :?-+:?
      const core = stripped.replace(/\s/g, '');
      if (!/^:?-+:?$/.test(core)) return false;
    }
    return cells.length > 0;
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

    const headerCells = this.parseRow(headerRow);
    const alignments = this.parseAlignments(separatorRow);

    // Формируем <thead>
    const thead = `<thead>\n<tr>\n${headerCells
      .map((cell, idx) => {
        const align = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : '';
        return `<th${align} class="border-border border">${cell.trim()}</th>`;
      })
      .join('\n')}\n</tr>\n</thead>`;

    // Формируем <tbody>
    const tbodyRows = bodyRows
      .map((row) => {
        const cells = this.parseRow(row);
        // Если в строке меньше ячеек, чем в заголовке, дополняем пустыми
        while (cells.length < headerCells.length) cells.push('');
        return `<tr>\n${cells
          .slice(0, headerCells.length)
          .map((cell, idx) => {
            const align = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : '';
            return `<td${align} class="border-border border">${cell.trim()}</td>`;
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
    let trimmed = row.trim();
    // Удаляем внешние пайпы, если они есть
    if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
    if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);

    // Разделяем по пайпу, не внутри экранированного \|
    const cells = trimmed.split(/(?<!\\)\|/g);
    return cells.map((cell) => cell.replace(/\\\|/g, '|').trim());
  }

  /**
   * Определяет выравнивание для каждого столбца на основе строки разделителя
   * @param {string} separatorRow
   * @returns {string[]} массив align: 'left', 'center', 'right' или null
   */
  parseAlignments(separatorRow) {
    // Нормализуем разделитель так же, как в isSeparatorRow
    let trimmed = separatorRow.trim();
    if (!trimmed.startsWith('|')) trimmed = '|' + trimmed;
    if (!trimmed.endsWith('|')) trimmed = trimmed + '|';
    const cells = trimmed.slice(1, -1).split('|');

    return cells.map((cell) => {
      const core = cell.trim().replace(/\s/g, '');
      if (!core) return null;
      if (core.startsWith(':') && core.endsWith(':')) return 'center';
      if (core.endsWith(':')) return 'right';
      if (core.startsWith(':')) return 'left';
      return null;
    });
  }
}

export const TableParser = new MdTableParser();
