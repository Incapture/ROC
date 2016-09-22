var app = (function() {
    "use strict";

    var clickHandlers = {
        page: {
            hamburgerMenuClick: function(menuId) {
                $$(menuId).toggle();
            },
            menuItemOnAfterSelect: function(id, menuId) {
                var item = $$(menuId).getItem(id);

                roc.apiRequest("/webscript/main", {widget: item.widget, widgetParams: item.params}, {
                    success: function(res) {
                        var response = JSON.parse(res.text()),
                            clickActions = {},
                            protoViews = {};

                        if (response.structure.clickableComponents) {
                            for (var idx = 0; idx < response.structure.clickableComponents.length; idx++) {
                                if (clickHandlers[response.structure.clickableComponents[idx]])
                                    clickActions[response.structure.clickableComponents[idx]] = clickHandlers[response.structure.clickableComponents[idx]];
                            }
                        }

                        if (response.structure.protoViews)
                            protoViews = response.structure.protoViews;

                        directives.render({widget: directives.getLayout(response.structure.window, clickActions), protoViews: protoViews});
                    },
                    failure: function() {
                        console.warn(error);
                    }
                });
            }
        },
        authentication: {
            login: function(windowId, formId, feedbackId) {
                roc.apiRequest("/login/login", {
                        user: $$(formId).getValues().user,
                        password: MD5($$(formId).getValues().password)
                    }, {
                        success: function(res) {
                            var response = JSON.parse(res.text());

                            if (!response.error) {
                                $$(windowId).close();

                                directives.setData({
                                    script: "/webscript/init",
                                    scriptParameters: {"widget": "//default/menu/standard"},
                                    element: "menu-main"
                                });

                                roc.setLoginStatus(true);

                                directives.setComponentData({
                                    concept: "default",
                                    componentType: "menu"
                                });
                            }
                            else {
                                $$(feedbackId).config.label = "<span class='error-text'><span class='webix_icon fa-exclamation'></span> " + response.error + "</span>";

                                $$(feedbackId).refresh();

                                roc.setLoginStatus(false);
                            }
                        },
                        failure: function(error) {
                            console.warn(error);
                        }
                    }
                );
            },
            logout: function() {
                roc.apiRequest("/login/logout", {
                        redirect: "/index.html"
                    }, {
                        success: function(res) {
                            var response = JSON.parse(res.text());

                            if (response.redirect) {
                                window.location.href = response.redirect;
                            }
                            else {
                                console.warn("redirect not set");
                            }
                        },
                        failure: function(error) {
                            console.warn(error);
                        }
                    }
                );
            }
        }
    };

    // main layout
    // components are laid out in a grid fashion
    // "00" -> element that should be placed in row0, col0,
    // "10" -> element that should be placed in row1, col0, and so on.
    // important to define the "count" object with row count and corresponding columns-in-row counts
    directives.render({
        widget: directives.getLayout({
                        properties: {
                            id: "layout-main",
                            type: {width: "auto"}
                        },
                        count: {
                            rows: 2,
                            row0_cols: 1,
                            row1_cols: 2
                        },
                        components: {
                            "00": {
                                view: "toolbar",
                                padding: 3,
                                id: "navbar",
                                cols: [
                                    {
                                        view: "button",
                                        type: "icon",
                                        icon: "bars",
                                        width: 37,
                                        align: "left",
                                        css: "app_button",
                                        click: function() {
                                            return clickHandlers.page.hamburgerMenuClick("menu-main");
                                        }
                                    },
                                    {
                                        view: "label",
                                        label: "Rapture Operator Console",
                                        align: "left"
                                    },
                                    {
                                        view: "button",
                                        type: "icon",
                                        width: 25,
                                        css: "app_button",
                                        icon: "sign-out",
                                        click: clickHandlers.authentication.logout
                                    }
                                ]
                            },
                            "10": {
                                view: "sidebar",
                                id: "menu-main",
                                data: [],  // will be set after login
                                on: {
                                    onAfterSelect: function(id) {
                                        return clickHandlers.page.menuItemOnAfterSelect(id, "menu-main");
                                    }
                                }
                            },
                            "11": {
                                id: "canvas"
                            }
                        }
                    })
    });

    roc.apiRequest("/webscript/whoami", null, {
        success: function(res) {
            //var response = res.text(); TODO: set other user-related values?

            directives.setData({
                script: "/webscript/init",
                scriptParameters: {"widget": "//default/menu/standard"},
                element: "menu-main"
            });

            roc.setLoginStatus(true);
        },
        failure: function(error) {
            roc.setLoginStatus(false);

            console.warn(error);

            // login form layout
            directives.render({
                widget: directives.getLayout({
                                properties: {
                                    id: "window_login",
                                    view: "window",
                                    position: "center",
                                    modal: true,
                                    move: true
                                },
                                count: {
                                    rows: 1,
                                    row0_cols: 1
                                },
                                components: {
                                    "head": {
                                        view: "toolbar",
                                        cols: [{
                                            view: "label",
                                            label: "Login",
                                            align: "center"}
                                        ]
                                    },
                                    "00": {
                                        view: "form",
                                        id: "loginForm",
                                        elements: [
                                            {
                                                view: "text",
                                                name: "user",
                                                label: "User",
                                                placeholder: "Username"
                                            },
                                            {
                                                view: "text",
                                                name: "password",
                                                label: "Password",
                                                type: "password",
                                                placeholder: "Password"
                                            },
                                            {
                                                margin: 5,
                                                cols: [
                                                    {
                                                        view: "button",
                                                        value: "Login",
                                                        click: function() {
                                                            return clickHandlers.authentication.login("window_login", "loginForm", "loginFeedback")
                                                        }
                                                    }, 
                                                    {
                                                        view: "button",
                                                        value: "Cancel"
                                                    }
                                                ]
                                            },
                                            {
                                                view: "label",
                                                id: "loginFeedback",
                                                label: "",
                                                align: "center"
                                            }]
                                    }
                                }
                            })
            });
        }
    });
}());
