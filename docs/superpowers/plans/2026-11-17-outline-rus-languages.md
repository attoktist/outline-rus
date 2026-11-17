# Outline RU languages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать fork Outline, в котором доступны только `en_US` и `ru_RU`, русский каталог переведён по спеке, а релизный тег upstream вливается merge в `main`.

**Architecture:** Список языков upstream не вырезается. `ru_RU` добавляется в конец, `languageOptions` фильтруется до двух кодов, и от этого списка зависят меню, preload, маршрут локалей и `DEFAULT_LANGUAGE`. Даты получают одну новую локаль `date-fns/locale/ru`. Русские строки живут в новом файле, которого в upstream нет.

**Tech Stack:** Outline (TypeScript, React, i18next 22, compatibilityJSON v3), date-fns 4, Vitest 4, Yarn 4.18, Node `>=22.23.5 <23 || >=24.22.3 <25 || >=26.13.1 <27`.

**Spec:** `docs/superpowers/specs/2026-11-17-outline-rus-languages-design.md`

## Global Constraints

- В меню, в `languages`, в `supportedLngs`, в preload и в проверке `DEFAULT_LANGUAGE` только `en_US` и `ru_RU`.
- Чужие каталоги локалей и чужие локали дат остаются.
- `fallbackLng` на клиенте и сервере не меняется. Дефолт в коде остаётся `en_US`.
- Переводится значение из `en_US`. Ключ копируется байт в байт. Если значение отличается от ключа, переводится значение.
- Форма без суффикса `_plural` — единственное число. Форма с суффиксом `_plural` — множественное. Если в `en_US` эти два значения различаются, в `ru_RU` они тоже различаются. Суффиксы `_one`, `_few`, `_many` не добавляются.
- В значении остаются без перевода: плейсхолдеры `{{...}}` с теми же именами, что в ключе; сочетания и имена клавиш `⌘`, `Ctrl+`, `Cmd+`, `Shift+`, `Alt+`, `Opt+`; фрагменты в обратных кавычках; URL `http://` и `https://`; HTML-теги. Имя Outline не переводится.
- `languages` равен `["en_US", "ru_RU"]`.
- Рабочая копия — `C:\Проекты\OutlineRus`. `origin` — `attoktist/outline-rus`, `upstream` — `https://github.com/outline/outline.git`. Дельта на `main`.

## Review Focus

- В `languages` остаётся третий код, и меню предлагает язык, которого в сборке быть не должно. Ожидание: массив равен `["en_US", "ru_RU"]`. Тест: Task 2, `exposes only en_US and ru_RU`.
- В русской строке пропал или переименован `{{ placeholder }}`, и интерфейс показывает сырой шаблон. Ожидание: имена плейсхолдеров совпадают с ключом. Тест: уже есть в `shared/i18n/translations.test.ts`, прогон в Task 3.
- Из русской строки пропало сочетание клавиш. Ожидание: `⌘`, `Ctrl+`, `Cmd+`, `Shift+`, `Alt+`, `Opt+` из ключа есть в значении. Тест: Task 3, `keeps chords, urls, backticks, and HTML tags`.
- `dateLocale("ru_RU")` пустой, и даты в русском интерфейсе остаются английскими. Ожидание: локаль date-fns `ru`. Тест: Task 2, `formats dates in Russian`.
- Длинная английская фраза скопирована в каталог как есть, и пользователь читает английский вместо перевода. Ожидание: фраза с английским служебным словом переведена. Тест: Task 3, `translates English sentences`.

---

## File Structure

- Modify: `shared/i18n/index.ts` — локальный полный список, добавление `ru_RU`, фильтр экспорта.
- Modify: `shared/utils/date.ts` — импорт `ru` и ключ `ru_RU` в `locales`.
- Create: `shared/i18n/ruLocale.test.ts` — состав `languages`, русские даты, полнота и сохранность токенов каталога.
- Create: `shared/i18n/locales/ru_RU/translation.json` — перевод значений `en_US`.
- Create: `docs/superpowers/specs/2026-11-17-outline-rus-languages-design.md` — уже записан до клона, сохраняется в Task 1.
- Create: `docs/superpowers/plans/2026-11-17-outline-rus-languages.md` — этот план, сохраняется в Task 1.

Чужие файлы локалей не меняются. `app/utils/i18n.ts` и `server/utils/i18n.ts` не меняются: они читают `languages`.

### Task 1: Fork и рабочая копия

**Files:**
- Create: `docs/superpowers/specs/2026-11-17-outline-rus-languages-design.md` (уже на диске)
- Create: `docs/superpowers/plans/2026-11-17-outline-rus-languages.md` (уже на диске)

**Interfaces:**
- Consumes: пустой по коду каталог `C:\Проекты\OutlineRus` и GitHub-репозиторий `attoktist/outline-rus`, в котором только README.
- Produces: git-клон Outline на `main`, remote `origin` = `https://github.com/attoktist/outline-rus.git`, remote `upstream` = `https://github.com/outline/outline.git`, оба документа закоммичены поверх `main`.

- [ ] **Step 1: Проверить, что удаляемый репозиторий — плейсхолдер**

Run: `gh repo view attoktist/outline-rus --json name,isFork,defaultBranchRef`

Ожидание: `isFork` = false. Дерево файлов — только `README.md`. Если там есть другая история, остановиться и не удалять.

- [ ] **Step 2: Заменить плейсхолдер форком**

Run: `gh api user --jq .login`

Ожидание: `attoktist`. Иначе остановиться: fork уйдёт в чужой аккаунт.

```powershell
gh repo delete attoktist/outline-rus --yes
gh repo fork outline/outline --fork-name outline-rus --clone=false
```

Ожидание: `gh repo view attoktist/outline-rus --json isFork,parent` показывает `isFork: true` и parent `outline/outline`.

- [ ] **Step 3: Склонировать в `C:\Проекты\OutlineRus`, не потеряв документы**

Каталог уже содержит `docs\`. `git clone` в непустой каталог не идёт.

```powershell
$hold = Join-Path $env:TEMP "outline-rus-docs"
if (Test-Path $hold) { Remove-Item -Recurse -Force $hold }
Copy-Item -Recurse -Force "C:\Проекты\OutlineRus\docs" $hold
Get-ChildItem "C:\Проекты\OutlineRus" -Force | Remove-Item -Recurse -Force
git clone https://github.com/attoktist/outline-rus.git "C:\Проекты\OutlineRus"
Copy-Item -Recurse -Force (Join-Path $hold "docs") "C:\Проекты\OutlineRus\docs"
```

Ожидание: существуют `C:\Проекты\OutlineRus\shared\i18n\index.ts` и оба файла в `docs\superpowers`.

- [ ] **Step 4: Подключить upstream**

```powershell
git remote add upstream https://github.com/outline/outline.git
git fetch upstream --tags
```

Рабочий каталог команд — `C:\Проекты\OutlineRus`.

Ожидание: `git remote -v` печатает `origin` на `attoktist/outline-rus` и `upstream` на `outline/outline`. `git ls-remote --tags upstream` печатает теги.

- [ ] **Step 5: Закоммитить спеку и план**

```powershell
git add docs/superpowers/specs/2026-11-17-outline-rus-languages-design.md docs/superpowers/plans/2026-11-17-outline-rus-languages.md
git commit -m "docs: record the en/ru language fork"
```

Ожидание: `git status` чистый, `git log -1 --oneline` содержит этот коммит поверх коммита Outline.

### Task 2: Список языков и русские даты

**Files:**
- Create: `shared/i18n/ruLocale.test.ts`
- Modify: `shared/i18n/index.ts`
- Modify: `shared/utils/date.ts`
- Test: `shared/i18n/ruLocale.test.ts`

**Interfaces:**
- Consumes: текущие `export const languageOptions` и `export const languages` из `shared/i18n/index.ts`; `export function dateLocale` и `const locales` из `shared/utils/date.ts`.
- Produces: `languages` равен `["en_US", "ru_RU"]`. `dateLocale("ru_RU")` возвращает объект `ru` из `date-fns/locale/ru`. Сигнатуры `languageOptions`, `languages` и `dateLocale` не меняются.

- [ ] **Step 1: Поставить зависимости**

Node должен попадать в `engines.node` из `package.json`.

Run: `yarn install`

Рабочий каталог — `C:\Проекты\OutlineRus`.

Ожидание: команда завершается с кодом 0.

- [ ] **Step 2: Написать падающий тест**

Создать `shared/i18n/ruLocale.test.ts`:

```ts
import { ru } from "date-fns/locale/ru";
import { describe, expect, it } from "vitest";
import { dateLocale } from "../utils/date";
import { languages } from "./index";

describe("outline-rus languages", () => {
  it("exposes only en_US and ru_RU", () => {
    expect(languages).toEqual(["en_US", "ru_RU"]);
  });

  it("formats dates in Russian", () => {
    expect(dateLocale("ru_RU")).toBe(ru);
  });
});
```

- [ ] **Step 3: Убедиться, что тест падает**

Run: `yarn vitest run --project shared-node shared/i18n/ruLocale.test.ts`

Ожидание: FAIL. `languages` содержит другие коды, `dateLocale("ru_RU")` не равен `ru`.

- [ ] **Step 4: Подключить `ru_RU` в датах и отфильтровать список языков**

В `shared/utils/date.ts` добавить импорт рядом с остальными импортами локалей, не удаляя их:

```ts
import { ru } from "date-fns/locale/ru";
```

В объект `locales` добавить свойство, не удаляя существующие ключи:

```ts
ru_RU: ru,
```

В `shared/i18n/index.ts` переименовать экспортируемый массив в `const allLanguageOptions`. Записи и их порядок не менять. После массива:

```ts
allLanguageOptions.push({
  label: "Русский (Russian)",
  value: "ru_RU",
});

const enabledLanguages = new Set<LanguageOption["value"]>(["en_US", "ru_RU"]);

export const languageOptions: LanguageOption[] = allLanguageOptions.filter(
  (option) => enabledLanguages.has(option.value)
);

export const languages = languageOptions.map((i) => i.value);
```

- [ ] **Step 5: Убедиться, что тест проходит**

Run: `yarn vitest run --project shared-node shared/i18n/ruLocale.test.ts`

Ожидание: PASS, оба теста.

- [ ] **Step 6: Закоммитить**

```powershell
git add shared/i18n/index.ts shared/i18n/ruLocale.test.ts shared/utils/date.ts
git commit -m "feat: limit languages to en_US and ru_RU"
```

### Task 3: Русский каталог

**Files:**
- Create: `shared/i18n/locales/ru_RU/translation.json`
- Modify: `shared/i18n/ruLocale.test.ts`
- Test: `shared/i18n/ruLocale.test.ts`
- Test: `shared/i18n/translations.test.ts`

**Interfaces:**
- Consumes: ключи и значения `shared/i18n/locales/en_US/translation.json`. Правила перевода — Global Constraints.
- Produces: `shared/i18n/locales/ru_RU/translation.json`, объект `Record<string, string>` с тем же набором ключей, что у `en_US`.

- [ ] **Step 1: Дописать падающие проверки каталога**

В `shared/i18n/ruLocale.test.ts` добавить чтение каталогов и три теста. Существующие два теста не менять.

```ts
import fs from "node:fs";
import path from "node:path";

const readLocale = (locale: string): Record<string, string> =>
  JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, "locales", locale, "translation.json"),
      "utf8"
    )
  );

const preservedToken = /https?:\/\/[^\s)"']+|`[^`]+`|<\/?[a-zA-Z][^>]*>|⌘|(?:Ctrl|Cmd|Shift|Alt|Opt)\+/g;

const tokens = (text: string) =>
  Array.from(text.matchAll(preservedToken), (match) => match[0]).sort();

const englishProse = /\b(the|to|you|your|this|with|for|and|are|from|of|in|on|is|be|it|or|not)\b/i;
```

```ts
it("ru_RU has every en_US key", () => {
  const en = readLocale("en_US");
  const translated = readLocale("ru_RU");
  const missing = Object.keys(en).filter(
    (key) => !(key in translated) || translated[key] === ""
  );
  expect(missing).toEqual([]);
});

it("keeps chords, urls, backticks, and HTML tags", () => {
  const en = readLocale("en_US");
  const translated = readLocale("ru_RU");
  const errors = Object.keys(en).flatMap((key) => {
    const expected = tokens(key);
    if (expected.length === 0) {
      return [];
    }
    const actual = tokens(translated[key] ?? "");
    return JSON.stringify(expected) === JSON.stringify(actual)
      ? []
      : [`${JSON.stringify(key)} has ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`];
  });
  expect(errors).toEqual([]);
});

it("translates English sentences", () => {
  const translated = readLocale("ru_RU");
  const copied = Object.keys(translated).filter(
    (key) => translated[key] === key && englishProse.test(key)
  );
  expect(copied).toEqual([]);
});

it("uses a distinct form for _plural keys", () => {
  const en = readLocale("en_US");
  const translated = readLocale("ru_RU");
  const collapsed = Object.keys(en).filter((key) => {
    if (!key.endsWith("_plural")) {
      return false;
    }
    const singularKey = key.slice(0, -"_plural".length);
    if (!(singularKey in en) || en[singularKey] === en[key]) {
      return false;
    }
    return translated[singularKey] === translated[key];
  });
  expect(collapsed).toEqual([]);
});
```

- [ ] **Step 2: Убедиться, что новые тесты падают**

Run: `yarn vitest run --project shared-node shared/i18n/ruLocale.test.ts`

Ожидание: два теста Task 2 по-прежнему PASS. Новые тесты FAIL, потому что `locales/ru_RU/translation.json` отсутствует.

- [ ] **Step 3: Записать полный `ru_RU/translation.json`**

Источник — значения `shared/i18n/locales/en_US/translation.json`. Ключи те же. Перевод по Global Constraints. Образец двух форм — пары `key` / `key_plural` в `shared/i18n/locales/uk_UA/translation.json`: переводится значение, не соседняя форма.

- [ ] **Step 4: Прогнать тесты каталога**

Run: `yarn vitest run --project shared-node shared/i18n/ruLocale.test.ts shared/i18n/translations.test.ts`

Ожидание: PASS. `translations.test.ts` зелёный для `ru_RU` и для остальных локалей.

- [ ] **Step 5: Закоммитить**

```powershell
git add shared/i18n/locales/ru_RU/translation.json shared/i18n/ruLocale.test.ts
git commit -m "feat: add Russian translations"
```

Ожидание: `git status` чистый. `git log --oneline` показывает три наших коммита поверх истории Outline: docs, limit languages, Russian translations.
