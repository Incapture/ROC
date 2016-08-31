var roc = (function() {
	"use strict";

	var loginStatus,
		uiBindings = {
		"default": {
			"pageLayout": ""	// for now, not-logged-in type components (pageLayout, login form etc. will be set in JS, no reflex)
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




/*(function(){
	"use strict";

	console.log("beginnings");

	var roc = {};

	// api calls
	roc.apiRequest = function apiRequest(scriptEndPoint, scriptParameters, parameters) {
	    var promise;

	    promise = webix.ajax().get(scriptEndPoint, scriptParameters);
	    // parameter null check needed?
	    
	    promise.then(function(response) {
	        if (parameters.success) parameters.success(response);
	    }, function(XmlHttpRequest) {
	        if (parameters.failure) parameters.failure(XmlHttpRequest);
	    });  
	};
}());*/
