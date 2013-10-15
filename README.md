# css-eliminator

Remove unused CSS rules. This module works by analyzing rules found in a
stylesheet against a **static DOM** and eliminating any rules where no
elements in the DOM match the rule's selector.

## Dead Rules

This module only removes parts of the CSS that belong to a dead rule. A
rule is considered dead if no elements exist in the given HTML document
that match the rule's selector. Everything else is left alone (even
whitespace between unused rules). This is to make sure we only remove
what we are certain is not used.

## Pseudo Elements and Pseudo Classes

Any pseudo parts of a selector (e.g., `::after` in `div::after`) are
stripped from the selector before determining if any elements match.
This is so that selectors like `a.btn:hover` will remain as long as an
element matching `a.btn` exists.

# Example

```js
var eliminate = require("css-eliminator");
// Remove unused "a.foo { ... }" rule, leaving only "p { .. }" rule
console.log(eliminate(
	"p { color: red } a.foo { color: blue }",
	"<html><body><p>Hello World</p></body></html>"
});
```
```
p { color: red }
```

# API

## `eliminate(css, html)`

Given a CSS document and HTML document return a new CSS document that
matches the original except with any dead rules removed.

# Todos

 * Some pseudo classes should be considered (e.g., :nth-child())
 * Solution for non-static DOMs and multi-page sites
 * Command line interface (binary)

# Installation 

```
npm install css-eliminator
```
