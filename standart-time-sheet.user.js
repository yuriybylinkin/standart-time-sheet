@@ -0,0 +1,54 @@ 
// ==UserScript==
// @name         STANDART TIME SHEET
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  this script replace department's name value task status in time sheet page
// @author       yuriy.bylinkin@gmail.com
// @match        https://standart.nikamed.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nikamed.ru
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(function() {
        function main()
        {

            const rows = document.querySelectorAll("div.workarea-row.ng-star-inserted");
            rows.forEach((row) => {
                const tasks = row.querySelectorAll("performers-title-component");
                tasks.forEach((task) => {
                    var number_task = task.children[0].innerHTML;
                    var link = 'https://standart.nikamed.ru/app/v1.0/api/feeds/task/' + number_task;

                    let req = new XMLHttpRequest();
                    req.open('GET', link, true);
                    req.send();
                    req.onreadystatechange = function() {
                        if(req.readyState == 4 && req.status == 200) {
                            let responseText = req.responseText;
                            var begin = responseText.indexOf('stateDescription') + 16;
                            var responseText_end = responseText.slice(begin);
                            var end = responseText_end.indexOf(',') - 1;
                            var status = responseText_end.slice(3, end);

                            const dimensionsDiv = document.createElement('span');
                            const dimensionsContent = document.createTextNode(' /' + status + '/');
                            dimensionsDiv.appendChild(dimensionsContent);

                            const targets = row.querySelectorAll("div.workarea-cell.resource-cell");
                            targets.forEach((target) => {
                                target.innerHTML = status;
                            });

                            //task.children[0].appendChild(dimensionsDiv);
                        }
                    }
                });
            });
        }

        main()}, 7000);
})();\ No newline at end of file
