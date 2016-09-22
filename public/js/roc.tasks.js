var tasks = (function() {
	"use strict";

	return {
		country_datatable_numId_greaterThan500: function(value, data, cell, row, options) {
			if (value > 500)
				return "<span style='color:green; font-weight:bold;'>" + value + "</span>"
			else
				return value;
		}
	}
})();