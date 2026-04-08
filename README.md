# Портфолио Анны Вершининой - Hugo

Сайт портфолио художницы Анны Вершининой, построенный на статическом генераторе сайтов **Hugo**. Поддерживает два языка: русский и английский.

## Требования

- **macOS**
- **Hugo** (версия 0.159.2 или выше)
- **Git** (для управления версиями)

## Установка Hugo на Mac

### Вариант 1: Через Homebrew (рекомендуется)

```bash
brew install hugo
```

Проверьте установку:
```bash
hugo version
```

Должна вывести версию Hugo (например: `hugo v0.159.2+extended+withdeploy darwin/arm64`).

### Вариант 2: Скачать с официального сайта

Если Homebrew не установлен, скачайте Hugo с [github.com/gohugoio/hugo/releases](https://github.com/gohugoio/hugo/releases) и следуйте инструкциям на сайте.

## Запуск локального сервера разработки

### Способ 1: Через VS Code / Cursor (рекомендуется)

1. Откройте проект в Cursor или VS Code:
   ```bash
   cursor .
   # или
   code .
   ```

2. Нажмите `Cmd+Shift+P` (Mac) или `Ctrl+Shift+P` (Windows/Linux)

3. Введите "Run Task" и выберите **"Hugo: Start Dev Server"**

4. Откройте браузер на `http://localhost:1313`

Hugo будет автоматически перезагружать страницы при изменении файлов.

Подробнее см. [.vscode/README.md](.vscode/README.md)

### Способ 2: Через терминал

1. Откройте терминал
2. Перейдите в папку проекта:
   ```bash
   cd /path/to/vershininaart
   ```
3. Запустите Hugo сервер:
   ```bash
   hugo server
   ```
4. Откройте браузер и перейдите на `http://localhost:1313`

### Завершение работы сервера

Нажмите `Ctrl+C` в терминале.

## Сборка сайта для продакшена

Для создания финальной версии сайта:

```bash
hugo build
```

Сгенерированный сайт появится в папке `public/`.

## Работа в VS Code / Cursor

Проект содержит полную конфигурацию для VS Code и Cursor:

- **Готовые задачи** для запуска Hugo (Command Palette → "Run Task")
- **Автоматическое форматирование** YAML и Markdown файлов
- **Рекомендуемые расширения** для удобной работы
- **Исключение ненужных папок** из поиска и файлового дерева

**Подробнее:** см. [.vscode/README.md](.vscode/README.md)

## Структура проекта

```
vershininaart/
├── content/              # Содержимое сайта
│   ├── _index.ru.md      # Главная страница (русский)
│   ├── _index.en.md      # Главная страница (английский)
│   ├── series/           # Папки с художественными работами
│   │   ├── 01-rybaki/
│   │   ├── 02-harmony/
│   │   └── ...
│   ├── about/            # Страница "Об авторе"
│   ├── cv/               # Страница CV
│   └── contacts/         # Страница контактов
├── layouts/              # Шаблоны HTML
├── static/               # Статические файлы (CSS, JavaScript, иконки)
├── i18n/                 # Переводы UI элементов
├── .vscode/              # Конфигурация для VS Code / Cursor
│   ├── tasks.json        # Задачи для запуска команд Hugo
│   ├── settings.json     # Настройки редактора
│   └── extensions.json   # Рекомендуемые расширения
├── hugo.yaml             # Конфигурация Hugo
├── README.md             # Этот файл
├── AGENTS.md             # Руководство для работы с LLM (русский)
└── AGENTS_EN.md          # Руководство для работы с LLM (английский)
```
vershininaart/
├── content/              # Содержимое сайта
│   ├── _index.ru.md      # Главная страница (русский)
│   ├── _index.en.md      # Главная страница (английский)
│   ├── series/           # Папки с художественными работами
│   │   ├── 01-rybaki/
│   │   ├── 02-harmony/
│   │   └── ...
│   ├── about/            # Страница "Об авторе"
│   ├── cv/               # Страница CV
│   └── contacts/         # Страница контактов
├── layouts/              # Шаблоны HTML
├── static/               # Статические файлы (CSS, JavaScript, иконки)
├── i18n/                 # Переводы UI элементов
├── hugo.yaml             # Конфигурация Hugo
└── README.md             # Этот файл
```

## Добавление новой серии работ

### Шаг 1: Создайте папку для новой серии

Папки названы с числовыми префиксами для правильной сортировки. Следующая серия должна быть номером 12.

```bash
mkdir -p content/series/12-новое-название
```

### Шаг 2: Скопируйте русский файл (`_index.ru.md`)

```bash
cp content/series/11-bereg/_index.ru.md content/series/12-новое-название/_index.ru.md
```

### Шаг 3: Отредактируйте русский файл

Откройте `content/series/12-новое-название/_index.ru.md` и обновите следующие поля:

```yaml
---
title: Название серии на русском
collection: graphic-print  # Или paintings, sculpture
description: Art series
draft: false
weight: 12  # Соответствует номеру папки
cardclass: ""  # Опционально, может быть " card--compact" или другое значение
works:
  - title: Название работы 1
    image:
      src: image-file-1.jpg  # Имя файла изображения
      alt: Описание изображения для SEO и доступности
    year: 2024
    technique: Название техники
    size: 50 × 70  # Формат: ширина × высота (в см)
    sheet: 1/2  # Опционально, указывает лист (если серия многолистная)
  - title: Название работы 2
    image:
      src: image-file-2.jpg
      alt: Описание второго изображения
    year: 2024
    technique: Название техники
    size: 50 × 70
    sheet: 2/2
---
```

### Шаг 4: Создайте английский файл (`_index.en.md`)

```bash
cp content/series/12-новое-название/_index.ru.md content/series/12-новое-название/_index.en.md
```

Откройте `_index.en.md` и переведите на английский:

```yaml
---
title: Series name in English
collection: graphic-print
description: Art series
draft: false
weight: 12
cardclass: ""
works:
  - title: Work title 1
    image:
      src: image-file-1.jpg
      alt: Image description in English
    year: 2024
    technique: Technique name
    size: 50 × 70
    sheet: 1/2
  - title: Work title 2
    image:
      src: image-file-2.jpg
      alt: Second image description in English
    year: 2024
    technique: Technique name
    size: 50 × 70
    sheet: 2/2
---
```

### Шаг 5: Добавьте изображения

1. Сохраните изображения работ в папке `content/series/12-новое-название/`
2. Имена файлов должны совпадать с `src` в frontmatter (например: `image-file-1.jpg`)
3. Формат: JPG, PNG (рекомендуется JPG для фото)

### Шаг 6: Проверьте на локальном сервере

```bash
hugo server
```

Откройте `http://localhost:1313` и убедитесь, что новая серия появилась в нужной коллекции.

## Объяснение полей в `_index.ru.md` и `_index.en.md`

### Основные параметры

| Поле | Тип | Описание | Пример |
|------|-----|---------|--------|
| **title** | строка | Название серии работ | "Рыбаки", "Harmony" |
| **collection** | строка | Категория работы. Возможные значения: `graphic-print` (графика), `paintings` (живопись), `sculpture` (скульптура) | "graphic-print" |
| **description** | строка | Описание для SEO (не отображается на сайте) | "Art series" |
| **draft** | boolean | Если `true`, серия не будет опубликована | `false` |
| **weight** | число | Порядок сортировки в коллекции. Меньшее число = выше | 1-11 |
| **cardclass** | строка | CSS класс для стилизации карточки на главной странице | "" или " card--compact" |

### Параметры работы (массив `works`)

Каждая серия может содержать одну или несколько работ. Структура каждой работы:

| Поле | Тип | Описание | Пример |
|------|-----|---------|--------|
| **title** | строка | Название конкретной работы | "Рыбаки - лист 1" |
| **image.src** | строка | Имя файла изображения (должен находиться в папке серии) | "rybaki-work-1.png" |
| **image.alt** | строка | Альтернативный текст для изображения (показывается если изображение не загрузилось, важно для SEO) | "Графическая работа Рыбаки — лист 1" |
| **year** | число | Год создания работы | 2022 |
| **technique** | строка | Техника исполнения | "Линогравюра", "Темпера", "Офорт" |
| **size** | строка | Размеры работы (ширина × высота) | "40 × 60" |
| **sheet** | строка | Опционально, для многолистных работ | "1/2", "2/2" |

### Пример полного файла серии

```yaml
---
title: Рыбаки
collection: graphic-print
description: Art series
draft: false
weight: 1
cardclass: ""
works:
  - title: Рыбаки
    image:
      src: rybaki-work-1.png
      alt: Графическая работа Рыбаки — лист 1
    year: 2022
    technique: Линогравюра
    size: 40 × 60
    sheet: 1/2
  - title: Рыбаки
    image:
      src: rybaki-work-2.png
      alt: Графическая работа Рыбаки — лист 2
    year: 2022
    technique: Линогравюра
    size: 40 × 60
    sheet: 2/2
---
```

## Категории работ (collection)

### `graphic-print` (Графика / Печатные техники)
Используется для графических работ: линогравюра, офорт, гравюра и т.д.

### `paintings` (Живопись)
Используется для живописных работ: акрил, масло, темпера и т.д.

### `sculpture` (Скульптура)
Используется для скульптурных работ: гипс, камень, дерево и т.д.

## Редактирование страниц

### Страница "Об авторе" (`content/about/_index.ru.md`)

```yaml
---
title = "Об авторе"
description = "Bio page"
type = "about"
layout = "about"

[bio]
image = "profile-picture.png"  # Фото в папке about/
alt = "Вершинина Анна"
text = """
Текст о художнице в формате Markdown.
Можно использовать **жирный текст**, *курсив* и переносы строк.
"""
+++
```

### Страница CV (`content/cv/_index.ru.md`)

Содержит образование, выставки и опыт. Редактируйте непосредственно в файле.

### Страница контактов (`content/contacts/_index.ru.md`)

Содержит контактную информацию. Редактируйте непосредственно в файле.

## Команды Hugo

```bash
# Запустить локальный сервер с автоперезагрузкой
hugo server

# Собрать сайт для продакшена
hugo build

# Просмотр всех доступных команд
hugo help

# Создать новый контент (не обязательно, можно редактировать вручную)
hugo new content/series/12-новая-серия/_index.ru.md
```

## Структура URL-адресов

### Русская версия (по умолчанию)
- Главная: `https://example.com/`
- Серия: `https://example.com/series/01-rybaki/`
- Об авторе: `https://example.com/about/`
- CV: `https://example.com/cv/`
- Контакты: `https://example.com/contacts/`

### Английская версия
- Главная: `https://example.com/en/`
- Серия: `https://example.com/en/series/01-rybaki/`
- Об авторе: `https://example.com/en/about/`
- CV: `https://example.com/en/cv/`
- Контакты: `https://example.com/en/contacts/`

## Решение проблем

### Сервер не запускается

Убедитесь, что Hugo правильно установлен:
```bash
hugo version
```

Попробуйте запустить сервер на другом порту:
```bash
hugo server --port 1314
```

### Изображения не отображаются

1. Убедитесь, что файлы изображений находятся в папке серии (например: `content/series/01-rybaki/image.jpg`)
2. Проверьте, что имя файла в `image.src` совпадает с реальным именем
3. Перезагрузите сервер (`Ctrl+C` и заново `hugo server`)

### Изменения не отображаются на сайте

Перезагрузите браузер (`Cmd+R` на Mac или `Ctrl+R` на Windows).
Если это не помогает, перезагрузите Hugo сервер.

### Новые серии не появляются на главной странице

Проверьте:
1. Файл `_index.ru.md` содержит поле `draft: false`
2. Поле `collection` соответствует одной из трёх категорий: `graphic-print`, `paintings`, `sculpture`
3. На главной странице (`content/_index.ru.md`) определены все три коллекции в массиве `collections`
