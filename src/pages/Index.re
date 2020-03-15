open React;
type state = {
  html: string,
  jsx: string,
};

type action =
  | UpdateHTML(string);

let initialState = {html: "", jsx: ""};

let reducer = (_state, action) =>
  switch (action) {
  | UpdateHTML(str) => {html: str, jsx: str->HtmlConverter.go}
  };

[@bs.module] external copy_text: (~id: string) => unit = "../copy_text.js";
let copyOutput = () => {
  copy_text(~id="copyMe");
};

[@react.component]
let default = () => {
  let (state, dispatch) = React.useReducer(reducer, initialState);

  let view =
    <div className="bg-gray-200 h-screen w-screen flex flex-col">
      Templates.header
      <div className="grid grid-cols-2 gap-4 mx-auto flex-1 px-4 mb-8 w-full">
        <div
          id="input"
          className="bg-white overflow-hidden shadow rounded-lg border-yellow-400 border-b-2 shadow-lg">
          <div
            className="border-b-2 border-yellow-400 px-3 py-4 sm:px-6 bg-yellow-200 text-yellow-600">
            <h1 className="text-lg font-bold"> "Paste HTML"->string </h1>
          </div>
          <div className="p-1 h-full">
            <textarea
              placeholder={|<div class="placeholder">Paste something in here!</div>|}
              className="w-full h-full p-4 outline-none focus:shadow-outline"
              value={state.html}
              onChange={evt => {
                let v = evt->ReactEvent.Form.target##value;
                dispatch(UpdateHTML(v));
              }}
            />
          </div>
        </div>
        <div
          id="output"
          className="bg-white overflow-hidden shadow rounded-lg border-red-400 border-b-2 shadow-lg">
          <div
            className="border-b-2 border-red-400 px-3 py-4 sm:px-6 bg-red-200 text-red-600 flex justify-between">
            <h1 className="text-lg font-bold"> "Copy Reason"->string </h1>
            <button onClick={_ => copyOutput()}> Templates.clipboard </button>
          </div>
          <div className="p-1 h-full">
            <textarea
              readOnly=true
              id="copyMe"
              value={state.jsx}
              className="w-full h-full outline-none focus:shadow-outline p-4"
            />
          </div>
        </div>
      </div>
      Templates.footer
    </div>;
  view;
};