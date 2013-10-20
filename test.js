// jshint node:true
"use strict";

var test = require("tape");
var parse = require("css-parse");
var stringify = require("css-stringify");
var eliminate = require("./");

function e(css, html) {
	return stringify(eliminate(parse(css), html), { compress: true });
}

test("empty dom", function(t) {
	t.equal(e("a { color: red }", "<html></html>"), "");
	t.end();
});

test("simple", function(t) {
	t.equal(e("a { color: red; } b { color: red; } a { color: blue; }",
		"<html><a></a></html>"),
		"a{color:red;}a{color:blue;}");
	t.end();
});

test("pseudo element", function(t) {
	var CSS = "a::after{color:red;}",
		HTML = "<html><a></a></html>";
	t.equal(e(CSS, HTML), CSS);
	t.end();
});

test("pseudo selector", function(t) {
	var CSS = "a:hover{color:red;}",
		HTML = "<html><a></a></html>";
	t.equal(e(CSS, HTML), CSS);
	t.end();
});

test("multiline", function(t) {
	var HTML = "<html><a></a></html>";

	var CSS =
		"a { color: red; }\n" +
		"a:hover {\n" +
		"  font-weight: bolder;\n" +
		"}\n" +
		"b { color: blue; }\n" +
		"a.foo { color: pink; }\n";

	var EXPECTED_CSS =
		"a{color:red;}" +
		"a:hover{" +
		"font-weight:bolder;}";

	t.equal(e(CSS, HTML), EXPECTED_CSS);
	t.end();
});
