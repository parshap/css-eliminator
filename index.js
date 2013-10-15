// jshint node:true
"use strict";

var parse = require("css-parse"),
	jsdom = require("jsdom").jsdom;

var JSDOM_OPTIONS = {
	features: {
		FetchExternalResources: false,
	},
};

module.exports = function(css, html) {
	var ast = parse(css, { position: true });
	var doc = jsdom(html, null, JSDOM_OPTIONS);
	var rules = getRules(ast.stylesheet);
	var unused = rules.filter(isUnused);
	var lines = css.split("\n");

	var cur = 0;
	var retval = "";
	unused.forEach(function(rule) {
		var start = positionToIndex(rule.position.start),
			end = positionToIndex(rule.position.end);
		retval += css.slice(cur, start);
		cur = end;
	});

	retval += css.slice(cur);

	return retval;

	function positionToIndex(position) {
		return lines.slice(position.line).reduce(function(acc, line) {
			return acc + line.length;
		}, 0) + position.column - 1;
	}

	// Return true if rule's selectors were not used
	function isUnused(rule) {
		return rule.selectors.every(function(selector) {
			// Return true if this selector was not used
			return ! doc.querySelector(selector);
		});
	}
};

function getRules(ast) {
	var rules = [];
	walkAST(ast, function(ast) {
		if (ast.type === "rule") {
			rules.push(ast);
		}
	});
	return rules;
}

// Recursively walk all AST rule objects
function walkAST(ast, fn) {
	fn(ast);

	if (ast.rules) {
		ast.rules.forEach(function(ast) {
			walkAST(ast, fn);
		});
	}
}
