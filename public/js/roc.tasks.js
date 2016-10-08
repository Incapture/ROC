var tasks = (function() {
	"use strict";

	return {
		datatable_country_numId_greaterThan500: function(value, data, cell, row, options) {
			if (value > 500)
				return "<span style='color: green; font-weight: bold;'>" + value + "</span>";
			else
				return value;
		},
		datatable_country_ccy_styleAsLink: function(value, data, cell, row, options) {
			return "<span style='color: blue; text-decoration: underline;'>" + value + "</span>";
		},
		datatable_country_ccy_showInfo: function(e, cell, value, data) {
			if (!roc.dom().find("div[view_id^='window_currency_" + value + "']")[0]) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/form/currency" , widgetParams: {entity: "//standard/currency", key: value}},
					parent: ($(e.currentTarget).closest("div[view_id^='window_']")).attr("view_id"),
					steerClear: true
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

							!response.data.moreData ? $$(moreButtonViewId).disable() : $$(moreButtonViewId).enable();
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		row_edit: function(id, data, row) {
			var entityUri = $(row[0]).closest("div[view_id^='window_']").attr("data-entity"),
				tabulatorId = $(row[0]).closest(".tabulator").attr("id"),
				tabulatorElem = $(($("#" + tabulatorId))[0]),
				columnHeaders,
				columnHeader,
				regex,
				makeRequest = true;

			columnHeaders = tabulatorElem.find("div.tabulator-col");

			// data validation
			for (var idx = 0; idx < columnHeaders.length; idx++) {
				columnHeader = $(columnHeaders[idx]);

				regex = "";

				switch(columnHeader.attr("data-field-type")) {
					case "number":
						regex = /^[0-9]+$/; // for floats: /^(?=.)([0-9]*)(\.([0-9]+))?$/;

						if (regex.test(data[columnHeader.attr("data-field")]))
							data[columnHeader.attr("data-field")] = parseInt(data[columnHeader.attr("data-field")]);
						else {
							directives.createWebixAlert(
								"error",
								"Invalid input for <strong>" + columnHeader.attr("data-field") + "</strong>.<br>Expecting a <strong>" + columnHeader.attr("data-field-type") + "</strong>.",
								2000);

							makeRequest = false;
						}

						break;
					case "string":
						// TODO: get validation regex requirements

						break;
					default:
						console.warn("Unrecognized type.");
				}
			}

			if (makeRequest) {
				roc.apiRequest("/webscript/updateEntityDoc", {
						entityUri: entityUri,
						content: data
					}, {
						success: function(res) {
							var response = JSON.parse(res.text()),
								cells,
								dataField;

							if (!response.success) {
								// i.e. putEntityDocument wasn't successful
								// update row (cells) with previous data
								cells = $(row[0]).find(".tabulator-cell");

								for (var idx = 0; idx < cells.length; idx++) {
									dataField = $(cells[idx]).attr("data-field");

									$(cells[idx]).text(response.prevData[dataField]);
								}

								directives.createWebixAlert("error", "Update failed.", 2000);
							}
						},
						failure: function(error) {
							console.warn(error);
						}
					}
				);
			}
		}
	}
})();
