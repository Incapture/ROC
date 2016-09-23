var tasks = (function() {
	"use strict";

	return {
		country_datatable_numId_greaterThan500: function(value, data, cell, row, options) {
			if (value > 500)
				return "<span style='color:green; font-weight:bold;'>" + value + "</span>"
			else
				return value;
		},
		country_datatable_id_showInfo: function(e, cell, value, data) {
			roc.apiRequest("/webscript/main2", {widget: "default/form/country" , widgetParams: {entity: "/country/"+value, info: data}}, {
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
	}
})();