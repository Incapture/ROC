var app = (function() {
    "use strict";

    var clickHandlers = {
        page: {
            hamburgerMenuClick: function(menuId) {
                $$(menuId).toggle();
            },
            menuItemOnAfterSelect: function(id, menuId) {
                var item = $$(menuId).getItem(id),
                    elem = roc.dom().find("div[view_id^='window_" + id.split("_")[1] + "']")[0];

                if (!elem) {
                    directives.createWidget({
                        script: "/webscript/main",
                        scriptParameters: {widget: item.widget, widgetParams: item.params},
                        randomPositioning: false
                    });
                }
                else
                    directives.bringForward(elem);
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

                                roc.setLoginStatus(true);

                                roc.apiRequest("webscript/retrieveWorkspace", {},
                                    {
                                        success: function(res) {
                                            var response = JSON.parse(res.text()),
                                                windowDefinitions = null,
                                                wsMaxZIndex = 0;

                                            directives.setData({
                                                script: "/webscript/init",
                                                scriptParameters: {"widget": "//default/menu/standard"},
                                                element: "menu_main"
                                            });

                                            if (response !== "NULL") {
                                                windowDefinitions = response;

                                                for (var idx = 0; idx < windowDefinitions.length; idx++) {
                                                    wsMaxZIndex = Math.max(wsMaxZIndex, windowDefinitions[idx]["zIndex"]);

                                                    directives.createWidget({
                                                        script: windowDefinitions[idx]["script"],
                                                        scriptParameters: windowDefinitions[idx]["scriptParameters"],
                                                        parent: windowDefinitions[idx]["parent"],
                                                        randomPositioning: {
                                                            left: {
                                                                min: windowDefinitions[idx]["left"],
                                                                max: windowDefinitions[idx]["left"]
                                                            },
                                                            top: {
                                                                min: windowDefinitions[idx]["top"],
                                                                max: windowDefinitions[idx]["top"]
                                                            }
                                                        },
                                                        zIndex: windowDefinitions[idx]["zIndex"],
                                                        children: windowDefinitions[idx]["children"]
                                                    });
                                                }

                                                // webix zIndex and workspace zIndex should be in sync
                                                for (var z = webix.ui.zIndex(); z < wsMaxZIndex; z++)
                                                    webix.ui.zIndex();
                                            }
                                        },
                                        failure: function(error) {
                                            console.warn(error);
                                        }
                                    }
                                );
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
               var windows = roc.getWindows(),
                    elem,
                    workspace = [];

                for (var w in windows) {
                    if (windows.hasOwnProperty(w)) {
                        elem = $("div[view_id^='" + w + "'");

                        windows[w]["zIndex"] = parseInt(elem.css("z-index"), 10);

                        windows[w]["left"] = parseInt(elem.css("left").replace("px", ""), 10);

                        windows[w]["top"] = parseInt(elem.css("top").replace("px", ""), 10);

                        workspace.push(windows[w]);
                    }
                }

                roc.apiRequest("webscript/saveWorkspace", {
                        workspace: workspace
                    },
                    {
                        success: function(res) {
                            var response = JSON.parse(res.text());

                            if (response.success) {
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
                                            return clickHandlers.page.hamburgerMenuClick("menu_main");
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
                                id: "menu_main",
                                data: [],  // will be set after login
                                on: {
                                    onAfterSelect: function(id) {
                                        return clickHandlers.page.menuItemOnAfterSelect(id, "menu_main");
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
                element: "menu_main"
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
                                        cols: [
                                            {
                                                view: "label",
                                                label: "Rapture Operator Console",
                                                align: "center"
                                            }
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
                                                rows: [
                                                    {
                                                        height: 10
                                                    },
                                                    {
                                                        cols: [
                                                            {},
                                                            {
                                                                view: "button",
                                                                value: "Login",
                                                                css: "action-button-container",
                                                                click: function() {
                                                                    return clickHandlers.authentication.login("window_login", "loginForm", "loginFeedback")
                                                                }
                                                            },
                                                            {}
                                                        ]
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
