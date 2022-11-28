// ==UserScript==
// @name         STANDART TIME SHEET
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  this script replace department's name value task status in time sheet page
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

            const headers = document.querySelectorAll("div.header-cell.resource-cell");
            headers.forEach((header) => {
                if (header.innerHTML == 'Статус') { return;}
                header.innerHTML = 'Статус';
            });

            const rows = document.querySelectorAll("div.workarea-row.ng-star-inserted");
            rows.forEach((row) => {

                const markDiv = document.createElement('span');
                const markContent = document.createTextNode('.');
                markDiv.appendChild(markContent);


                const firstChild = row.firstChild;
                if (firstChild.innerHTML == '.') { return;};
                row.insertBefore(markDiv, firstChild);

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

                            const commentDiv = document.createElement('span');
                            commentDiv.innerHTML = comment_text;

                            task.appendChild(commentDiv);
                        }
                    }
                });
            });
        }

        main()}, 2000);
})();