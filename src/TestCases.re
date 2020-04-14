[@bs.module "./ast_operations.js"]
external testCases: array((string, string)) = "testCases";

[@bs.module "fs"]
external readFile: (string, string) => string = "readFileSync";

[@bs.module "fs"]
external writeFile: (string, string) => unit = "writeFileSync";

[@bs.module "fs"]
external appendFile: (string, string) => unit = "appendFileSync";

let htmlTestCases = [|
  "test1.html",
  "test2.html",
  "test3.html",
  "test4.html",
  "test5.html",
  "test6.html",
  "./full_test.html",
|];

let svgTestCases = [|
  "ghostscript_tiger.svg",
  "test2.svg",
  "test4.svg",
  "test5.svg",
  "test6.svg",
  "test7.svg",
  "test8.svg",
  "test9.svg",
  "test10.svg",
  "test11.svg",
  "test12.svg",
  "test13.svg",
  "test14.svg",
  "test15.svg",
  "test16.svg",
  "test17.svg",
  "test18.svg",
  "test19.svg",
  "test20.svg",
  "test21.svg",
  "test22.svg",
  "test23.svg",
  "test24.svg",
  "test25.svg",
  "test26.svg",
  "test27.svg",
  "test28.svg",
  "test29.svg",
  "test30.svg",
  "test31.svg",
  "test32.svg",
  "testSpinner.svg",
|];

let testCaseFiles = Belt.Array.concat(htmlTestCases, svgTestCases);

let testCases =
  testCaseFiles->Belt.Array.map(filename => {
    (filename, readFile("./testCases/" ++ filename, "utf8"))
  });

let test = () => {
  let testShell = "./test.sh";
  let testShellContent =
    ref({|set -e;
echo 'RUNNING REFMT TESTS';
echo;
echo;|});

  testCases->Belt.Array.forEach(testCase => {
    let (name, data) = testCase;
    let filename = {j|/tmp/$name.re|j};
    Js.log2("Appending test case: ", filename);

    testShellContent :=
      testShellContent^
      ++ "\n"
      ++ {j|head $filename; /Users/s/.esy/3_______________________________________________________________________/i/opam__s__reason-7d161d4c/bin/refmt --in-place $filename;
|j};

    let result = HtmlConverter.convert(name, data);
    writeFile(
      filename,
      {j|/* Original:

*/

let result = (<> $result </>)

|j},
    );
  });

  writeFile(testShell, testShellContent^);
};

test();
