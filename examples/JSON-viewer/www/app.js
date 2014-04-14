/*
 * xjade-example
 * https://github.com/dorny/xjade-example
 *
 * Copyright (c) 2014 Michal Dorner
 * Licensed under the MIT license.
 */

require(['tpl/json','lib/domReady!'],function (templateJSON) {

    var btn = document.getElementById('button');
    var text = document.getElementById('input');
    var root = document.getElementById('json-view');

    var stored = localStorage.getItem('xjade-example-text');
    if (stored) {
        // load last used text from localStorage
        text.value = stored;
    }
    else {
        // default JSON text
        text.value = JSON.stringify({
            name:"xjade-example-json",
            version:"0.0.1",
            description: "JSON Viewer"}
        );
    }

    var render = function(){
        localStorage.setItem('xjade-example-text',text.value);
        var obj;
        try {
            obj = JSON.parse(text.value);
        } catch (e) {
            alert('Invalid JSON');
            return;
        }

        // lazy way to delete all root content
        root.innerHTML = '';

        console.time('XJade render');
        templateJSON.render(root, obj);
        console.timeEnd('XJade render');
    };

    btn.addEventListener('click', render, false);
    render();
});
