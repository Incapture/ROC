var directives = (function() {
    "use strict";

    return {
        createWidget: function(params) {
            roc.apiRequest(params.script, params.scriptParameters, {
                success: function(res) {
                    var response = JSON.parse(res.text()),
                        protoViews = {},
                        widget;

                    if (response.structure.protoViews)
                        protoViews = response.structure.protoViews;

                    if (response.componentType == "datatable" && response.data.limit) {
                        roc.setLimitValue(response.data.limit);

                        roc.setSkipValue(response.data.limit);
                    }

                    try {
                        widget = directives.getLayout(response.structure.window, params.randomPositioning);

                        roc.addWindow({windowId: widget.id, parentId: params.parent});

                        directives.render({
                            widget: widget,
                            protoViews: protoViews,
                            entityUri: params.scriptParameters.widgetParams.entity,
                            raptureUri: params.scriptParameters.widgetParams.raptureUri
                        });
                    } catch(e){console.warn(e)}
                },
                failure: function() {
                    console.warn(error);
                }
            });
        },
        getLayout: function(params, randomPositioning) {
            var layout = {},
                count = params.count,
                components = params.components,
                top,
                left,
                adjustedTop;

            for (var property in params.properties) {
                if (params.properties.hasOwnProperty(property)) {
                    if (property === "left") left = params.properties["left"];

                    if (property === "top") top = params.properties["top"];

                    layout[property] = params.properties[property];
                }
            }

            if (randomPositioning) {
                if (randomPositioning.left)
                    layout["left"] = directives.getRandomInt(randomPositioning.left.min, randomPositioning.left.max)
                if (randomPositioning.top)
                    layout["top"] = directives.getRandomInt(randomPositioning.top.min, randomPositioning.top.max)
            }

            if (count.rows && count.rows > 0) {
                var rows = [];

                for (var i = 0; i < count.rows; i++) {
                    var row = {},
                        cols = [],
                        idx,
                        component;

                    for (var j = 0; j < count["row"+i+"_cols"]; j++) {
                        idx = i.toString() + j.toString();

                        component = components[idx];

                        cols.push(components[idx]);
                    }

                    row.cols = cols;

                    rows.push(row);
                }

                if (params.properties.view === "window") {
                    layout["head"] = params.components["head"];

                    layout["body"] = {
                        rows: rows
                    };
                }
                else
                    layout["rows"] = rows;
            }

            return layout;
        },
        setProtoUI: function(protoView) {
            webix.protoUI({
                name: protoView.name,
                $init: function(config){
                    this.$view.innerHTML = protoView.innerHtml;                           
                },
            }, webix.ui.view);
        },
        getTabulator: function(tabulatorInfo) {
            var tabulator = {};

            tabulator.id = tabulatorInfo.id;

            for (var i = 0; i < tabulatorInfo.config.columns.length; i++) {
                // formatting
                if (tabulatorInfo.formatter && tabulatorInfo.formatter[tabulatorInfo.config.columns[i]["id"]])
                    tabulatorInfo.config.columns[i]["formatter"] = eval(tabulatorInfo.formatter[tabulatorInfo.config.columns[i]["id"]]);

                // onClick
                if (tabulatorInfo.onClick && tabulatorInfo.onClick[tabulatorInfo.config.columns[i]["id"]])
                    tabulatorInfo.config.columns[i]["onClick"] = eval(tabulatorInfo.onClick[tabulatorInfo.config.columns[i]["id"]]);

                // make specified columns editable
                if (tabulatorInfo.editableColumns && tabulatorInfo.config.rowEdit) {
                    for (var j = 0; j < tabulatorInfo.editableColumns.length; j++) {
                        if (tabulatorInfo.config.columns[i]["id"] == tabulatorInfo.editableColumns[j]) {
                            tabulatorInfo.config.columns[i]["editable"] = true;

                            break;
                        }
                    }

                    tabulatorInfo.config.rowEdit = eval(tabulatorInfo.config.rowEdit);
                }
            }

            tabulator.config = tabulatorInfo.config;

            tabulator.data = tabulatorInfo.data;

            tabulator.filter = tabulatorInfo.filter;

            return tabulator;
        },
        getAceEditor: function(aceEditorInfo) {
            var aceEditor = {};

            aceEditor.id = aceEditorInfo.id;

            aceEditor.data = aceEditorInfo.data;

            aceEditor.mode = aceEditorInfo.mode;

            return aceEditor;
        },
        getFlowchart: function(flowchartInfo) {
            var flowchart = {};

            flowchart.id = flowchartInfo.id;

            return flowchart;
        },
        render: function(params) {
            var tabulators = [],
                _thisElem,
                tabulatorColumnHeaders,
                aceEditors = [],
                flowcharts = [];

            if (params.widget) {
                if (!params.protoViews)
                    webix.ui(params.widget).show();
                else {
                    for (var key in params.protoViews) {
                        if (params.protoViews.hasOwnProperty(key))                        
                            directives.setProtoUI(params.protoViews[key]);

                        switch (params.protoViews[key]["name"]) {
                            case "aceEditor":
                                aceEditors.push(directives.getAceEditor(params.protoViews[key]));

                                break;
                            case "mermaidFlowchart":
                                flowcharts.push(directives.getFlowchart(params.protoViews[key]));

                                break;
                            case "tabulator":
                                tabulators.push(directives.getTabulator(params.protoViews[key]));

                                break;
                        }
                    }

                    _thisElem = webix.ui(params.widget);

                    _thisElem.show();

                    // set z-index such that this window is top-most
                    // also, add entity uri as an attribute
                    $(_thisElem.$view).css("z-index", webix.ui.zIndex()).attr("data-entity-uri", params.entityUri).attr("data-rapture-uri", params.raptureUri);

                    if (tabulators.length > 0) {
                        for (var idx = 0; idx < tabulators.length; idx++) {
                            $("#" + tabulators[idx]["id"]).tabulator(tabulators[idx]["config"]);

                            $("#" + tabulators[idx]["id"]).tabulator("setData", tabulators[idx]["data"]);

                            if (tabulators[idx]["filter"]) {
                                $("#" + tabulators[idx]["id"]).tabulator("setFilter", tabulators[idx]["filter"][0], tabulators[idx]["filter"][1], tabulators[idx]["filter"][2]);
                            }

                            // extra attributes for column headers:
                            tabulatorColumnHeaders = tabulators[idx]["config"]["columns"];

                            for (var j = 0; j < tabulatorColumnHeaders.length; j++) {
                                var value = tabulatorColumnHeaders[j]["field"],
                                    columnHeader = $($("#" + tabulators[idx]["id"]).find("div.tabulator-col[data-field^='" + value + "']"))[0];

                                $(columnHeader).attr("data-field-type", (tabulatorColumnHeaders[j]["fieldType"]).toLowerCase()).attr("data-validation-script", tabulatorColumnHeaders[j]["validationScript"]);
                            }
                        }
                    }

                    if (aceEditors.length > 0) {
                        for (var idx = 0; idx < aceEditors.length; idx++) {
                            var editor = ace.edit(aceEditors[idx]["id"]);

                            editor.setTheme("ace/theme/twilight");

                            editor.getSession().setMode(aceEditors[idx]["mode"]);

                            editor.$blockScrolling = Infinity;

                            editor.setValue(aceEditors[idx]["data"], -1);
                        }
                    }

                    if (flowcharts.length > 0) {
                        for (var idx = 0; idx < flowcharts.length; idx++)
                            mermaid.init(undefined, $("div[id^='" + flowcharts[idx]["id"] + "']"));
                    }
                }
            }
        },
        // setting data for components that have already-defined structures
        // (and have a corresponding element present in the DOM) 
        setData: function(params) {
            roc.apiRequest(params.script, params.scriptParameters, {
                success: function(res) {
                    var response = JSON.parse(res.text());

                    $$(params.element).define("data", response.componentData);
                },
                failure: function(error) {
                    console.warn(error);
                }
            });
        },
        createWebixAlert: function(type, msg, duration) {
            webix.message({
                type: type,
                text: msg,
                expire: duration
            });
        },
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        bringForward: function(elem) {
            $(elem).css("z-index", webix.ui.zIndex());
        }
    }
}());
