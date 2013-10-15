# css-eliminator

Remove unused CSS rules. This module works by analyzing rules found in a
stylesheet against a **static dom** and eliminating any rules where no
elements in the DOM match the rule's selector.

This module only removes parts of the CSS that belong to an unused rule.
Everything else is left alone (even whitespace between unused rules).
This is to make sure we only remove what we are certain is unused.

## Pseudo Elements and Pseudo Classes

Any pseudo parts of a selector (e.g., `::after` in `div::after`) are
stripped from the selector before determining if any elements match.
This is so that selectors like `a.btn:hover` will remain as long as an
element matching `a.btn` exists.

# Example

```js
var eliminate = require("css-eliminator");
// Remove unused rule for "a.foo" elements
console.log(eliminate(
	"p { color: red } a.foo { color: blue }",
	"<html><body><p>Hello World</p></body></html>"
});
```
```
p { color: red }
```

# API

# Installation 

```
npm install css-eliminator
```
