var eliminate = require("./");
// Remove unused rule for "a.foo" elements
console.log(eliminate(
	"p { color: red } a.foo { color: blue }",
	"<html><body><p>Hello World</p></body></html>"
));
