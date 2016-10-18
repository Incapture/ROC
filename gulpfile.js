"use strict";

var gulp = require("gulp"),
	del = require("del"),
	fs = require("fs"),
	runSequence = require("run-sequence"),
	yargs = require("yargs"),
	argv,
	location,
	prModules,
	copyModules = true;

argv = yargs.argv;

gulp.task("clean-private-npm", function() {
	return del("node_modules_incapture");
});

gulp.task("build-private-npm", function() {
	var stream;
	for (var idx = 0; idx < prModules.length; idx++) {
		stream += gulp.src(location + prModules[idx] + "/**/*")
            .pipe(gulp.dest("node_modules_incapture/" + prModules[idx]));
	}

	return stream;
});

// copy latest RaptureJS from specified location
gulp.task("rapturejs-latest", function() {
	if (!argv.loc)
		console.log("ERROR: Please specify the location for RaptureJS.\n(E.g. --loc ~/RaptureJS)");
	else {
		location = argv.loc;

		if (!argv.modules)
			console.log("ERROR: Please specify the private modules that you wish to install from RaptureJS.\n(E.g. --modules '[\"core-auth\"]'");
		else {
			prModules = JSON.parse(argv.modules)

			if (Object.prototype.toString.call(prModules) === "[object Array]" ) {
				// check if RaptureJS exists at specified location
				if (!(folderExists(location))) 
					console.log("ERROR: RaptureJS not found at the specified location. Please try again.");
				else {
					for (var idx = 0; idx < prModules.length; idx++) {
						if (!(folderExists(location + prModules[idx]))) {
							console.log("ERROR: module " + prModules[idx] + " not found in RaptureJS.");

							copyModules = false;

							break;
						}
					}

					if (copyModules) {
						runSequence(
							"clean-private-npm",
							"build-private-npm"
						);
					}						
				}
			}
		}
	}
});

function folderExists(path) {
	try{
		fs.accessSync(path)
		return true;
	}
	catch(e){
	    return false;
	}
}

