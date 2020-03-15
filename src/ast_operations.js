const unified = require("unified");
var parse = require("rehype-parse");
const stringify = require("rehype-stringify");
const format = require("rehype-format");
var visit = require("unist-util-visit");

module.exports = string => {
  var tree = unified()
    .use(parse, { fragment: true })
    .parse(string);

  // Wrap strings in quotes and pass them to the "string" function
  visit(tree, "text", function(node) {
    if (node.value.trim() != "") {
      node.value = node.value
        .split("\n")
        .map(line => (line.trim() != "" ? `"${line.trim()}"->string` : line))
        .join("\n");
    }
  });

  // Turn HTML comments into JSX comments
  visit(tree, "comment", function(node) {
    node.type = "text";
    node.value = "// " + node.value;
  });

  let outputString = unified()
    .use(format)
    .use(stringify, { closeSelfClosing: true })
    .stringify(tree);

  return outputString;
};
