const Entities = require("html-entities").AllHtmlEntities;
const posthtml = require("posthtml");
const posthtmlRender = require("./posthtmlRender.js");
const reasonHelpers = require("./ReasonHelpers.bs.js");

const entities = new Entities();

const DASH = /[-|_|:]([a-z])/g;
const MS = /^Ms/g;

function capitalize(match) {
  return match[1].toUpperCase();
}

function lowerCaseFirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function camelCase(property) {
  const mid = property.replace(DASH, capitalize).replace(MS, "ms");
  const final = lowerCaseFirst(mid);

  return final;
}

function replaceStyle(styleString) {
  const styles = styleString
    .trim()
    .split(";")
    .map((style) => {
      if (style.trim() == "") {
        return "";
      }

      const [property, value] = style.split(":");
      let basePropertyName = camelCase(property);
      const safePropertyName = reasonHelpers.isReservedKeyword(basePropertyName)
        ? reasonHelpers.mangleNameAsAttribute(basePropertyName)
        : basePropertyName;
      return "~" + safePropertyName + '="' + value + '"';
    })
    .filter(Boolean);

  const labels = styles.length > 0 ? styles.join(", ") + ", " : "";

  return "ReactDOMRe.Style.make(" + labels + " ())";
}

const convertTag = (node) => {
  if (
    node.tag &&
    reasonHelpers.isReservedKeyword(node.tag.toLocaleLowerCase())
  ) {
    const tag = reasonHelpers.mangleNameAsAttribute(node.tag);

    return { ...node, tag: tag };
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
      const base = posthtmlRender.getAttributeCanonicalName(camelCase(key));
      const newKey =
        base === "class"
          ? "className"
          : reasonHelpers.isReservedKeyword(base)
          ? reasonHelpers.mangleNameAsAttribute(base)
          : base;

      return [newKey, value];
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
  return node.match(/<!--(.*)-->/)[1].trim();
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
