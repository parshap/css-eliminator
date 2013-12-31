# css-eliminator

Walk rules of a style sheet and remove unused code.

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

We can eliminate parts of the styles that will not affect the DOM
(`example.js`):

```js
var eliminator = require("css-eliminator");
var parse = require("css-parse");
var stringify = require("css-stringify");
var fs = require("fs");

var css = fs.readFileSync("styles.css");
var html = fs.readFileSync("hello.html");
var eliminate = eliminator(html);

var ast = eliminate(parse(css))
console.log(stringify(ast));
```

```
$ node example.js
p {
  color: red;
}
```

Alternatively, you can use *css-eliminator* as a *[Rework][]* plugin.

## How It Works

This module determines if each rule in a style sheet is *dead* or not. A
rule is considered dead if no elements exist in the given HTML document
that match the rule's selector.

### Pseudo Elements and Pseudo Classes

Any pseudo parts of a selector (e.g., `::after` in `div::after`) are
stripped from the selector before determining if any elements match.
This is so that selectors like `a.btn:hover` will remain as long as an
element matching `a.btn` exists.

### Selector Filtering

To white-list, black-list, or otherwise filter which rule selectors are
dropped, `options.filter` can be a function that will be called for each
selector. If the function returns true, the selector will **not be**
dropped and the rule will be left intact.

For example, if your appliation dynamically adds `.user-profile` divs to
the page, you can keep all selectors containing `.user-profile`:

```js
var eliminate = eliminator(html, {
	filter: function(selector) {
		return /\.user-profile/.test(selector);
	},
});
```

You can use a selector parser like *[slick][]* for powerful
arbitrary selector filtering.

## API

The API operates on HTML as strings, and CSS as ASTs produced by
*[css-parse][]*.

### `eliminator(html, options)`

Create an `eliminate(ast)` function that will operate on CSS ASTs with
the given HTML document as context.

Options:

 * `options.filter`: A function to control which selectors are removed.

### `eliminate(ast)`

Remove any dead code in the given CSS AST and return the AST.

## Todos

 * Some pseudo classes should be considered (e.g., :nth-child())
 * Allow multiple DOM inputs
 * Remove unused keyframe definitions
 * Remove empty `@media` blocks and other at-rules
 * Remove unused animation keyframe declarations
 * Remove duplicate property declarations across multiple rules
 * Bug with ".wrapper ::selection {}" if .wrapper has only text nodes

### Alternate Approach

Another approach would be to walk the DOM and use something like
`getComputedStyle()` to determine which styles actually affect the DOM.

## Installation 

```
npm install css-eliminator
```

[rework]: https://github.com/visionmedia/rework
[css-parse]: https://github.com/visionmedia/css-parse
[slick]: https://github.com/kamicane/slick
