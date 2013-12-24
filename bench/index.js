var eliminator = require("../"),
	fs = require("fs"),
	parse = require("css-parse");

// Load html and css strings from files
var html = fs.readFileSync(__dirname + "/bench.html", "utf8"),
	css = fs.readFileSync(__dirname + "/bench.css", "utf8");

var eliminate = eliminator(html),
	ast = parse(css);

var start = Date.now();
eliminate(ast, html);
var duration = (Date.now() - start) / 1000;

console.log("Processing took", duration, "seconds");
