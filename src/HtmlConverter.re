[@bs.module]
external transform: (string, string) => string = "./ast_operations.js";

let convert = (name, source) => transform(name, source);
