<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/logos/outline-logo-dark.png" height="29">
    <source media="(prefers-color-scheme: light)" srcset="./public/logos/outline-logo-light.png" height="29">
    <img src="./public/logos/outline-logo-light.png" height="29" alt="Outline" />
  </picture>
</p>
<p align="center">
  <i>Быстрая совместная база знаний для команды на React и Node.js.<br/>Облачная версия Outline: <a href="https://www.getoutline.com">www.getoutline.com</a>.</i>
  <br/>
  <img width="1640" alt="снимок экрана" src="https://user-images.githubusercontent.com/380914/110356468-26374600-7fef-11eb-9f6a-f2cc2c8c6590.png">
</p>
<p align="center">
  <a href="http://www.typescriptlang.org" rel="nofollow"><img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript"></a>
  <a href="https://github.com/styled-components/styled-components"><img src="https://img.shields.io/badge/style-%F0%9F%92%85%20styled--components-orange.svg" alt="Styled Components"></a>
  <a href="https://translate.getoutline.com/project/outline" alt="Localized"><img src="https://badges.crowdin.net/outline/localized.svg"></a>
</p>

Это форк [Outline](https://github.com/outline/outline). Код совпадает с upstream, кроме языков: в интерфейсе только английский (`en_US`) и русский (`ru_RU`). Облако на [getoutline.com](https://www.getoutline.com) — официальная сборка, не этот форк.

Официальный релиз подтягивается так:

```shell
git fetch upstream --tags
git merge vX.Y.Z
```

`upstream` — `https://github.com/outline/outline.git`. После merge нужно доперевести новые ключи из `shared/i18n/locales/en_US/translation.json`. Для счётных строк рядом с парой из английского лежат формы `_0`, `_1` и `_2`: i18next в режиме v3 выбирает их для русского.

Исходники ниже запускают Outline и связанные службы. Документация по использованию — в [руководстве](https://docs.getoutline.com/s/guide).

Если нужна своя копия или правка кода, этот репозиторий для этого и есть.

# Установка

Своя копия в рабочей конфигурации описана в [документации](https://docs.getoutline.com/s/hosting/).

Образы контейнера:

* [![Container Image Release](https://img.shields.io/docker/v/outlinewiki/outline?sort=semver&label=Latest%20release)](https://hub.docker.com/r/outlinewiki/outline)
* [![Container Image Nightly](https://img.shields.io/docker/v/outlinewiki/outline?sort=date&label=Latest%20development%20version)](https://hub.docker.com/r/outlinewiki/outline)

Вопросы и правки к документации — тред в [GitHub Discussions](https://github.com/outline/outline/discussions).

# Участие в разработке

> **Замечание.** Не присылайте pull request, сгенерированные ИИ. В upstream приходит много массовых слабых PR от Claude, ChatGPT и Copilot от людей, которые не разбирались в коде. Такие запросы почти никогда нельзя влить, а время на ревью тратится зря. Если хотите участвовать, сначала разберитесь в коде и пишите правки сами.

Перед pull request нужно согласовать подход с основной командой: создайте или прокомментируйте issue на [GitHub](https://www.github.com/outline/outline/issues). Можно написать и в [обсуждениях](https://www.github.com/outline/outline/discussions). Так подход фиксируется до кода, и эти указания будут прочитаны. Шанс, что код примут, выше.

С чего начать:

- [Перевод](docs/TRANSLATION.md) на другие языки
- Задачи с меткой [`good first issue`](https://github.com/outline/outline/labels/good%20first%20issue)
- Производительность сервера и клиента
- Удобство разработки и документация
- Ошибки и правки качества из списка на GitHub

# Разработка

Короткое руководство по [среде разработки](https://docs.getoutline.com/s/hosting/doc/local-development-5hEhFRXow7), если нужно вносить изменения в Outline.

## Архитектура

Как устроено приложение, сначала описано в [документе об архитектуре](docs/ARCHITECTURE.md).

## Отладка

В разработке Outline пишет в консоль простой журнал с префиксом категории. В рабочей среде журнал — JSON, его разбирает обычный конвейер сбора логов.

Журнал HTTP выключен. Его включает `DEBUG=http`. Все категории — `DEBUG=*`, отдельные — например `DEBUG=database` вместе с `LOG_LEVEL=debug`. Совсем подробный журнал — `LOG_LEVEL=silly`.

## Тесты

Покрытие нужно на критичных частях, а не 100% модульных тестов. Все конечные точки API и всё, что связано со входом, должно быть проверено тщательно.

Новый тест пишется на [Vitest](https://vitest.dev/) в файле `.test.ts` рядом с проверяемым кодом.

```shell
# Все тесты
make test

# Серверные тесты в режиме наблюдения
make watch
```

После того как `make test` создаст тестовую базу, клиент и сервер можно гонять напрямую через vitest:

```shell
# Серверные тесты
yarn test:server

# Один серверный тест в режиме наблюдения
yarn test path/to/file.test.ts --watch

# Клиентские тесты
yarn test:app
```

## Миграции

Миграции создаёт и запускает Sequelize:

```shell
yarn db:create-migration --name my-migration
yarn db:migrate
yarn db:rollback
```

Миграции тестовой базы:

```shell
yarn db:migrate --env test
```

# Лицензия

Outline распространяется по [BSL 1.1](LICENSE).
