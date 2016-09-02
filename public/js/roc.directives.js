var directives = (function() {
    "use strict";

    var componentIds = {};

    return {
        getWindowTemplate: function(params) {
            return {
                view: "window",
                left: params.left,
                top: params.top,
                width: params.width,
                height: params.height,
                head: {
                    view: "toolbar",
                    cols: [
                        { view: "label", label: "", align: "center" },
                        { view:"button", type: "icon", icon: "times", width:30 }
                    ]
                },
                move: true,
                resize: true,
                body: {}
            }
        },
        setPageLayout: function(params) {
            var menuClick = params["menuClick"],
                menuItemOnAfterSelect = params["menuItemOnAfterSelect"];

            componentIds["menu"] = params["menuId"];

            webix.ui({
                id: params["pageLayoutId"],
                type: {
                    width: "auto"
                },
                rows: [{
                    view: "toolbar",
                    padding: 3,
                    id: "toolbar",
                    elements: [{
                        view: "button",
                        type: "icon",
                        icon: "bars",
                        width: 37,
                        align: "left",
                        css: "app_button",                        
                        click: function() {
                            return menuClick(params["menuId"]);
                        }
                    }, {
                        view: "label",
                        label: params["title"]
                    }, {
                        view: "button",
                        type: "icon",
                        width: 45,
                        css: "app_button",
                        icon: "envelope-o"
                    }, {
                        view: "button",
                        type: "icon",
                        width: 45,
                        css: "app_button",
                        icon: "bell-o"
                    }, {
                        view: "button",
                        type: "icon",
                        width: 25,
                        css: "app_button",
                        icon: "sign-out",
                        click: params["logoutAction"]
                    }]
                }, {
                    id: "body", // TODO: is this really needed?
                    cols: [
                        {
                            view: "sidebar",
                            id: params["menuId"],
                            data: [],  // will be set after login
                            on: {
                                onAfterSelect: function(id) {
                                    return menuItemOnAfterSelect(id, params["menuId"]);
                                }
                            }
                        }, 
                        {}
                    ]
                }]
            });
        },
        initializeLogin: function(params) {
            var loginAction = params["loginAction"];

            webix.ui({
                id: params["windowId"],
                view: "window",
                position: "center",
                modal: true,
                head: {
                    view: "toolbar",
                    cols: [{ 
                        view: "label",
                        label: "Login",
                        align: "center"}
                    ]
                },
                move: true,
                body: {
                    rows: [{ 
                        view: "form",
                        id: params["formId"],
                        elements: [{
                                view: "text",
                                name: "user",
                                label: "User",
                                placeholder: "Username"
                            }, {
                                view: "text",
                                name: "password",
                                label: "Password",
                                type: "password",
                                placeholder: "Password"
                            }, {
                                margin: 5,
                                cols: [{
                                    view: "button",
                                    value: "Login",
                                    click: function() {
                                        return loginAction(params["windowId"], params["formId"], params["feedbackId"])
                                    }
                                }, {
                                    view: "button",
                                    value: "Cancel"
                                }]
                            }, { 
                                view: "label",
                                id: params["feedbackId"],
                                label: "",
                                align: "center"
                            }]
                    }]
                }
            });
        },
        
        showEntityWindow: function(params) {
            // Show a window that displays information about entities - a tree table
            // params.entityUri is the entity to display
            var _thisWindow = JSON.parse(JSON.stringify(directives.getWindowTemplate(params)));
            // Compute initial view
            roc.apiRequest('/webscript/entity/entityInfo', { id : '/', entityUri : params.entityUri }, {
               success : function(res) {
                   var response = JSON.parse(res.text);
                   _thisWindow.id = params.id;
                   _thisWindow.head.cols[0].label = params.title;
                   _thisWindow.head.cols[1].click = "$$('" + params.id + "').close();";
                   // Now we need to inject into a standard template our columns,
                   // our data, and also modify the data to allow for cell clicking if a column
                   // is an entityKey
                   // We also need to bind the expandData request thing to call a function that makes another
                   // entityInfo call
                   webix.ui(_thisWindow).show();
               } 
            });
        },
        showWindow: function(params) {
            var _thisWindow = JSON.parse(JSON.stringify(directives.getWindowTemplate(params)));

            roc.apiRequest(params.script, params.scriptParameters, {
                success: function(res) {
                    var response = JSON.parse(res.text());

                    _thisWindow.id = params.id;

                    _thisWindow.head.cols[0].label = params.title;

                    _thisWindow.head.cols[1].click = "$$('" + params.id + "').close();";

                    setupContent(params.componentType, response.structure, response.data);

                    function setupContent(componentType, structure, data) {
                        var content = {};

                        content.id = response.componentId;

                        content.view = componentType;

                        switch(componentType) {
                            case "datatable":
                                content.columns = structure;

                                break;
                            case "form":
                                content.elements = structure;

                                break;
                            default:
                                console.warn("not a valid component type");

                                break;
                        }

                        if (data) content.data = data;

                        content.onClick = params.clickActions;

                        if (params.position) _thisWindow.position = params.position;

                        _thisWindow.body = content;

                        webix.ui(_thisWindow).show();
                    }
                },
                failure: function(error) {
                    console.warn(error);
                }
            });
        },
        // for non-window components
        setComponentData: function(params) {
            roc.apiRequest(roc.getUiBindingScript(params.concept, params.componentType), null, {
                success: function(res) {
                    $$(componentIds[params.componentType]).define("data", JSON.parse(res.text()));
                },
                failure: function(error) {
                    console.warn(error);
                }
            });
        }
    }
}());
