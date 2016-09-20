var directives = (function() {
    "use strict";

    return {
        getLayout: function(params, clickActions) {
            var layout = {},
                count = params.count,
                components = params.components;

            for (var property in params.properties) {
                if (params.properties.hasOwnProperty(property)) {
                    layout[property] = params.properties[property];
                }
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

                        if (clickActions && clickActions[component.id])
                            component.onClick = clickActions[component.id];

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

            tabulator.config = {
                height: tabulatorInfo.height,
                fitColumns: tabulatorInfo.fitColumns,
                groupBy: tabulatorInfo.groupBy,
                columns: tabulatorInfo.columns,
                sortDir: tabulatorInfo.sortDir
            };

            tabulator.data = tabulatorInfo.data;

            return tabulator;
        },
        render: function(params) {
            var tabulators = [];

            if (params.widget) {
                if (!params.protoViews)
                    webix.ui(params.widget).show();
                else {
                    for (var key in params.protoViews) {
                        if (params.protoViews.hasOwnProperty(key))                        
                            directives.setProtoUI(params.protoViews[key]);

                            // maintain a list of tabulator components within the window
                            if (params.protoViews[key]["name"] == "tabulator")
                                tabulators.push(directives.getTabulator(params.protoViews[key]));
                    }

                    webix.ui(params.widget).show();

                    if (tabulators.length > 0) {
                        for (var idx = 0; idx < tabulators.length; idx++) {

                            $("#" + tabulators[idx]["id"]).tabulator(tabulators[idx]["config"]);

                            $("#" + tabulators[idx]["id"]).tabulator("setData", tabulators[idx]["data"]);
                        }
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
        }
    }
}());
