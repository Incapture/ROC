(function() {
    "use strict";

    var clickHandlers = {
        page: {
            hamburgerMenuClick: function(menuId) {
                $$(menuId).toggle();
            },
            menuItemOnAfterSelect: function(id, menuId) {
                var item = $$(menuId).getItem(id),
                    scriptParameters = item.entity ? {entity: item.entity} : {};

                directives.showWindow({
                    margin: {
                        left: 205,
                        top: 45
                    },
                    dimensions: {
                        width: 1200,
                        height: 500
                    },
                    title: item.value,
                    id: id,
                    script: roc.getUiBindingScript(item.concept, item.type),
                    scriptParameters: scriptParameters,
                    componentType: item.type,
                    clickActions: item.clickActions
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

                                directives.setComponentData({
                                    concept: "default",
                                    componentType: "menu"
                                });
                            }
                            else {
                                $$(feedbackId).config.label = "<span class='error-text'><span class='webix_icon fa-exclamation'></span> " + response.error + "</span>";

                                $$(feedbackId).refresh();
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
        },
        userManagement: {
            "edit-user": function(ev, id) {
                var elem = $$(this.config.id);

                directives.showWindow({
                    margin: {
                        left: 500,
                        top: 200
                    },
                    dimensions: {
                        width: 400,
                        height: 200
                    },
                    position: "center",
                    title: "Editing " + elem.getItem(id.row).user,
                    id: "user_" + elem.getItem(id.row).user,
                    script: roc.getUiBindingScript("userManagement", "form"),
                    scriptParameters: {"username": elem.getItem(id.row).user},
                    componentType: "form",
                    clickActions: clickHandlers.userManagement
                });
            },
            "delete-user": function(ev, id) {
                console.log("TODO: delete (disable) this user -- with a confirmation modal");
            }
        }
    };

    directives.setPageLayout({
        pageLayoutId: "mainView",
        title: "Rapture Operator Console",
        menuId: "menu",
        menuClick: clickHandlers.page.hamburgerMenuClick,
        menuItemOnAfterSelect: clickHandlers.page.menuItemOnAfterSelect,
        logoutAction: clickHandlers.authentication.logout
    });

    roc.apiRequest("/webscript/whoami", null, {
        success: function(res) {
            //var response = res.text(); TODO: set other user-related values?

            directives.setComponentData({
                concept: "default",
                componentType: "menu"
            });

            roc.setLoginStatus(true);
        },
        failure: function(error) {
            roc.setLoginStatus(false);

            console.warn(error);

            directives.initializeLogin({
                windowId: "loginWindow",
                formId: "loginForm",
                feedbackId: "loginFeedback",
                loginAction: clickHandlers.authentication.login
            });

            $$("loginWindow").show();
        }
    });
}());
