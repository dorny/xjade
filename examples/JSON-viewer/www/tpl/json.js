/*
 * Copyright (c) 2014 Michal Dorner
 * Licensed under the MIT license.
 *
 */

// This is actually not optimal use case of XJade.
// There is not much markup in compare to JavaScript logic,
// so take this as pure educational example.


define(function (require, exports) {

    exports.render = function render(parent,obj) {
              var __expr;
              if (parent==null) parent=document.createDocumentFragment();
              /* LINE: 16 */
              switch ((typeof obj)) {
                /* LINE: 18 */
                case 'object':
                  /* LINE: 19 */
                  if ((Array.isArray(obj))) {
                    /* LINE: 20 */
                    parent.appendChild( document.createTextNode("["));
                    /* LINE: 21 */
                    var ul$1 = document.createElement('ul');
                    ul$1.className = 'array';
                      /* LINE: 22 */
                      var __expr$2 = obj;
                      for (var i=0, l$3=__expr$2.length; i<l$3; ++i) {
                        var item = __expr$2[i];
                        /* LINE: 23 */
                        var li$4 = document.createElement('li');
                          /* LINE: 24 */
                          var div$5 = document.createElement('div');
                          div$5.className = 'value';
                            /* LINE: 25 */
                            render(div$5,item);
                            /* LINE: 27 */
                            if ((i<obj.length-1)) {
                              /* LINE: 28 */
                              div$5.appendChild( document.createTextNode(','));
                            }
                          li$4.appendChild(div$5);
                        ul$1.appendChild(li$4);
                      }
                    parent.appendChild(ul$1);
                    /* LINE: 29 */
                    parent.appendChild( document.createTextNode("]"));
                  }
                  /* LINE: 30 */
                  else {
                    /* LINE: 31 */
                    parent.appendChild( document.createTextNode("{"));
                    /* LINE: 32 */
                    var ul$6 = document.createElement('ul');
                    ul$6.className = 'object';
                      /* LINE: 33 */
                      var keys = Object.keys(obj);
                      /* LINE: 34 */
                      var __expr$7 = keys;
                      for (var i=0, l$8=__expr$7.length; i<l$8; ++i) {
                        var key = __expr$7[i];
                        /* LINE: 35 */
                        var li$9 = document.createElement('li');
                          /* LINE: 36 */
                          var span$10 = document.createElement('span');
                          span$10.className = 'key';
                          span$10.textContent = '"'+key+'": ';
                          li$9.appendChild(span$10);
                          /* LINE: 37 */
                          render(li$9,obj[key]);
                          /* LINE: 39 */
                          if ((i<keys.length-1)) {
                            /* LINE: 40 */
                            li$9.appendChild( document.createTextNode(','));
                          }
                        ul$6.appendChild(li$9);
                      }
                    parent.appendChild(ul$6);
                    /* LINE: 41 */
                    parent.appendChild( document.createTextNode("}"));
                  }
                  break;
                /* LINE: 43 */
                case 'string':
                  /* LINE: 44 */
                  var span$11 = document.createElement('span');
                  span$11.className = 'string';
                  span$11.textContent = '"'+obj+'"';
                  parent.appendChild(span$11);
                  break;
                /* LINE: 46 */
                case 'number':
                /* LINE: 47 */
                case 'boolean':
                  /* LINE: 48 */
                  var span$12 = document.createElement('span');
                  span$12.className = 'boolean';
                  span$12.textContent = obj;
                  parent.appendChild(span$12);
                  break;
                /* LINE: 50 */
                default:
                  /* LINE: 51 */
                  parent.appendChild( document.createTextNode("kokot"));
              }
              return parent;
            };
});
