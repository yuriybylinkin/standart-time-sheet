// ==UserScript==
// @name         STANDART TIME SHEET
// @namespace    http://tampermonkey.net/
// @version      0.9.6
// @description  this script improve time sheet page
// @author       yuriy.bylinkin@gmail.com
// @match        https://standart.nikamed.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nikamed.ru
// @updateURL    https://github.com/yuriybylinkin/standart-time-sheet/releases/download/v0.9/standart-time-sheet.user.js
// @downloadURL  https://github.com/yuriybylinkin/standart-time-sheet/releases/download/v0.9/standart-time-sheet.user.js
// ==/UserScript==

(function() {
    'use strict';

    setInterval(function() {
        function main()
        {



            const resourcecells = document.querySelectorAll("div.header-cell.resource-cell");
            resourcecells.forEach((resourcecell) => {

                if (resourcecell.innerHTML !== 'Ресурс') { return;}
                resourcecell.innerHTML = 'Статус';
            });

            const headercomponents = document.querySelectorAll("div.header-cell.title-cell");
            headercomponents.forEach((headercomponent) => {

                headercomponent.innerHTML = ' ';
                let element_checkbox = document.getElementById('NotClosed');
                if (!element_checkbox) {var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'NotClosed';
                let notclosedfromstorage = sessionStorage.getItem('time-sheet-header-component-not-closed');
                if (notclosedfromstorage == true.toString()) {checkbox.checked = true};
                checkbox.addEventListener('change', function(event) {sessionStorage.setItem('time-sheet-header-component-not-closed', event.target.checked); modifyRow();});

                var label = document.createElement('label');
                label.htmlFor = 'NotClosed';
                label.appendChild(document.createTextNode('Только не закрытые задачи'));

                label.appendChild(checkbox);
                headercomponent.appendChild(label);}


            });

            const firstmoments = document.querySelectorAll("div.header-cell.moment-cell.first-moment");
            firstmoments.forEach((firstmoment) => {
                if (firstmoment.innerHTML == 'Последний комментарий') { return;}
                firstmoment.innerHTML = 'Последний комментарий';
                setElementStyle(firstmoment);
            });

            const secondmoments = document.querySelectorAll("div.header-cell.moment-cell.second-moment");
            secondmoments.forEach((secondmoment) => {
                secondmoment.style.display = 'none';
            });

           modifyRow();
        }

    main()}, 2000);

    function modifyRow() {

        var refresh_total = true;

            const rows = document.querySelectorAll("div.workarea-row.ng-star-inserted");
            rows.forEach((row) => {

                const secondmoments = row.querySelectorAll("div.workarea-cell.moment-cell.second-moment");
                secondmoments.forEach((secondmoment) => {
                    if (secondmoment.style.display == 'none') { refresh_total = false; return;};
                    secondmoment.style.display = 'none';

                });

                const tasks = row.querySelectorAll("performers-title-component");
                tasks.forEach((task) => {

                    var number_task = task.children[0].innerHTML;
                    var link = 'https://standart.nikamed.ru/api/tasks/short-info?v=2.0';
                    var req_body0 = '[' + number_task + ']';
                    let req = new XMLHttpRequest();
                    req.open('POST', link, true);
                    req.responseType = 'json';
                    req.setRequestHeader('Content-Type', 'application/json');
                    req.setRequestHeader('Accept', 'application/json');
                    req.send(req_body0);
                    req.onreadystatechange = function() {
                        if(req.readyState == 4 && req.status == 200) {
                            let responses = req.response.data;

                            responses.forEach((response) => {
                                var status = response.stateDescription;
                                let notclosed = sessionStorage.getItem('time-sheet-header-component-not-closed');
                                if (notclosed == 'true' && (status == 'Завершена' || status == 'Встреча поставлена' || status == 'Встреча проведена')) {row.style.display = 'none';} else {row.style.display = 'flex';};
                                row.querySelectorAll("div.workarea-cell.resource-cell").forEach((target) => {
                                    target.innerHTML = status;
                                    refresh_total = true;
                                });
                        }
                    );
                    }
                    }

                    var req_body = '{"taskId": ' + number_task + ',"forLinkedTasks": true }';
                    let req1 = new XMLHttpRequest();
                    req1.open('POST', 'https://standart.nikamed.ru/api/comments?v=2.0', true);
                    req1.setRequestHeader('Content-Type', 'application/json');
                    req1.setRequestHeader('Accept', 'application/json');

                    req1.responseType = 'json';

                    req1.send(req_body);
                    req1.onreadystatechange = function() {
                        if(req1.readyState == 4 && req1.status == 200) {
                            let response = req1.response;
                            var comments = response.data.comments;
                            var last_comment = comments[comments.length-1];

                            var comment_text = '<p><small>' + last_comment.text + ' (<b>' + last_comment.userName + '</b>)</small></p>';

                            const firstmoments = row.querySelectorAll("div.workarea-cell.moment-cell.first-moment");
                            firstmoments.forEach((firstmoment) => {
                                firstmoment.innerHTML = comment_text;
                                setElementStyle(firstmoment);
                            });

                        }
                    }
                });
            });

            if (refresh_total == false) {return};

            const totalrow = document.querySelector("div.time-sheet-total");

            let totalrow_div = totalrow.querySelector("div.total-cell.title-cell.title-cell-total.ng-star-inserted");
            const title_totalrow = 'Общие трудозатраты ( Факт / План ):';
            if (totalrow_div.innerHTML !== 'ntc')
            {
                const data_cells = totalrow.querySelectorAll("div.data-cell.ng-star-inserted");
                var plan_sum = 0;
                var fact_sum = 0;
                data_cells.forEach((data_cell) => {
                    var plan = 0;
                    var fact = 0;
                    for (let elem of data_cell.children) {

                        var position = 0;
                        for (let elem1 of elem.children) {
                            position = position + 1;

                            var hour = 0;
                            var min = 0;

                            var time_text = elem1.innerHTML;
                            var hour_mark = time_text.indexOf('ч.');
                            var min_mark = time_text.indexOf('мин');
                            if(hour_mark !== -1) {hour = Number(time_text.slice(0, hour_mark));};
                            if(min_mark !== -1 && hour_mark !== -1) {min = Number(time_text.slice(hour_mark + 2, min_mark));};
                            var time = hour*60 + min;
                            if(position == 1) {fact = time;};
                            if(position == 2) {plan = time;};

                        };
                    };
                    fact_sum = fact_sum + fact;
                    plan_sum = plan_sum + plan;
                });

                totalrow_div.innerHTML = title_totalrow + '&nbsp; <b>' + getTimeTextFromMins(fact_sum) + ' / ' + getTimeTextFromMins(plan_sum) + '</b>';};

    };

    function getTimeTextFromMins(mins) {
        let hours = Math.trunc(mins/60);
        let minutes = mins % 60;
        var time_text = hours + 'ч.';
        if (minutes > 0) {time_text = time_text + ' ' + minutes + 'м.';};
        return time_text;
    };

    function setElementStyle(element) {
        element.style.minWidth = '200px';
        element.style.maxWidth = '200px';
        element.style.left = '300px';
    };

})();