import os
import sys

# ------------------------------------------------------------
# Настройки по умолчанию (можно изменить перед запуском)
# ------------------------------------------------------------
DEFAULT_DIRECTORIES = ['src']        # список папок для обхода
DEFAULT_EXTENSIONS = ['.html', '.js', '.json', '.css', '.vue']  # расширения файлов
DEFAULT_FILES = ['index.html', 'capacitor.config.json', 'jsconfig.json', 'vite.config.js', 'package.json', 'tailwind.config.js', 'postcss.config.js']                              # отдельные файлы для включения
DEFAULT_OUTPUT = 'bundle.txt'                   # имя выходного файла
# ------------------------------------------------------------

def collect_files(directories, extensions, specific_files):
    """
    Обходит все указанные директории (рекурсивно) и возвращает список
    путей к файлам, чьё расширение входит в список extensions.
    Также добавляет конкретные файлы из specific_files.
    """
    matched_files = []
    
    # Добавляем конкретные файлы (если они существуют)
    for file_path in specific_files:
        if os.path.isfile(file_path):
            matched_files.append(file_path)
        else:
            print(f"Предупреждение: файл '{file_path}' не найден, пропускаем.")
    
    # Обходим директории
    for directory in directories:
        # Проверяем, существует ли директория
        if not os.path.isdir(directory):
            print(f"Предупреждение: директория '{directory}' не найдена, пропускаем.")
            continue

        for root, dirs, files in os.walk(directory):
            for file in files:
                # Получаем расширение файла в нижнем регистре для сравнения
                _, ext = os.path.splitext(file)
                if ext.lower() in [e.lower() for e in extensions]:
                    full_path = os.path.join(root, file)
                    # Проверяем, не был ли файл уже добавлен как конкретный
                    if full_path not in matched_files:
                        matched_files.append(full_path)

    return matched_files

def merge_files(file_list, output_file):
    """
    Записывает в output_file объединённое содержимое всех файлов из file_list
    в формате:
        <путь к файлу>
        <Text>
        <содержимое файла>
        ---
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as out:
            for file_path in file_list:
                # Записываем относительный путь (от текущей рабочей директории)
                rel_path = os.path.relpath(file_path, start=os.getcwd())
                out.write(f"{rel_path}\n")
                out.write("<Text>\n")

                # Читаем содержимое файла (пытаемся открыть как текст)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    out.write(content)
                except (UnicodeDecodeError, IOError) as e:
                    # Если файл не читается как текст, запишем заглушку
                    out.write(f"<Ошибка чтения файла: {e}>\n")

                out.write("\n---\n")   # разделитель после каждого файла

        print(f"Готово! Результат сохранён в '{output_file}'")
    except IOError as e:
        print(f"Ошибка при записи выходного файла: {e}")
        sys.exit(1)

def main():
    # Разбор аргументов командной строки (если они есть)
    args = sys.argv[1:]

    # Если аргументов нет — используем настройки по умолчанию
    if not args:
        directories = DEFAULT_DIRECTORIES
        extensions = DEFAULT_EXTENSIONS
        specific_files = DEFAULT_FILES
        output_file = DEFAULT_OUTPUT
    else:
        # Простой разбор аргументов
        directories = []
        specific_files = []
        extensions = []
        output_file = DEFAULT_OUTPUT
        
        i = 0
        while i < len(args):
            if args[i] == '--ext':
                # Следующие аргументы до следующего флага или конца - расширения
                i += 1
                while i < len(args) and not args[i].startswith('-'):
                    extensions.append(args[i])
                    i += 1
            elif args[i] == '-o' or args[i] == '--output':
                # Следующий аргумент - имя выходного файла
                if i + 1 < len(args) and not args[i+1].startswith('-'):
                    output_file = args[i+1]
                    i += 2
                else:
                    print("Ошибка: после -o должно быть имя выходного файла.")
                    sys.exit(1)
            elif args[i] == '--files':
                # Следующие аргументы до следующего флага или конца - конкретные файлы
                i += 1
                while i < len(args) and not args[i].startswith('-'):
                    specific_files.append(args[i])
                    i += 1
            elif args[i].startswith('-'):
                print(f"Неизвестный флаг: {args[i]}")
                sys.exit(1)
            else:
                # Это директория для обхода
                directories.append(args[i])
                i += 1
        
        # Если расширения не указаны, используем по умолчанию
        if not extensions:
            extensions = DEFAULT_EXTENSIONS
            
        # Если директории не указаны, используем по умолчанию
        if not directories and not specific_files:
            print("Ошибка: не указаны ни директории, ни конкретные файлы для обработки.")
            sys.exit(1)

    # Убедимся, что расширения начинаются с точки (добавим, если забыли)
    extensions = [ext if ext.startswith('.') else f'.{ext}' for ext in extensions]

    print("Директории для поиска:", directories if directories else "(не указаны)")
    print("Конкретные файлы:", specific_files if specific_files else "(не указаны)")
    print("Расширения файлов:", extensions)
    print("Выходной файл:", output_file)

    # Собираем файлы
    files = collect_files(directories, extensions, specific_files)

    if not files:
        print("Не найдено ни одного файла с указанными расширениями.")
        sys.exit(0)

    print(f"Найдено файлов: {len(files)}")
    merge_files(files, output_file)

if __name__ == "__main__":
    main()