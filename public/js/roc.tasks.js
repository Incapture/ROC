var tasks = (function() {
	"use strict";

	return {
		country_datatable_numId_greaterThan500: function(value, data, cell, row, options) {
			if (value > 500)
				return "<span style='color: green; font-weight: bold;'>" + value + "</span>";
			else
				return value;
		},
		country_datatable_id_styleAsLink: function(value, data, cell, row, options) {
			return "<span style='color: blue; text-decoration: underline;'>" + value + "</span>";
		},
		country_datatable_id_showInfo: function(e, cell, value, data) {
			if (!roc.dom().find("div[view_id^='window_country_" + value + "']")[0]) {
				directives.createWidget({
					script: "/webscript/main2",
					scriptParameters: {widget: "default/form/country" , widgetParams: {entity: "/country/"+value, info: data}}, //mocked-up values; only "info" is actually used
					parent: ($(e.currentTarget).closest("div[view_id^='window_']")).attr("view_id")
				});
			}
		}
	}
})();