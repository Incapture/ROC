var roc = (function() {
	"use strict";

	var loginStatus;

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
		setLoginStatus: function(status) {
			loginStatus = status;
		},
		isLoggedIn: function () {
			return loginStatus;
		}
	};
}());
