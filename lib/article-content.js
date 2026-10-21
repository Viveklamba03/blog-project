import sanitizeHtml from "sanitize-html";

export function sanitizeArticleHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "del",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "hr",
      "i",
      "img",
      "li",
      "ol",
      "p",
      "pre",
      "s",
      "span",
      "strong",
      "sub",
      "sup",
      "u",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      ol: ["start"],
      "*": ["class", "style"],
    },
    allowedClasses: {
      "*": ["ql-align-center", "ql-align-right", "ql-align-justify", "ql-size-small", "ql-size-large", "ql-size-huge"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb\([0-9,\s]+\)$/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\([0-9,\s]+\)$/i],
        "text-align": [/^(center|right|justify|left)$/],
        "font-size": [/^(0\.[5-9]|[1-3])em$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "nofollow noopener noreferrer" }, true),
    },
  });
}
