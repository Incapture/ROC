var tasks = (function() {
	"use strict";

	return {
		datatable_styleElementAsLink: function(value, data, cell, row, options) {
			return "<span style='color: #416095; text-decoration: underline;'>" + value + "</span>";
		},
		datatable_country_ccy_showInfo: function(e, cell, value, data) {
			var elem = roc.dom().find("div[view_id^='window_form_currency_" + value + "']")[0];

			if (!elem) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/form/currency" , widgetParams: {entity: "//standard/currency", key: value}},
					parent: ($(e.currentTarget).closest("div[view_id^='window_']")).attr("view_id"),
					randomPositioning: {left: {min: 950, max: 980}, top: {min: 45, max: 450}}
				});
			}
			else
				directives.bringForward(elem);
		},
		datatable_renderEditIcon: function(value, data, cell, row, options) {
			return "<i class='fa fa-pencil'></i>";
		},
		datatable_renderPasswordString: function(value, data, cell, row, options) {
			return "*****";
		},
		datatable_renderToggleIcon: function(value, data, cell, row, options) {
			if (data.status == "Active")
				return "<i class='fa fa-user-times'></i>";
			else if (data.status == "Inactive")
				return "<i class='fa fa-user-plus'></i>";
		},
		datatable_renderDeleteIcon: function(value, data, cell, row, options) {
			return "<i class='fa fa-trash'></i>";
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
		datatable_editCellList: function(e, cell, value, data) {
			var widget,
				key;

			if (data.username) {
				widget = "//default/form/user";

				key = data.username;
			}
			else if (data.entitlementName) {
				widget = "//default/form/entitlement";

				key = data.entitlementName;
			}
			else if (data.groupName) {
				if ($(cell).attr("data-field") === "users")
					widget = "//default/form/entitlementGroup__user";
				else if ($(cell).attr("data-field") === "entitlements")
					widget = "//default/form/entitlementGroup__entitlement";

				key = data.groupName;
			}

			directives.createWidget({
				script: "/webscript/main",
				scriptParameters: {widget: widget, widgetParams: {key: key, rowDataId: $(cell).closest(".tabulator-row").attr("data-id")}},
				parent: ($(e.currentTarget).closest("div[view_id^='window_']")).attr("view_id"),
				randomPositioning: {left: {min: 600, max: 800}, top: {min: 150, max: 200}}
			});
		},
		datatable_user_toggle_status: function(e, cell, value, data) {
			var tabulatorId = $(cell).closest(".tabulator").attr("id"),
				rowDataId = $(cell).closest(".tabulator-row").attr("data-id"),
				rowData,
				endpoint;

			if (data.status == "Active") {
				endpoint = "/webscript/disableUser";

				rowData = {status: "Inactive"};
			}
			else if (data.status == "Inactive") {
				endpoint = "/webscript/restoreUser";

				rowData = {status: "Active"};
			}

			roc.apiRequest(endpoint, {
					username: data.username
				}, {
					success: function(res) {
						var response = JSON.parse(res.text()),
							newData;

						if (!response.error) {
							if (!tasks.updateTabulatorRow({tabulatorId: tabulatorId, rowDataId: rowDataId, rowData: rowData}))
								console.warn("Could not update " + tabulatorId + ": " + rowDataId);

							newData = $("#" + tabulatorId).tabulator("getData");

							tasks.refreshTabulator({tabulatorId: tabulatorId, newData: newData});
						}
						else {
							directives.createWebixAlert(
								"error",
								response.error,
								4000);
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		datatable_getMoreData: function(params) {
			roc.apiRequest("/webscript/main", {
					widget: params.widget,
					widgetParams: {
						entity: params.entity,
						skip: roc.getSkipValue(params.entity),
						limit: roc.getLimitValue(params.entity)
					},
					onlyData: true
				}, {
					success: function(res) {
						var response = JSON.parse(res.text());

						if (response.data.error) {
							directives.createWebixAlert(
								"error",
								response.data.error,
								4000);

							tasks.refreshTabulator({tabulatorId: params.tabulatorId, newData: []});
						}
						else {
							if (response.data.limit) {
								roc.setLimitValue(response.data.limit, params.entity);

								roc.setSkipValue(response.data.limit, params.entity);
							}

							for (var i = 0; i < response.data.data.length; i++)
								$("#" + params.tabulatorId).tabulator("addRow", response.data.data[i]);

							$("#" + params.tabulatorId).tabulator("setPageSize", response.data.limit);

							if (!response.data.moreData)
								$$(params.buttonViewId).disable();
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		datatable_filterData: function(params) {
			var limit = roc.getLimitValue(params.entity),
				skip = 0;

			roc.resetSkipValue(params.entity);

			if (params.reset) {
				$$(params.formViewId).setValues({
					where_clause: ""
				});
			}

			roc.apiRequest("/webscript/main", {
					widget: params.widget,
					widgetParams: {
						entity: params.entity,
						skip: skip,
						limit: limit,
						whereClause: $$(params.formViewId).getValues()["where_clause"]
					},
					onlyData: true
				}, {
					success: function(res) {
						var response = JSON.parse(res.text());

						if (response.data.error) {
							directives.createWebixAlert(
								"error",
								response.data.error,
								4000);

							tasks.refreshTabulator({tabulatorId: params.tabulatorId, newData: []});
						}
						else {
							if (response.data.limit) {
								roc.setLimitValue(response.data.limit, params.entity);

								roc.setSkipValue(response.data.limit, params.entity);
							}

							tasks.refreshTabulator({tabulatorId: params.tabulatorId, newData: response.data.data});

							!response.data.moreData ? $$(params.moreButtonViewId).disable() : $$(params.moreButtonViewId).enable();
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		datatable_currency_cellEdit: function(id, field, value, oldValue, data, cell, row) {
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
		datatable_user_cellEdit: function(id, field, value, oldValue, data, cell, row) {
			var endpoint,
				params;

			if (field == "email") {
				endpoint = "/webscript/updateEmail";

				params = {
					username: data.username,
					newEmail: value
				};
			}
			else if (field == "password") {
				endpoint = "/webscript/resetPassword";

				params = {
					username: data.username,
					newHashPassword: MD5(value)
				};
			}

			roc.apiRequest(endpoint, params, {
					success: function(res) {
						var response = JSON.parse(res.text());

						if (response.error) {
							directives.createWebixAlert(
								"error",
								response.error,
								4000);
						}
						else {
							if (field == "password")
								directives.createWebixAlert("success", "Password changed successfully.", 2000);
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		addUser: function(params) {
			// TODO: get validation regex requirements
			var username = $$(params.formId).getValues().username,
				email = $$(params.formId).getValues().email,
				password = $$(params.formId).getValues().password;

			if (username && email && password) {
				roc.apiRequest("/webscript/addUser", {
						username: username,
						email: email,
						hashPassword: MD5(password)
					}, {
						success: function(res) {
							var response = JSON.parse(res.text()),
								newData;

							if (response.error) {
								directives.createWebixAlert(
									"error",
									response.error,
									4000);
							}
							else {
								try {
									$("#" + params.tabulatorId).tabulator("addRow", {username: username, email: email, groups: [], status: "Active"}, true);

									newData = $("#" + params.tabulatorId).tabulator("getData");

									tasks.refreshTabulator({tabulatorId: params.tabulatorId, newData: newData})
								}
								catch(e) {
									console.warn(e)
								}
							}
						},
						failure: function(error) {
							console.warn(error);
						}
					}
				);
			}
		},
		addEntitlement: function(params) {
			var entitlementName = $$(params.formId).getValues().entitlementName,
				groupName = $$(params.formId).getValues().groupName;

			if (entitlementName && groupName) {
				roc.apiRequest("/webscript/addEntitlement", {
						entitlementName: entitlementName,
						groupName: groupName
					}, {
						success: function(res) {
							var response = JSON.parse(res.text()),
								newData;

							if (response.error) {
								directives.createWebixAlert(
									"error",
									response.error,
									4000);
							}
							else {
								try {
									$("#" + params.tabulatorId).tabulator("addRow", {entitlementName: entitlementName, groups: groupName}, true);
								}
								catch(e) {
									console.warn(e)
								}
							}
						},
						failure: function(error) {
							console.warn(error);
						}
					}
				);
			}
		},
		addEntitlementGroup: function(params) {
			var groupName = $$(params.formId).getValues().groupName;

			if (groupName) {
				roc.apiRequest("/webscript/addEntitlementGroup", {
						groupName: groupName
					}, {
						success: function(res) {
							var response = JSON.parse(res.text()),
								newData;

							if (response.error) {
								directives.createWebixAlert(
									"error",
									response.error,
									4000);
							}
							else {
								try {
									$("#" + params.tabulatorId).tabulator("addRow", {groupName: groupName}, true);
								}
								catch(e) {
									console.warn(e)
								}
							}
						},
						failure: function(error) {
							console.warn(error);
						}
					}
				);
			}
		},
		deleteEntitlement: function(e, cell, value, data) {
			var tabulatorId = $(cell).closest(".tabulator").attr("id"),
				rowDataId = $(cell).closest(".tabulator-row").attr("data-id");

			roc.apiRequest("/webscript/deleteEntitlement", {
					entitlementName: data.entitlementName
				}, {
					success: function(res) {
						var response = JSON.parse(res.text()),
							newData;

						if (!response.error)
							$("#" + tabulatorId).tabulator("deleteRow", rowDataId);
						else {
							directives.createWebixAlert(
								"error",
								response.error,
								4000);
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		deleteEntitlementGroup: function(e, cell, value, data) {
			var tabulatorId = $(cell).closest(".tabulator").attr("id"),
				rowDataId = $(cell).closest(".tabulator-row").attr("data-id");

			roc.apiRequest("/webscript/deleteEntitlementGroup", {
					groupName: data.groupName
				}, {
					success: function(res) {
						var response = JSON.parse(res.text()),
							newData;

						if (!response.error)
							$("#" + tabulatorId).tabulator("deleteRow", rowDataId);
						else {
							directives.createWebixAlert(
								"error",
								response.error,
								4000);
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		updateGroups: function(params) {
			var options = $$(params.formId).getChildViews(),
				selectedGroups = [],
				previousGroups = params.previousGroups,
				groupsToBeAdded,
				groupsToBeRemoved,
				endpoint = "/webscript/updateGroups",
				name,
				type;

			for (var idx = 0; idx < options.length; idx++) {
				if ($$(options[idx]).getValue() === 1)
					selectedGroups.push($$(options[idx]).data.label);
			}

			groupsToBeAdded = $(selectedGroups).not(previousGroups).get();

			groupsToBeRemoved = $(previousGroups).not(selectedGroups).get();

			if (params.username) {
				name = params.username;

				type = "user";
			}
			else if (params.entitlementName) {
				name = params.entitlementName;

				type = "entitlement";
			}

			roc.apiRequest(endpoint, {
					"name": name,
					"addGroups": groupsToBeAdded,
					"removeGroups": groupsToBeRemoved,
					"type": type
				}, {
					success: function(res) {
						var response = JSON.parse(res.text()),
							newData;

						if (response.error) {
							directives.createWebixAlert(
								"error",
								response.error,
								4000);
						}
						else {
							if (groupsToBeAdded.length > 0 || groupsToBeRemoved.length > 0) {
								if (!tasks.updateTabulatorRow({tabulatorId: params.tabulatorId, rowDataId: params.rowDataId, rowData: {groups: selectedGroups.join(", ")}}))
									console.warn("Could not update " + params.tabulatorId + ": " + params.rowDataId);

								$$(params.windowId).close();

								roc.deleteWindow(params.windowId);

								newData = $("#" + tabulatorId).tabulator("getData");

								tasks.refreshTabulator({tabulatorId: params.tabulatorId, newData: newData});
							}
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		updateUsers: function(params) {
			var options = $$(params.formId).getChildViews(),
				selectedUsers = [],
				previousUsers = params.previousUsers,
				usersToBeAdded,
				usersToBeRemoved;

			for (var idx = 0; idx < options.length; idx++) {
				if ($$(options[idx]).getValue() === 1)
					selectedUsers.push($$(options[idx]).data.label);
			}

			usersToBeAdded = $(selectedUsers).not(previousUsers).get();

			usersToBeRemoved = $(previousUsers).not(selectedUsers).get();

			roc.apiRequest("/webscript/updateUsers", {
					"name": params.groupName,
					"addUsers": usersToBeAdded,
					"removeUsers": usersToBeRemoved
				}, {
					success: function(res) {
						var response = JSON.parse(res.text()),
							newData;

						if (response.error) {
							directives.createWebixAlert(
								"error",
								response.error,
								4000);
						}
						else {
							if (usersToBeAdded.length > 0 || usersToBeRemoved.length > 0) {
								if (!tasks.updateTabulatorRow({tabulatorId: params.tabulatorId, rowDataId: params.rowDataId, rowData: {users: selectedUsers.join(", ")}}))
									console.warn("Could not update " + params.tabulatorId + ": " + params.rowDataId);

								$$(params.windowId).close();

								roc.deleteWindow(params.windowId);

								newData = $("#" + tabulatorId).tabulator("getData");

								tasks.refreshTabulator({tabulatorId: params.tabulatorId, newData: newData});
							}
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		updateEntitlements: function(params) {
			var options = $$(params.formId).getChildViews(),
				selectedEntitlements = [],
				previousEntitlements = params.previousEntitlements,
				entitlementsToBeAdded,
				entitlementsToBeRemoved;

			for (var idx = 0; idx < options.length; idx++) {
				if ($$(options[idx]).getValue() === 1)
					selectedEntitlements.push($$(options[idx]).data.label);
			}

			entitlementsToBeAdded = $(selectedEntitlements).not(previousEntitlements).get();

			entitlementsToBeRemoved = $(previousEntitlements).not(selectedEntitlements).get();

			roc.apiRequest("/webscript/updateEntitlements", {
					"name": params.groupName,
					"addEntitlements": entitlementsToBeAdded,
					"removeEntitlements": entitlementsToBeRemoved
				}, {
					success: function(res) {
						var response = JSON.parse(res.text()),
							newData;

						if (response.error) {
							directives.createWebixAlert(
								"error",
								response.error,
								4000);
						}
						else {
							if (entitlementsToBeAdded.length > 0 || entitlementsToBeRemoved.length > 0) {
								if (!tasks.updateTabulatorRow({tabulatorId: params.tabulatorId, rowDataId: params.rowDataId, rowData: {entitlements: selectedEntitlements.join(", ")}}))
									console.warn("Could not update " + params.tabulatorId + ": " + params.rowDataId);

								$$(params.windowId).close();

								roc.deleteWindow(params.windowId);

								newData = $("#" + tabulatorId).tabulator("getData");

								tasks.refreshTabulator({tabulatorId: params.tabulatorId, newData: newData});
							}
						}
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
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

									if (!tasks.updateTabulatorRow({tabulatorId: params.tabulatorId, rowDataId: response.id, rowData: data}))
										console.warn("Could not update " + params.tabulatorId + ": " + response.id);
								}
								else {
									directives.createWebixAlert("error", "Failed to save. Try again.", 2000);

									if (!tasks.updateTabulatorRow({tabulatorId: params.tabulatorId, rowDataId: response.id, rowData:response.prevData}))
										console.warn("Could not update " + params.tabulatorId + ": " + response.id);
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
		showScriptContent: function(id, parentViewId) {
			var tokens = id.split("//"),
				elem = roc.dom().find("div[view_id^='window_editor_script_" + tokens[1] + "']")[0];

			if (!elem) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/editor/script" , widgetParams: {key: tokens[1], raptureUri: tokens[1]}},
					parent: parentViewId,
					randomPositioning: {left: {min: 100, max: 500}, top: {min: 65, max: 200}}
				});
			}
			else
				directives.bringForward(elem);
		},
		scriptTreeItemClick: function() {
			var item = this.getSelectedItem();

			if (item.type === "file")
				tasks.showScriptContent(item.id, "window_scripts");
		},
		renderParameterElements: function(params) {
			var idx = $$(params.formName).getChildViews().length - 1,
				viewId = params.prefix + "Parameters_" + params.path + "_" + idx,
				keyId = params.prefix + "ParameterKey_" + params.path + "_" + idx,
				valueId = params.prefix + "ParameterValue_" + params.path + "_" + idx;

			$$(params.formName).addView({
				id: viewId,
				cols: [
					{view: "text", placeholder: "key", name: 'key'},
					{view: "text", placeholder: "value", name: 'value'},
					{view: "icon", icon: "times", click: "$$('" + params.formName + "').removeView('" + viewId + "');"}
				]
			}, -1);
		},
		getParams: function(p) {
			var parameterCount = $$(p.formName).getChildViews().length - 1,
				paramsMap = {},
				paramElems;

			if (parameterCount > 0) {
				for (var idx = 0; idx < parameterCount; idx++) {
					paramElems = $$(p.paramElementsContainerIdPrefix + idx).getChildViews();

					paramsMap[$$(paramElems[0].$view).getValue()] = $$(paramElems[1].$view).getValue();
				}
			}

			return paramsMap;
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
					scriptParameters: {
						widget: "//default/textarea/script_output",
						widgetParams: {
							scriptPath: scriptPath,
							scriptContent: editorScriptContent,
							paramsMap: tasks.getParams({
								formName: "form_script_addParameter_" + scriptPath,
								paramElementsContainerIdPrefix: "scriptParameters_" + scriptPath + "_"
							})
						}
					},
					parent: ($(this.$view).closest("div[view_id^='window_']")).attr("view_id"),
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
							scriptContent: editorScriptContent,
							paramsMap: tasks.getParams({
								formName: "form_script_addParameter_" + scriptPath,
								paramElementsContainerIdPrefix: "scriptParameters_" + scriptPath + "_"
							})
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

			tasks.showScriptContent(tokens[1].replace("script:", "/"), $(targetWindowElem).attr("view_id"));
		},
		runWorkflow: function() {
			var	workflowPath = (($(this.$view).closest("div[view_id^='window_']")).attr("data-rapture-uri")),
				parentViewId = (($(this.$view).closest("div[view_id^='window_']")).attr("view_id"));

			roc.apiRequest("/webscript/runWorkflow", {
					workflowPath: workflowPath,
					parameters: tasks.getParams({
						formName: "form_workflow_addParameter_" + workflowPath,
						paramElementsContainerIdPrefix: "workflowParameters_" + workflowPath + "_"
					})
				}, {
					success: function(res) {
						var response = JSON.parse(res.text());

						tasks.listWorkorders({
							workflowPath: workflowPath,
							parentViewId: parentViewId,
							refresh: function(params) {
								var newListItemId = parseInt($$(params.listId).getLastId()) + 1;

								// add the new workorder to list, select it
								$$(params.listId).add({
									name: response.workorder.name,
									id: newListItemId,
									status: response.workorder.status
								}, 0);

								$$(params.listId).select(newListItemId);
							}
						});
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		listWorkorders: function(params) {
			var elem = roc.dom().find("div[view_id^='window_list_workorder_" + params.workflowPath + "']")[0];

			if (!elem) {
				directives.createWidget({
					script: "/webscript/main",
					scriptParameters: {widget: "//default/list/workorder" , widgetParams: {key: params.workflowPath}},
					parent: params.parentViewId,
					randomPositioning: {left: {min: 400, max: 600}, top: {min: 100, max: 400}}
				});
			}
			else {
				directives.bringForward(elem);

				if (params.refresh)
					params.refresh({listId: "list_workorders_" + params.workflowPath});
			}
		},
		refreshWorkordersList: function(params) {
			$$(params.listViewId).clearAll();

			roc.apiRequest("/webscript/main", {
					widget: params.widget,
					widgetParams: params.widgetParams,
					onlyData: true
				}, {
					success: function(res) {
						var response = JSON.parse(res.text());

						$$(params.listViewId).define("data", response.data.data);

						$$(params.listViewId).refresh();
					},
					failure: function(error) {
						console.warn(error);
					}
				}
			);
		},
		updateTabulatorRow: function(params) {
			return $("#" + params.tabulatorId).tabulator("updateRow", $("div.tabulator-row[data-id='" + params.rowDataId + "']"), params.rowData);
		},
		refreshTabulator: function(params) {
			$("#" + params.tabulatorId).tabulator("setData", params.newData);
		}
	}
})();
