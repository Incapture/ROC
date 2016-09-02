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
                body: {
                    rows: [ // TODO: does removing this work?
                        {}
                    ]
                }
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

                        switch(componentType) {
                            case "datatable":
                                content.view = componentType;

                                content.columns = structure;

                                break;
                            default:
                                console.error("not a valid component type");

                                break;
                        }

                        content.data = data;

                        _thisWindow.body = content;

                        webix.ui(_thisWindow).show();
                    }

                    /* TODO:
                    function setupClickEvents(webixConfig) {
                        webixConfig["onClick"] = rocEvents.onClick[script];
                    }*/
                },
                failure: function(error) {
                    console.warn(error);
                }
            });

            return _thisWindow;
        },
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
