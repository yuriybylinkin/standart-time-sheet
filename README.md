# standart-time-sheet

Скрипт для **tampermonkey** для автоматической подгрузки и отображения статусов задач на странице **Табель трудозатрат** на сайте **https://standart.nikamed.ru/**
Скрипт следит за изменениями страницы и заменяет поле Ресурс на поле статус, убирает колонки дата начала и срок, добавляет колонку Последний комментарий, куда помещает последний комментарий из задачи.

## Установка скрипта

1. Установить расширение https://www.tampermonkey.net/ в ваш браузер.
2. В расширении нажать на **Создать новый скрипт**
3. Заменить текст скрипта содержимым файла **standart-time-sheet.user.js** из раздела **[Релизы](https://github.com/yuriybylinkin/standart-time-sheet/releases/)**
4. Во вкладке Настройки скрипта установить значение параметра **Запускать только в верхнем фрейме** - Нет (страницы стандарта устроены из множества фреймов, нужно обрабатывать все)
5. Включить скрипт и наслаждаться.

## Обновление скрипта

При открытии последнего варианта скрипта из раздела **Релизы** **tampermonkey** сам предложит обновить скрипт, нужно нажать на **Переустановить**.

## Замечания и предложения

Присылайте на yuriy.bylinkin@gmail.com
