var express = require('express');
var httpProxy = require('http-proxy');
var config = require('config');
var rapture = require('./rapture.js');
var fs = require('fs');

var forwardingUrl = config.get('rapture');
var webPort = config.get('port');

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

console.log("Using forwardingUrl from config - " + forwardingUrl);

console.log("Installing reflex scripts to Rapture environment");

var raptureAPIUser = config.get("api_user");
var raptureAPIPassword = config.get("api_password");

rapture.setConnection(config.get("api_server"), config.get("api_port"));

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// rapture.setConnection(..);
rapture.login(raptureAPIUser, raptureAPIPassword, function(err, data) {
  if (err) {
    console.log("Error - " + err);
  } else {
    // Now write scripts output
    console.log("Logged in, now uploading scripts");
    // We now upload every .script file (with hierarchy) in the folder "scripts"
    var prefix = __dirname + "/scripts";
    walk(prefix, function(err, results) {
      if (err) {
        throw err;
      }
      // Now for each of these, upload script, with name (as the file, - the prefix, - .script)
      // and the contents, the contents of that file...
      for (var i = 0; i < results.length; i++) {
        var name = results[i];
        if (endsWith(name, ".script")) {
          var prefixLength = prefix.length;
          var str = fs.readFileSync(name, "utf8");

          var scriptName = name.substring(prefixLength,
            name.length - 7); // .script
          console.log(scriptName);
          rapture.Script.doesScriptExist(scriptName, processReturn(
            scriptName, str));
        };
      }
    });
  }
});

var processReturn = function(name, str) {
  return function(err, data) {
    if (data) {
      rapture.Script.getScript(name, function(err, data) {
        if (data.script != str) {
          console.log("Changes detected, uploading new " + name);
          data.script = str;
          rapture.Script.putScript(name, data,
            function(err, d) {});
        } else {
          console.log("No changes for " + name);
        }
      });
    } else {
      console.log("Script not found, creating - " + name);
      rapture.Script.createScript(name, "REFLEX",
        "PROGRAM", str,
        function(err, d) {
          if (err) {} else {}
        });
    }
  }
}

var app = express();
app.use(express.static(__dirname + "/public"));

var apiProxy = httpProxy.createProxyServer();

apiProxy.on('error', function(e) {
  console.log("Error when handling proxy connection " + e);
});

app.all("/login/*", function(req, res) {
  apiProxy.web(req, res, {
    target: forwardingUrl
  });
});

app.all("/webscript/*", function(req, res) {
  apiProxy.web(req, res, {
    target: forwardingUrl
  });
});

app.all("/blob/*", function(req, res) {
  apiProxy.web(req, res, {
    target: forwardingUrl
  });
});

app.all("/blobupload", function(req, res) {
  apiProxy.web(req, res, {
    target: forwardingUrl
  });
});

app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

app.listen(webPort);
console.log("App listening on port " + webPort);
