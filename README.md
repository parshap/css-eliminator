# css-eliminator

Walk all rules of a style sheet and remove what is not being used.

## Example

Given an HTML document `hello.html`:
```html
<html>
	<body>
		<p>Hello World</p>
	</body>
</html>
```

And some styles `styles.css`:
```css
p {
	color: red;
}

a {
	color: blue;
}
```

We can eliminate parts of the styles that are not present in the
document.

```js
var eliminator = require("css-eliminator");
var parse = require("css-parse");
var stringify = require("css-stringify");
var fs = require("fs");

var css = fs.readFileSync("styles.css");
var html = fs.readFileSync("hello.html");
var ast = parse(css);
var eliminate = eliminator(html);

ast = eliminate(ast);
console.log(stringify(ast));
```

Alternatively, you can use this as a *[Rework][]* plugin.

[rework]: https://github.com/visionmedia/rework

## Dead Rules

This module determines if each rule in a style sheet is *dead* or not. A
rule is considered dead if no elements exist in the given HTML document
that match the rule's selector.

### Pseudo Elements and Pseudo Classes

Any pseudo parts of a selector (e.g., `::after` in `div::after`) are
stripped from the selector before determining if any elements match.
This is so that selectors like `a.btn:hover` will remain as long as an
element matching `a.btn` exists.

## API

### `eliminate(css, html)`

Given a CSS document and HTML document return a new CSS document that
matches the original except with any dead rules removed.

## Todos

 * Some pseudo classes should be considered (e.g., :nth-child())
 * Solution for non-static DOMs and multi-page sites
 * Remove unused keyframe definitions
 * Remove empty `@media` blocks
 * Remove duplicate property declarations
 * Bug with ".wrapper ::selection {}" if .wrapper has only text nodes

### Alternate Approache

Another approach would be to walk the DOM and use something like
`getComputedStyle()` to determine which styles actually affect the DOM.

## Installation 

```
npm install css-eliminator
```
