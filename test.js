var test = require("tape");
var eliminate = require("./");

test("empty dom", function(t) {
	t.equal(eliminate("a { color: red }", "<html></html>"), "");
	t.end();
});

test("simple", function(t) {
	t.equal(eliminate("a { color: red } b { color: red } a { color: blue }",
		"<html><a></a></html>"),
		"a { color: red }  a { color: blue }");
	t.end();
});
