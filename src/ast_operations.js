const Entities = require("html-entities").AllHtmlEntities;
const posthtml = require("posthtml");
const posthtmlRender = require("./posthtmlRender.js");
const reasonHelpers = require("./ReasonHelpers.bs.js");

const entities = new Entities();

function replaceStyle(styleString) {
  const styles = entities
    .decode(styleString)
    .trim()
    .split(";")
    .map((style) => {
      if (style.trim() == "") {
        return "";
      }

      // Extract any urls that might have `:` in them first, decode them, then
      // replace them later;

      const urls = {};
      var urlCounter = 0;

      const safeStyle = style
        .split(/\n/)
        .map((piece) => piece.trim())
        .join("");
      const [property, value] = safeStyle.split(/:(?!\/\/)/g);
      let basePropertyName = posthtmlRender.camelCase(property);
      const safePropertyName = reasonHelpers.isReservedKeyword(basePropertyName)
        ? reasonHelpers.mangleNameAsAttribute(basePropertyName)
        : basePropertyName;

      let basePropertyValue = (value || "").replace(/\n/g, "").trim();

      const safePropertyValue = posthtmlRender.escapeQuotes(basePropertyValue);

      return "~" + safePropertyName + '="' + safePropertyValue + '"';
    })
    .filter(Boolean);

  const labels = styles.length > 0 ? styles.join(", ") + ", " : "";

  return "ReactDOMRe.Style.make(" + labels + " ())";
}

const convertTag = (node) => {
  if (node.tag) {
    const tag = posthtmlRender.camelCase(node.tag);

    return { ...node, tag: tag };
    o;
  }
  return node;
};

const convertStyle = (node) => {
  if (node.attrs && node.attrs.style) {
    return {
      ...node,
      attrs: { ...node.attrs, style: replaceStyle(node.attrs.style) },
    };
  }

  return node;
};

const convertAttributeName = (node) => {
  if (Object.keys(node.attrs || {}).length > 0) {
    const entries = Object.entries(node.attrs || {}).map(([key, value]) => {
      const base = posthtmlRender.getAttributeCanonicalName(
        posthtmlRender.camelCase(key)
      );

      const newKey =
        base === "class"
          ? "className"
          : base === "for"
          ? "forHtml"
          : reasonHelpers.isReservedKeyword(base)
          ? reasonHelpers.mangleNameAsAttribute(base)
          : base;

      return [newKey, value.trim()];
    });

    const attrs = Object.fromEntries(entries);

    return { ...node, attrs: attrs };
  }

  return node;
};

const prepareRawTextNode = (node) => {
  if (node.trim() === "") {
    return null;
  }

  const containsNewlines = !!node.match(/[\n|\r]/g);

  const cleaned = node
    .split("\n")
    .map((string) => string.trim())
    .join("\n")
    .trim();

  const decoded = entities.decode(cleaned);

  return `{j|${decoded}|j}->string`;
};

const isCommentNode = (node) => {
  return node.startsWith("<!--") && node.endsWith("-->");
};

const extractCommentFromCommentNode = (node) => {
  const temp = node.match(/<!--(.*)-->/)[1].trim();
  const quoteCount = temp.match(/"/g);

  // Refmt will bizarrely throw a syntax error if a comment contains an unterminated string literal
  const safe = (quoteCount || []).length % 2 === 0 ? temp : temp + '"';

  return safe;
};

const posthtmlReason = (tree) => {
  // do something for tree
  tree.walk((originalNode) => {
    if (typeof originalNode === "string") {
      if (isCommentNode(originalNode)) {
        return `/* ${extractCommentFromCommentNode(originalNode)} */`;
      } else {
        return prepareRawTextNode(originalNode);
      }
    } else {
      let node = { ...originalNode };
      node = convertTag(node);
      node = convertAttributeName(node);
      node = convertStyle(node);

      return node;
    }
  });
};

const transform = (name, data) => {
  console.debug("Transforming", name);
  const p = posthtml();

  const html = p.use(posthtmlReason).process(data, {
    sync: true,
    closingSingleTag: "slash",
    render: posthtmlRender,
  }).html;

  return html;
};

module.exports = transform;
