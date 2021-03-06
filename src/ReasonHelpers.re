let reservedKeywords =
  Belt.Set.String.fromArray([|
    "and",
    "as",
    "assert",
    "begin",
    "class",
    "constraint",
    "do",
    "done",
    "downto",
    "else",
    "end",
    "esfun",
    "exception",
    "external",
    "false",
    "for",
    "fun",
    "function",
    "functor",
    "if",
    "in",
    "include",
    "inherit",
    "initializer",
    "lazy",
    "let",
    "module",
    "mutable",
    "new",
    "nonrec",
    "object",
    "of",
    "open",
    "or",
    "pri",
    "pub",
    "rec",
    "sig",
    "struct",
    "switch",
    "then",
    "to",
    "true",
    "try",
    "type",
    "val",
    "virtual",
    "when",
    "while",
    "with",
  |]);

let isReservedKeyword = string => {
  let result = reservedKeywords->Belt.Set.String.has(string);
  result;
};

let mangleNameAsJsxProp = name => "_" ++ name;

let mangleNameAsAttribute = name => name ++ "_";
