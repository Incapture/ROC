"use strict";

var expect = require("chai").expect,
    rapturize = require("../index");

describe("#rapturize", function() {
    it("should name default api user", function() {
        var result = rapturize.getConfig()["apiUser"];
        expect(result).to.equal("rapture");
    });
});