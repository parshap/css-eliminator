var eliminator = require("./");
var parse = require("css-parse");
var stringify = require("css-stringify");
var fs = require("fs");

var css = "p { color: red } a { color: blue }";
var html = "<html><body><p>Hello World</p></body></html>";

var ast = parse(css);
var eliminate = eliminator(html);

ast = eliminate(ast);
console.log(stringify(ast));
