// jshint node:true
"use strict";

var jsdom = require("jsdom").jsdom;

var JSDOM_OPTIONS = {
	features: {
		FetchExternalResources: false,
		ProcessExternalResources: false,
	},
};

module.exports = function(ast, html) {
	var document = jsdom(html, null, JSDOM_OPTIONS),
		isNotDead = detector(document);
	ast.stylesheet.rules = filterRules(ast.stylesheet.rules, isNotDead);
	return ast;
};

// Create a function that detects if a given rule is dead or not
function detector(document) {
	var failedSelectorCache = [];

	// Return true if rule's selectors were not used
	return function isNotDead(rule) {
		return rule.selectors.some(function(selector) {
			selector = stripPseudos(selector);

			if (isInCache(selector)) {
				return false;
			}

			if ( ! isInDocument(selector)) {
				failedSelectorCache.push(selector);
				return false;
			}

			return true;
		});
	};

	function isInDocument(selector) {
		try {
			// Return true if this selector matched
			return document.querySelector(selector);
		}
		catch (e) {
			// If the selector was not valid or there was another error
			// assume the selector is not dead
		}
	}

	function isInCache(selector) {
		return failedSelectorCache.some(function(failedSelector) {
			return startsWith(selector, failedSelector + " ");
		});
	}
}

function startsWith(str, prefix) {
	return str.slice(0, prefix.length) === prefix;
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
