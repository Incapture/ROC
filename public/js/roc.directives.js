var directives = (function() {
    "use strict";

    var componentIds = {};

    /*var sideMenu = {
        view: "sidebar",
        id: "menu",
        data: [],
        on: {
            onAfterSelect: function(id) {
                var script = this.getItem(id).script;
                script !== "userList" ? rocWindow.show(script, {}) : rocWindow.show2(script, {});
            }
        }
    };*/

    return {
        clickHandlers: function(clickName, params) {
            return clickHandlers[clickName];
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
        setComponentData: function(params) {
            roc.apiRequest(roc.getUiBindingScript(params.concept, params.componentType), null, {
                success: function(res) {
                    $$(componentIds[params.componentType]).define('data', JSON.parse(res.text()));
                },
                failure: function(error) {
                    console.warn(error);
                }
            });
        }
    }
}());
