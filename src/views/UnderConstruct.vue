<template>
  <!-- <div class="markdown-conten bg-main text-text" v-html="parsedHtml"></div> -->
  <!--div v-show="false" class="bg-amber-400 bg-pink-400 bg-purple-400 bg-red-400"></div-->
  <div class="container">
    <textarea v-model="markdownText" placeholder="Введите Markdown..." class="editor"></textarea>

    <div class="preview bg-main text-text" v-html="parsedHtml"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { markdownParser } from '@/utils/markdownParser';

const markdownText = ref(`
\`\`\`python
{{{---}}}
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Мега-тест для парсера-раскраски кода.
Содержит: строки (в т.ч. f-строки, docstring, экранирование), комментарии, 
декораторы, async/await, вложенные скобки, операторы, числа, регулярки.
"""''
'''
import re
import asyncio
from typing import List, Dict, Any, Optional

# === 1. Комментарии и строки ===
def demo_strings():
    """Докстринг с кавычками \" и экранированием \n \t \\ \x41 \u1234 \U0010FFFF"""
    s1 = 'Обычная строка с \'кавычкой\' и # не комментарий'
    s2 = "Двойные кавычки внутри 'одинарных' и # не комментарий"
    s3 = """Тройные кавычки "внутри" и '''вложенные'''"""
    s4 = r"Raw string \n \t не экранируются, но кавычки \" работают"
    s5 = rb"Raw bytes string \x00 \xFF"
    s6 = f"F-string с {s1!r} и {2+2=}, {f'{s2[:5]}'}"
    s7 = F"""Многострочный f-string
        с {s3.upper()} и {lambda x: x*2}"""
    s8 = b"Bytes \x48\x65\x6c\x6c\x6f"
    s9 = u"Unicode literal"
    return s1, s2, s3, s4, s5, s6, s7, s8, s9

# === 2. Числа всех мастей ===
numbers = [
    42, -17, 0, 0o755, 0xDEADBEEF, 0b101010,
    3.14, -2.5e-3, 1e100, 1j, 2+3j, .5, 12_345_678,
    0.0, -0.0, float('inf'), float('nan')
]

# === 3. Декораторы (вложенные, с аргументами) ===
def decorator_factory(arg):
    def decorator(func):
        def wrapper(*args, **kwargs):
            print(f"Before: {arg}")
            result = func(*args, **kwargs)
            print(f"After: {arg}")
            return result
        return wrapper
    return decorator

@decorator_factory("test")
@staticmethod
@classmethod
@asyncio.coroutine
async def decorated_example(x: int, y: int = 10) -> int:
    """Асинхронная функция с декораторами"""
    return x + y

# === 4. Сложные выражения и операторы ===
def operator_mess(a, b, c):
    result = (a << 2) ^ (b >> 1) | ~c & 0xFF
    result += a ** b // c % 3
    result *= 5
    result /= 2
    result //= 2
    result -= 1
    result += 1
    result &= 0xFFFF
    result |= 0x8000
    result ^= 0xAAAA
    result <<= 1
    result >>= 1
    is_true = (a is b) and (c is not None) or (a in [1,2,3]) and not (b not in {4,5,6})
    walrus := (x := 42) + (y := 7)
    return result, is_true, walrus

# === 5. Регулярные выражения (для проверки строк с обратными слешами) ===
pattern = re.compile(r'\b\w+(?:\s+\w+)*\b')
email_re = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
escaped_slash = "\\"  # Одиночный обратный слеш в строке
path = "C:\\Users\\name\\file.txt"

# === 6. Вложенные скобки и многоуровневые структуры ===
nested = [
    (1, [2, {3: (4, 5, [6, (7, 8)])}]),
    {9, 10, frozenset({11, 12})},
    {"a": [13, {"b": (14, 15)}], "c": {16}}
]

# === 7. Условные и циклические конструкции с вложенностью ===
def control_flow(items: List[Any]) -> Dict[str, Any]:
    result = {}
    for i, item in enumerate(items):
        if isinstance(item, int) and item > 0:
            if item % 2 == 0:
                result[f"even_{i}"] = item * 2
            else:
                result[f"odd_{i}"] = item * 3
        elif isinstance(item, str) and item:
            with open("/dev/null", "w") as f:
                for ch in item:
                    if ch.isalpha():
                        result[ch] = ord(ch)
        else:
            while False:
                break
            else:
                pass
        try:
            _ = 1 / item if item != 0 else None
        except ZeroDivisionError as e:
            result["error"] = str(e)
        finally:
            continue
    return result

# === 8. Асинхронность и контекстные менеджеры ===
async def async_chain():
    async with asyncio.timeout(5):
        await asyncio.sleep(0)
    try:
        await decorated_example(5, 7)
    except* ValueError as eg:
        for e in eg.exceptions:
            print(e)

# === 9. Магические методы и аннотации типов ===
class MagicDemo:
    __slots__ = ('_data',)
    
    def __init__(self, data: Optional[List[int]] = None) -> None:
        self._data = data or []
    
    def __getitem__(self, key: slice | int) -> Any:
        return self._data[key]
    
    def __setitem__(self, key: int, value: int) -> None:
        self._data[key] = value
    
    def __add__(self, other: 'MagicDemo') -> 'MagicDemo':
        return MagicDemo(self._data + other._data)
    
    @property
    def total(self) -> int:
        return sum(self._data)

# === 10. Лямбды, генераторы, включения ===
lambda_example = lambda x, y=10: x * y + (lambda z: z**2)(x)
gen_expr = (x**2 for x in range(10) if x % 2)
list_comp = [f"#{i:02x}" for i in range(16)]
dict_comp = {str(k): v for k, v in enumerate(['a','b','c'])}
set_comp = {ch for ch in "abracadabra" if ch not in 'abc'}

# === 11. Докстринги и аннотации функций (уже есть выше) ===
def complex_annotations(
    arg1: List[Dict[str, tuple[int, ...]]],
    arg2: int | str | None = None,
    *args: Any,
    **kwargs: float
) -> tuple[bool, ...]:
    """Функция со сложными аннотациями типов."""
    return (True, False)

# === 12. Асинхронные генераторы и with ===
async def async_gen():
    async for x in range(10):
        if x % 2 == 0:
            yield x
        else:
            continue

# === 13. Трюки с операторами (матричное умножение @) ===
import numpy as np  # не обязательно, но синтаксис @ нужно показать
matrix = np.array([[1,2],[3,4]]) @ np.array([[5,6],[7,8]])

# === 14. Сырые строки и многострочные с экранированием конца строки ===
raw_with_escape = r"Line1\nLine2\\nLine3"
multiline_concat = ("Первая строка "
                    "Вторая строка "
                    "Третья строка")
backslash_at_eol = "Это строка без переноса, \
но обратный слеш в конце строки"

# === 15. Вложенные f-строки (Python 3.12+) ===
f_nested = f"{f"{f"{42}"}"}"
print(f_nested)

# === 16. Необязательный вызов (PEP 604 union types уже показан) ===
def run_all():
    demo_strings()
    operator_mess(10, 3, 5)
    control_flow([1, "hello", 0, None])
    print("Тест завершён")
    # Комментарий в конце файла с # внутри строки не считается: " # "

if __name__ == "__main__":
    run_all()
\`\`\`


# Заголовок 1

## Заголовок 2

### Заголовок 3

#### Заголовок 4

##### Заголовок 5

###### Заголовок 6

Это обычный **жирный текст** и *курсив*.

А вот ~~зачеркнутый текст~~.

Список покупок:
- Молоко
- Хлеб
- Яйца

Нумерованный список:
1. Первый пункт
2. Второй пункт
3. Третий пункт

Второй нумерованный список:
1. Первый пункт
2. Второй пункт
3. Третий пункт

[Ссылка на Google](https://google.com)

![Пример изображения](https://example.com/image.jpg)

<>&|'""'

\`\`\`javascript
function hello() { {{}}
    console.log("Hello, World!");
}
\`\`\`

> Это цитата

---

Горизонтальная линия выше.


В Tailwind CSS для создания подчёркнутого текста используется класс **\`underline\`**.

## Базовое использование:

\`\`\`html
<p class="underline">Подчёркнутый текст</p>
\`\`\`

## Варианты стилей подчёркивания:

\`\`\`html
<!-- Обычное подчёркивание -->
<p class="underline">Обычное подчёркивание</p>

<!-- Пунктирное подчёркивание -->
<p class="underline decoration-dotted">Пунктирное</p>

<!-- Волнистое подчёркивание (например, для ошибок) -->
<p class="underline decoration-wavy">Волнистое</p>

<!-- Двойное подчёркивание -->
<p class="underline decoration-double">Двойное</p>
\`\`\`

## Цвет подчёркивания:

\`\`\`html
<p class="underline decoration-red-500">Красное подчёркивание</p>
<p class="underline decoration-blue-500 decoration-wavy">Синее волнистое</p>
\`\`\`

## Толщина подчёркивания:

\`\`\`html
<p class="underline decoration-1">Тонкое</p>
<p class="underline decoration-2">Среднее</p>
<p class="underline decoration-4">Толстое</p>
\`\`\`

## Для ссылок (обычно подчёркивание при наведении):

\`\`\`html
<a href="#" class="hover:underline">Ссылка с подчёркиванием при наведении</a>
\`\`\`

## Убрать подчёркивание:

\`\`\`html
<a href="#" class="no-underline">Ссылка без подчёркивания</a>
\`\`\`

## Комбинация всех параметров:

\`\`\`html
<p class="underline decoration-wavy decoration-indigo-500 decoration-4">
  Красивый волнистый индиговый текст
</p>
\`\`\`

Tailwind автоматически генерирует классы \`decoration-{width}\`, где ширина может быть от \`0\` до \`8\` с шагом в 1px (в некоторых версиях доступны и другие значения).
`);

const parsedHtml = computed(() => markdownParser.parse(markdownText.value));
</script>
