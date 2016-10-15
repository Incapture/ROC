"use strict";

var fs = require("fs"),
	config = require("config"),
	rapture = require("./rapture.js"),
	raptureConfig = {};

raptureConfig = {
	forwardingUrl: config.get("rapture"),
	webPort: config.get("port"),
	apiUser: config.get("api_user"),
	apiPassword: config.get("api_password"),
	apiServer: config.get("api_server"),
	apiPort: config.get("api_port")
};

console.log("INFO: Forwarding URL is: " + raptureConfig.forwardingUrl);

function getConfig() {
	return raptureConfig
}

function setConnection() {
	rapture.setConnection(raptureConfig.apiServer, raptureConfig.apiPort);
}

function apiLogin(params) {
	rapture.login(raptureConfig.apiUser, raptureConfig.apiPassword, uploadScripts);

	function uploadScripts(err, data) {
		var prefix;

		if (err)
			console.log("ERROR: (API login) " + err);
		else {
			console.log("INFO: Logged in, now uploading scripts ...");

			// We now upload every .script file (with hierarchy) in the folder "scripts"
			prefix = params.projectDir + params.scriptsBaseDir;

			walk(prefix, function(err, results) {
				var name,
					prefixLength,
					str,
					scriptName;

					if (err)
						throw err;

					// Now for each of these, upload script, with name (as the file, - the prefix, - .script)
					// and the contents, the contents of that file...
					for (var i = 0; i < results.length; i++) {
						name = results[i];

					if (endsWith(name, ".script")) {
						prefixLength = prefix.length;

						str = fs.readFileSync(name, "utf8");

						scriptName = name.substring(prefixLength, name.length - 7); // .script

						console.log(scriptName);

						try {
							rapture.Script.doesScriptExist(scriptName, processReturn(scriptName, str));
						}
						catch(e) {
							console.log("ERROR: #script.doesScriptExist failed - " + e);
						}
					}
				}
	    	});
		}
	}
}

function walk(dir, done) {
	var results = [];

	fs.readdir(dir, function(err, list) {
		var i = 0;

		if (err)
			return done(err);
		
		(function next() {
			var file = list[i++];

			if (!file)
				return done(null, results);
			
			file = dir + '/' + file;
			
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);

						next();
					});
	        	}
	        	else {
	          		results.push(file);

	          		next();
	        	}
	        });
	    })();
	});
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function processReturn(name, str) {
	return function(err, data) {
		if (data) {
			rapture.Script.getScript(name, function(err, data) {
				if (data.script != str) {
					console.log("INFO: Changes detected, uploading new " + name);

					data.script = str;

					rapture.Script.putScript(name, data, function(err, d) {});
        		}
        		else
					console.log("INFO: No changes for " + name);
			});
		}
		else {
			console.log("INFO: Script not found, creating - " + name);

			rapture.Script.createScript(name, "REFLEX", "PROGRAM", str, function(err, d) {
				if (err)
					console.log("ERROR: #script.createScript failed - " + e);
			});
		}
	}
}

/* expose methods */
module.exports = {
	apiLogin: apiLogin,
	getConfig: getConfig,
	setConnection: setConnection	
}