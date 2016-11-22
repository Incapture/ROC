"use strict";

var raptureAuth = require("./node_modules_incapture/core-auth"),
    httpProxy = require("http-proxy"),
    express = require("express"),
    compression = require("compression"),
    forwardingUrl,
    routes,
    apiProxy,
    app;

forwardingUrl = raptureAuth.getConfig()["forwardingUrl"];

routes = [
        {
            path: "/login/*",
            target: forwardingUrl
        },
        {
            path: "/webscript/*",
            target: forwardingUrl
        },
        {
            path: "/blob/*",
            target: forwardingUrl
        },
        {
            path: "/blobupload",
            target: forwardingUrl
        }
    ];

// set connection
raptureAuth.setConnection();

// rapture api login (this will also install scripts from the specified base directory)
raptureAuth.apiLogin({projectDir: __dirname, scriptsBaseDir: "/scripts"});

apiProxy = httpProxy.createProxyServer();

app = express();

app.use(compression({threshold: 0}));

app.use(express.static(__dirname + "/public"));

apiProxy.on("error", function(e) {
    console.log("ERROR: Handling proxy connection failed - " + e);
});

// define Express routes
for (var idx = 0; idx < routes.length; idx++)
    defineExpressRoute(routes[idx]["path"], routes[idx]["target"]);

function defineExpressRoute(path, target) {
    app.all(path, function(req, res) {
        apiProxy.web(req, res, {
            target: target
        });
    });
}

app.use(function(req, res, next) {
    res.status(404).sendFile(__dirname + "/public/404.html");
});

app.listen(raptureAuth.getConfig()["webPort"]);
console.log("INFO: App listening on port - " + raptureAuth.getConfig()["webPort"]);
