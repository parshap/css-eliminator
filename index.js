// jshint node:true
"use strict";

var htmlparser = require("htmlparser2"),
	select = require("CSSselect").selectOne;

module.exports = function(html, options) {
	// Create an eliminate function that will alter an AST rule node to
	// eliminate dead code
	var eliminate = eliminator(html, options);

	return function(style) {
		walkRules(style.stylesheet, eliminate);
		return style;
	};
};

// Create a function that will eliminate dead code from rules
function eliminator(html, options) {
	var dom = parseDOM(html);

	return function(rule) {
		// Remove any selectors that don't appear in the document
		rule.selectors = rule.selectors.filter(function(selector) {
			return filter(selector) || isInDocument(selector);
		});

		// Remove declarations if there are no selectors
		if (rule.selectors.length === 0) {
			rule.declarations = [];
		}
	};

	function filter(selector) {
		return options && options.filter && options.filter(selector);
	}

	function isInDocument(selector) {
		selector = stripPseudos(selector);
		try {
			// Return true if this selector matched
			return select(selector, dom);
		}
		catch (e) {
			// If the selector was not valid or there was another error
			// assume the selector is not dead
		}
	}
}

// Sync htmlparser parser
function parseDOM(html) {
	// Since we already have html string and are going to call parser.done()
	// in a sync manner, we can just turn the parsing into a sync call.
	var dom, err;
	var parser = new htmlparser.Parser(
		new htmlparser.DomHandler(function(err2, dom2) {
			// This function will be called on
			err = err2;
			dom = dom2;
		})
	);
	parser.write(html);
	parser.done();
	if (err) throw err;
	return dom;
}

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

// ## Walk Rules
// Walk all rule nodes in the given css ast, calling a function for each rule
// node

var walk = require("rework-walk");

function walkRules(node, fn) {
	walk(node, function(node) {
		if (isRealRule(node)) {
			fn(node);
		}
	});
}

// Make sure the node is a rule and not a media query
function isRealRule(node) {
	return node.type === "rule" &&
		! (node.selectors.length === 1 && node.selectors[0][0] === "@");
}
