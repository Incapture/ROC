var tasks = (function() {
	"use strict";

	return {
		datatable_country_numId_greaterThan500: function(value, data, cell, row, options) {
			if (value > 500)
				return "<span style='color: green; font-weight: bold;'>" + value + "</span>";
			else
				return value;
		},
		datatable_country_id_styleAsLink: function(value, data, cell, row, options) {
			return "<span style='color: blue; text-decoration: underline;'>" + value + "</span>";
		},
		datatable_country_id_showInfo: function(e, cell, value, data) {
			console.log(e.currentTarget);
			if (!roc.dom().find("div[view_id^='window_country_" + value + "']")[0]) {
				directives.createWidget({
					script: "/webscript/main2",
					scriptParameters: {widget: "default/form/country" , widgetParams: {entity: "/country/"+value, info: data}}, //mocked-up values; only "info" is actually used
					parent: ($(e.currentTarget).closest("div[view_id^='window_']")).attr("view_id")
				});
			}
		},
		datatable_getMoreData: function(buttonViewId, parentViewId, tabulatorElement) {
			var tabulatorId = $(tabulatorElement)[0].id,
				limit = roc.getLimitValue(),
				skip = roc.getSkipValue(),
				item = $$(parentViewId).getSelectedItem();

			roc.apiRequest("/webscript/main", {
					widget: item.widget,
					widgetParams: {
						entity: item.params.entity,
						skip: roc.getSkipValue(),
						limit: item.params.limit
					},
					onlyData: true
				}, {
					success: function(res) {
						var response = JSON.parse(res.text());

						if (response.data.data.length) {
							if (response.data.limit) {
								roc.setLimitValue(response.data.limit);

								roc.setSkipValue(response.data.limit);
							}

							for (var i = 0; i < response.data.data.length; i++)
								$("#" + tabulatorId).tabulator("addRow", response.data.data[i]);

							$("#" + tabulatorId).tabulator("setPageSize", response.data.limit);

							if (!response.data.moreData)
								$$(buttonViewId).disable();
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		datatable_filterData: function(buttonViewId, parentViewId, tabulatorElement, formViewId, moreButtonViewId) {
			console.log($$(formViewId).getValues()["where_clause"]);
			var tabulatorId = $(tabulatorElement)[0].id,
				limit = roc.getLimitValue(),
				skip = 0,
				item = $$(parentViewId).getSelectedItem();

			roc.apiRequest("/webscript/main", {
					widget: item.widget,
					widgetParams: {
						entity: item.params.entity,
						skip: skip,
						limit: item.params.limit,
						whereClause: $$(formViewId).getValues()["where_clause"]
					},
					onlyData: true
				}, {
					success: function(res) {
						var response = JSON.parse(res.text());

						if (response.data.data.length) {
							if (response.data.limit) {
								roc.setLimitValue(response.data.limit);

								roc.setSkipValue(response.data.limit);
							}

							$("#" + tabulatorId).tabulator("setData", response.data.data);

							if (!response.data.moreData)
								$$(buttonViewId).disable();
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		}
	}
})();
