var roc = (function() {
	"use strict";

	var loginStatus,
		uiBindings = {
			"default": {
				"pageLayout": "",	// for now, not-logged-in type components (pageLayout, login form etc. will be set in JS, not reflex)
				"menu": "/webscript/menu/rocmenu"
			},
			"userManagement": {
				"datatable": "/webscript/window/userList"
			}
		};	// e.g. of getting specific value: roc.getUiBindingScript("default", "pageLayout") //TODO: change comment example since "default", "pageLayout" is not a valid combination

	return {
		apiRequest: function (scriptEndPoint, scriptParameters, parameters) {
		    var promise;

		    promise = webix.ajax().get(scriptEndPoint, scriptParameters);
		    
		    promise.then(function(response) {
		        if (parameters.success) parameters.success(response);
		    }, function(XmlHttpRequest) {
		        if (parameters.failure) parameters.failure(XmlHttpRequest);
		    });
		},
		setLoginStatus: function (status){
			loginStatus = status;
		},
		isLoggedIn: function () {
			return loginStatus;
		},
		getUiBindingScript: function(concept, uiComponent) {
			return uiBindings[concept][uiComponent];
		}
	};
}());
