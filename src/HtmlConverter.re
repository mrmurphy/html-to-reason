let replaceClassWithClassName = (source: string) => {
  let pattern = Js.Re.fromStringWithFlags("class=", ~flags="g");
  source->Js.String2.replaceByRe(pattern, "className=");
};

let replaceTypeWithType_ = (source: string) => {
  let pattern = Js.Re.fromStringWithFlags("type=", ~flags="g");
  source->Js.String2.replaceByRe(pattern, "type_=");
};

let replaceForWithHtmlFor = (source: string) => {
  let pattern = Js.Re.fromStringWithFlags("for=", ~flags="g");
  source->Js.String2.replaceByRe(pattern, "htmlFor=");
};

[@bs.module] external ast_operations: string => string = "./ast_operations.js";

[@bs.send]
external replaceByReWithCallback:
  (string, Js.Re.t, (string, string) => string) => string =
  "replace";

[@bs.module] external camelcase: string => string = "lodash.camelcase";
let camelAttrs = str => {
  let tagAttrsPattern = Js.Re.fromStringWithFlags("<(.*)>", ~flags="g");
  let attrNamesPattern = Js.Re.fromStringWithFlags("([\w-]+)=", ~flags="g");

  str->replaceByReWithCallback(tagAttrsPattern, (fullMatch, _) => {
    fullMatch->replaceByReWithCallback(attrNamesPattern, (_, captured2) => {
      captured2->camelcase ++ "="
    })
  });
};

let go = source =>
  source
  ->ast_operations
  ->replaceClassWithClassName
  ->replaceTypeWithType_
  ->replaceForWithHtmlFor
  ->camelAttrs;