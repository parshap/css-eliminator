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
	var dead = rules.filter(isDead);
	var lines = css.split("\n");

	// Copy css string into retval string except for parts owned by dead rules
	var cur = 0;
	var retval = "";
	dead.forEach(function(rule) {
		var start = positionToIndex(rule.position.start),
			end = positionToIndex(rule.position.end);
		retval += css.slice(cur, start);
		cur = end;
	});

	// Copy any remaining css after last dead rule
	retval += css.slice(cur);

	return retval;

	// Convert a line number and column position to index in css string
	function positionToIndex(position) {
		return lines.slice(0, position.line - 1).reduce(function(acc, line) {
			return acc + line.length + 1;
		}, 0) + position.column - 1;
	}

	// Return true if rule's selectors were not used
	function isDead(rule) {
		return rule.selectors.every(function(selector) {
			selector = stripPseudos(selector);

			try {
				// Return true if this selector did not match
				return ! doc.querySelector(selector);
			}
			catch (e) {
				// If the selector was not valid or there was another error
				// assume the selector is not dead
				return false;
			}
		});
	}
};

// Remove any pseudo classes or elements from the selector
// @TODO We may want to keep some pseudo classes (e.g., :nth-child())
var stripPseudos = (function() {
	var parseCSS = require("slick").parse,
		forEach = Array.prototype.forEach;

	return function(selector) {
		var expressions = parseCSS(selector);
		forEach.call(expressions, function(expression) {
			forEach.call(expression, function(part) {
				part.pseudos = null;
			});
		});
		return expressions.toString();
	};
})();

// Flatten all "rule" objects in AST into array
function getRules(ast) {
	var rules = [];
	walkAST(ast, function(ast) {
		if (ast.type === "rule") {
			rules.push(ast);
		}
	});
	return rules;
}

// Recursively walk all AST nodes
function walkAST(ast, fn) {
	fn(ast);

	if (ast.rules) {
		ast.rules.forEach(function(ast) {
			walkAST(ast, fn);
		});
	}
}
