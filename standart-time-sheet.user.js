// ==UserScript==
// @name         STANDART TIME SHEET
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  this script improve time sheet page
// @author       yuriy.bylinkin@gmail.com
// @match        https://standart.nikamed.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nikamed.ru
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    setInterval(function() {
        function main()
        {

            const resourcecells = document.querySelectorAll("div.header-cell.resource-cell");
            resourcecells.forEach((resourcecell) => {
                if (resourcecell.innerHTML == 'Статус') { return;}
                resourcecell.innerHTML = 'Статус';
            });

            const firstmoments = document.querySelectorAll("div.header-cell.moment-cell.first-moment");
            firstmoments.forEach((firstmoment) => {
                if (firstmoment.innerHTML == 'Последний комментарий') { return;}
                firstmoment.innerHTML = 'Последний комментарий';
                firstmoment.style.minWidth = '200px';
                firstmoment.style.maxWidth = '200px';
                firstmoment.classList.remove("moment-cell");
            });

            const secondmoments = document.querySelectorAll("div.header-cell.moment-cell.second-moment");
            secondmoments.forEach((secondmoment) => {
                secondmoment.style.display = 'none';
            });

            var refresh_total = true;


            const rows = document.querySelectorAll("div.workarea-row.ng-star-inserted");
            rows.forEach((row) => {

                //const markDiv = document.createElement('span');
                //const markContent = document.createTextNode('.');
                //markDiv.appendChild(markContent);

                //const firstChild = row.firstChild;
                //if (firstChild.innerHTML == '.') { return;};
                //row.insertBefore(markDiv, firstChild);

                const secondmoments = row.querySelectorAll("div.workarea-cell.moment-cell.second-moment");
                secondmoments.forEach((secondmoment) => {
                    if (secondmoment.style.display == 'none') { refresh_total = false; return;};
                    secondmoment.style.display = 'none';

                });

                const tasks = row.querySelectorAll("performers-title-component");
                tasks.forEach((task) => {

                    var number_task = task.children[0].innerHTML;
                    var link = 'https://standart.nikamed.ru/app/v1.0/api/feeds/task/' + number_task;
                    let req = new XMLHttpRequest();
                    req.open('GET', link, true);
                    req.send();
                    req.onreadystatechange = function() {
                        if(req.readyState == 4 && req.status == 200) {
                            let responseText = req.response;
                            var begin = responseText.indexOf('stateDescription') + 16;
                            var responseText_end = responseText.slice(begin);
                            var end = responseText_end.indexOf(',') - 1;
                            var status = responseText_end.slice(3, end);

                            const targets = row.querySelectorAll("div.workarea-cell.resource-cell");
                            targets.forEach((target) => {
                                target.innerHTML = status;
                                refresh_total = true;
                            });
                        }
                    }

                    var req_body = '{ \
"taskId": ' + number_task + ', \
"forLinkedTasks": true \
}';
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
                                firstmoment.style.minWidth = '200px';
                                firstmoment.style.maxWidth = '200px';
                                firstmoment.classList.remove("moment-cell");
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
                        //alert(elem.innerHTML);
                        for (let elem1 of elem.children) {

                            //alert(elem1.innerHTML);

                            var hour = 0;
                            var min = 0;

                            var time_text = elem1.innerHTML;
                            time_text.replace(' ', '');
                            var hour_mark = time_text.indexOf('ч.');
                            var min_mark = time_text.indexOf('мин');
                            if(hour_mark !== -1) {hour = Number(time_text.slice(0, hour_mark));};
                            if(min_mark !== -1 && hour_mark !== -1) {min = Number(time_text.slice(hour_mark + 2, min_mark));};
                            var time = hour*60 + min;
                            if(fact !== 0 && plan == 0) {plan = time;};
                            if(fact == 0) {fact = time;};

                            //alert(fact);
                            //alert(plan);

                        };
                    };
                    fact_sum = fact_sum + fact;
                    plan_sum = plan_sum + plan;
                });

                totalrow_div.innerHTML = title_totalrow + ' <b><span>' + getTimeTextFromMins(fact_sum) + ' / </span> <span>' + getTimeTextFromMins(plan_sum) + '</span></b>';};
            //totalrow.insertBefore(markDiv, totalrow_div.nextSibling);
        }

        main()}, 2000);

    function getTimeTextFromMins(mins) {
        let hours = Math.trunc(mins/60);
        let minutes = mins % 60;
        var time_text = hours + 'ч.';
        if (minutes > 0) {time_text = time_text + ' ' + minutes + 'мин';};
        return time_text;
    };
})();