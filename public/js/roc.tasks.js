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
			var elem = roc.dom().find("div[view_id^='window_form_currency_" + value + "']")[0];

			if (!elem) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/form/currency" , widgetParams: {entity: "//standard/currency", key: value}},
					parent: ($(e.currentTarget).closest("div[view_id^='window_']")).attr("view_id"),
					randomPositioning: {left: {min: 1100, max: 1110}, top: {min: 45, max: 450}}
				});
			}
			else
				directives.bringForward(elem);
		},
		datatable_country_action_displayIcon: function(value, data, cell, row, options) {
			return "<i class='fa fa-pencil'></i>";
		},
		datatable_country_action_editCountryJSON: function(e, cell, value, data) {
			var elem = roc.dom().find("div[view_id^='window_editor_country_" + data.id + "']")[0];

			if (!elem) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/editor/country" , widgetParams: {entity: "//standard/country", key: data.id}},
					parent: ($(e.currentTarget).closest("div[view_id^='window_']")).attr("view_id"),
					randomPositioning: {left: {min: 100, max: 800}, top: {min: 65, max: 200}}
				});
			}
			else
				directives.bringForward(elem);
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
			var entityUri = $(row[0]).closest("div[view_id^='window_']").attr("data-entity-uri"),
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
		},
		saveDoc: function(params) {
			var editor = ace.edit(params.aceEditorId),
				annotations = editor.getSession().getAnnotations(),
				data;

			if (annotations.length)
				directives.createWebixAlert(annotations[0]["type"], annotations[0]["text"], 2000);
			else {
				data = JSON.parse(editor.getValue());

				if (params.aceEditorIdKey !== data.id)
					directives.createWebixAlert("error", "ID cannot be changed.", 2000);
				else {
					roc.apiRequest("/webscript/updateEntityDoc", {
							entityUri: $("#" + params.aceEditorId).closest("div[view_id^='window_']").attr("data-entity-uri"),
							content: data
						}, {
							success: function(res) {
								var response = JSON.parse(res.text());

								if (response.success) {
									directives.createWebixAlert("success", "Document saved.", 2000);

									if (!updateRow(data))
										console.warn("Could not update " + params.tabulatorId + ": " + response.id);
								}
								else {
									directives.createWebixAlert("error", "Failed to save. Try again.", 2000);

									if (!updateRow(response.prevData))
										console.warn("Could not update " + params.tabulatorId + ": " + response.id);
								}

								function updateRow(rowData) {
									return $("#" + params.tabulatorId).tabulator("updateRow", $("div.tabulator-row[data-id='" + response.id + "']"), rowData);
								}
							},
							failure: function(error) {
								console.warn(error);
							}
						}
					);
				}
			}
		},
		showScriptContent: function(id) {
			var tokens = id.split("//"),
				elem = roc.dom().find("div[view_id^='window_editor_script_" + tokens[1] + "']")[0];

			if (!elem) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/editor/script" , widgetParams: {key: tokens[1], raptureUri: tokens[1]}},
					parent: ($(this.$view).closest("div[view_id^='window_']")).attr("view_id"),
					randomPositioning: {left: {min: 100, max: 500}, top: {min: 65, max: 200}}
				});
			}
			else
				directives.bringForward(elem);
		},
		scriptTreeItemClick: function() {
			var item = this.getSelectedItem();

			if (item.type === "file")
				tasks.showScriptContent(item.id);
		},
		runScript: function() {
			var elem = roc.dom().find("div[view_id^='window_output_script']")[0],
				scriptPath = (($(this.$view).closest("div[view_id^='window_']")).attr("data-rapture-uri")),
				aceEditorId = "aceEditor_script_" + scriptPath,
				editor = ace.edit(aceEditorId),
				editorScriptContent = editor.getValue();

			if (!elem) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/textarea/script_output" , widgetParams: {scriptPath: scriptPath, scriptContent: editorScriptContent}},
					parent: ($(this.$view).closest("div[view_id^='window_']")).attr("view_id"),	//TODO: is this parent the base window?
					randomPositioning: {left: {min: 900, max: 900}, top: {min: 65, max: 65}}
				});
			}
			else {
				directives.bringForward(elem);

				// update script output window content
				roc.apiRequest("/webscript/main", {
						widget: "//default/textarea/script_output",
						widgetParams: {
							scriptPath: scriptPath,
							scriptContent: editorScriptContent
						},
						onlyData: true
					}, {
						success: function(res) {
							var response = JSON.parse(res.text());

							//TODO: can this be passed dynamically?
							$$("textarea_script_output").define("value", response.data.data.stringifiedOutput);

							$$("textarea_script_output").refresh();

							$$("textarea_script_retVal").define("value", response.data.data.returnValue);

							$$("textarea_script_retVal").refresh();
						},
						failure: function(error) {
							console.warn(error);
						}
					}
				);
			}
		},
		workflowTreeItemClick: function() {
			var item = this.getSelectedItem(),
				tokens,
				elem;

			if (item.type === "file") {
				tokens = item.id.split("//");

				elem = roc.dom().find("div[view_id^='window_flowchart_workflow_" + tokens[1] + "']")[0];

				if (!elem) {
					directives.createWidget({
						script: "/webscript/main",
						scriptParameters: {widget: "//default/flowchart/workflow" , widgetParams: {key: tokens[1], raptureUri: tokens[1]}},	// raptureUri needed?
						parent: ($(this.$view).closest("div[view_id^='window_']")).attr("view_id"),
						randomPositioning: {left: {min: 400, max: 500}, top: {min: 65, max: 100}}
					});
				}
				else
					directives.bringForward(elem);
			}
		},
		workflowFlowchartStepClick: function(id) {
			var windowElems = $("g[id="+id).closest("div[view_id^='window_']"),
				highestZIndex = 0,
				currentZIndex,
				targetWindowElem,
				tokens;

			for (var idx = 0; idx < windowElems.length; idx++) {
				currentZIndex = parseInt($(windowElems[idx]).css("z-index"), 10);

				if (currentZIndex > highestZIndex) {
					highestZIndex = currentZIndex;

					targetWindowElem = windowElems[idx];
				}
			}

			tokens = $(targetWindowElem).find("svg g[id=" + id + "] div").html().split("<br>");

			tasks.showScriptContent(tokens[1].replace("script:", "/"));
		},
		workflowRunner: function(params) {
			roc.apiRequest("/webscript/runWorkflow", {
						workflowPath: params.workflowPath
				}, {
					success: function(res) {
						var response = JSON.parse(res.text());

						// TODO: create a new widget for listing workorders?
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		}
	}
})();
