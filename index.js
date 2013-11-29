// jshint node:true
"use strict";

var htmlparser = require("htmlparser2"),
	select = require("CSSselect").selectOne;

module.exports = function(ast, html) {
	var dom = parseDOM(html),
		isNotDead = detector(dom);
	ast.stylesheet.rules = filterRules(ast.stylesheet.rules, isNotDead);
	return ast;
};

function parseDOM(html) {
	var dom, err;
	var parser = new htmlparser.Parser(new htmlparser.DomHandler(function(err2, dom2) {
		err = err2;
		dom = dom2;
	}));
	parser.write(html);
	parser.done();
	if (err) throw err;
	return dom;
}

// Create a function that detects if a given rule is dead or not
function detector(dom) {
	return function isNotDead(rule) {
		// Return true if rule's selectors were not used
		return rule.selectors.some(function(selector) {
			selector = stripPseudos(selector);
			return isInDocument(selector);
		});
	};

	function isInDocument(selector) {
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


function filterRules(rules, fn) {
	return rules.filter(function(rule) {
		var filtered = isRealRule(rule) && ! fn(rule);
		if (rule.rules) {
			rule.rules = filterRules(rule.rules, fn);
		}
		return ! filtered;
	});
}

function isRealRule(rule) {
	return rule.type === "rule" &&
		! (rule.selectors.length === 1 && rule.selectors[0][0] === "@");
}
