(function() {
    "use strict";

    var clickHandlers = {
        page: {
            hamburgerMenuClick: function(menuId) {
                $$(menuId).toggle();
            },
            menuItemOnAfterSelect: function() {
                var script = this.getItem(id).script;

                script !== "userList" ? rocWindow.show(script, {}) : rocWindow.show2(script, {});
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
        }               
    };

    directives.setPageLayout({
        pageLayoutId: "mainView",
        title: "RBS Transaction Warehouse",
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

            console.log(response);

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
