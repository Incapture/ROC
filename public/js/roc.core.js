var roc = (function() {
	"use strict";

	var loginStatus,
		windows = {},
		dom = $(document),
		skip = 0,
		limit;

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
		isLoggedIn: function() {
			return loginStatus;
		},
		addWindow: function(params) {
			if (windows[params.windowId] == null) {
				windows[params.windowId] = {
					parent: params.parentId,
					children: [],
					script: params.script,
					scriptParameters: params.scriptParameters
				};

				// add this window as a child in its parent's object
				// this is for all windows EXCEPT the ones triggered by main menu clicks (those are parent-less)
				if (windows[params.parentId])
					windows[params.parentId]["children"].push(params.windowId);

				// params.children is set ONLY while launching windows from a saved workspace definition
				// the following block is executed to account for children that might have been rendered before their parent
				if (params.children && params.children.length > 0) {
					for (var idx = 0; idx < params.children.length; idx++) {
						if (windows[params.children[idx]])
							windows[params.windowId]["children"].push(params.children[idx]);
					}
				}
			}
		},
		deleteWindow: function(windowId) {
			if (windows[windows[windowId]["parent"]]) {
				var children = windows[windows[windowId]["parent"]]["children"];

				// remove from array
				children.splice($.inArray(windowId, children), 1);
			}
			// remove object reference
			delete windows[windowId];
		},
		getWindows: function() {
			return windows;
		},
		dom: function() {
			return dom;
		},
		getSkipValue: function() {
			return skip;
		},
		setSkipValue: function(val) {
			skip += val;
		},
		getLimitValue: function() {
			return limit;
		},
		setLimitValue: function(val) {
			limit = val;
		}
	};
}());
