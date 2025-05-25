import { VM } from "vm2";
import { Result } from "../../core/helpers/result";
import ts from "typescript";
import { ReadFileUseCase } from "../../core/usecases/read_file_usecase";
import { ResponseBase } from "../../core/controllers/http_controller";
import { parse, print } from "recast";
import * as babelParser from "@babel/parser";
import { visit, builders } from "ast-types";

export interface StatisticTypeUsage {
  Array: {
    at?: number;
    parenthesisAccessOperator?: number;
    concat?: number;
    copyWithin?: number;
    entries?: number;
    every?: number;
    fill?: number;
    filter?: number;
    find?: number;
    findIndex?: number;
    flat?: number;
    flatMap?: number;
    forEach?: number;
    includes?: number;
    indexOf?: number;
    join?: number;
    map?: number;
    pop?: number;
    push?: number;
    reduce?: number;
    reduceRight?: number;
    reverse?: number;
    shift?: number;
    slice?: number;
    some?: number;
    sort?: number;
    splice?: number;
    unshift?: number;
    values?: number;
  };
  Object: {};
  Map: {};
  Set: {};
  Number: {
    toExponential?: number;
    toFixed?: number;
    toPrecision?: number;
    isFinite?: number;
    isInteger?: number;
    isNan?: number;
    isSafeInteger?: number;
    parseFloat?: number;
    parseInt?: number;
  };
  Boolean: {};
  RegExp: {};
  String: {
    valueOfString?: number;
    trimStart?: number;
    trimEnd?: number;
    trim?: number;
    toUpperCase?: number;
    toStringString?: number;
    toLowerCase?: number;
    toLocaleUpperCase?: number;
    toLocaleLowerCase?: number;
    substring?: number;
    startsWith?: number;
    split?: number;
    slice?: number;
    at?: number;
    charAt?: number;
    charCodeAt?: number;
    codePointAt?: number;
    concat?: number;
    endsWith?: number;
    includes?: number;
    indexOf?: number;
    lastIndexOf?: number;
    localeCompare?: number;
    match?: number;
    matchAll?: number;
    normalize?: number;
    padEnd?: number;
    padStart?: number;
    repeat?: number;
    replace?: number;
    replaceAll?: number;
    search?: number;
  };
}
export class StatisticTypeUsageCompleteUseCase {
  call = async (code: string): ResponseBase => {
    return (
      await new ReadFileUseCase().call<String>(
        __dirname + "/extensions/composition_parse.js"
      )
    ).map(async (file) => {
      const statisticTypeUsage: StatisticTypeUsage = {
        String: {},
        Array: {},
        Object: {},
        Map: {},
        Set: {},
        Number: {},
        Boolean: {},
        RegExp: {},
      };

      const [extensions, log] = file.split("//${code}");
      const vm = new VM({
        sandbox: {
          console: {
            log: (...args) => {
              if (args[0]["parseObject"] !== undefined) {
                Object.assign(statisticTypeUsage, args[0]["parseObject"]);
              }
            },
          },
        },
      });
      const transformAst = this.transformCodeByAST(
        ts.transpileModule(code, {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2024,
          },
        }).outputText
      );
      const translationCode = `${extensions}\n${transformAst}\n${log}`;

      return (
        await new ReadFileUseCase().call<String>(
          __dirname + "/extensions/fn.js"
        )
      ).map((fnAstParseHelper) => {
        const [codeBody, fn] = translationCode.split("//${code_fn}");

        const code = `${codeBody}
      ${fnAstParseHelper}
      ${fn}`;

        try {
          vm.run(code);
        } catch (error: any) {
          // console.log(error);
        }
        return Result.ok(this.clearStatisticTypeUsage(statisticTypeUsage));
      });
    });
  };

  clearStatisticTypeUsage = (
    statisticTypeUsage: StatisticTypeUsage
  ): StatisticTypeUsage => {
    if (statisticTypeUsage.Array.join !== undefined) {
      statisticTypeUsage.Array.join = statisticTypeUsage.Array.join - 1;
    }

    return statisticTypeUsage;
  };
  transformCodeByAST(code: string): string {
    try {
      const ast = parse(code, {
        parser: {
          parse(source: string) {
            return babelParser.parse(source, {
              sourceType: "module",
              plugins: ["typescript", "jsx"],
            });
          },
        },
      });
      // console.log(ast);

      visit(ast, {
        visitCallExpression(path) {
          const node = path.node;
          // Array(1)
          if (
            node.callee.type === "Identifier" &&
            node.callee.name === "Array"
          ) {
            const newCall = builders.callExpression(
              builders.identifier("arrayParse"),
              node.arguments
            );
            path.replace(newCall);
            return false;
          }

          // Array.from(...)
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.object.type === "Identifier" &&
            node.callee.object.name === "Array" &&
            node.callee.property.type === "Identifier" &&
            node.callee.property.name === "from"
          ) {
            const newCall = builders.callExpression(
              builders.identifier("arrayFromParse"),
              node.arguments
            );
            path.replace(newCall);
            return false;
          }

          // Array.isArray(...)
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.object.type === "Identifier" &&
            node.callee.object.name === "Array" &&
            node.callee.property.type === "Identifier" &&
            node.callee.property.name === "isArray"
          ) {
            const newCall = builders.callExpression(
              builders.identifier("arrayIsArrayParse"),
              node.arguments
            );
            path.replace(newCall);
            return false;
          }

          // Array.of(...)
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.object.type === "Identifier" &&
            node.callee.object.name === "Array" &&
            node.callee.property.type === "Identifier" &&
            node.callee.property.name === "of"
          ) {
            const newCall = builders.callExpression(
              builders.identifier("arrayOfParse"),
              node.arguments
            );
            path.replace(newCall);
            return false;
          }
          if (
            node.callee.type === "Identifier" &&
            (node.callee.name === "parseFloat" ||
              node.callee.name === "parseInt")
          ) {
            const newName = node.callee.name + "Parse";
            const callExpr = builders.callExpression(
              builders.identifier(newName),
              node.arguments
            );
            path.replace(callExpr);
            return false;
          }

          // Обработка вызовов через точку, например Number.isFinite
          if (
            node.callee.type === "MemberExpression" &&
            !node.callee.computed &&
            node.callee.object.type === "Identifier" &&
            node.callee.object.name === "Number" &&
            node.callee.property.type === "Identifier"
          ) {
            const propName = node.callee.property.name; // isFinite, isSafeInteger и т.д.
            const newFuncName =
              "number" +
              propName.charAt(0).toUpperCase() +
              propName.slice(1) +
              "Parse";
            const callExpr = builders.callExpression(
              builders.identifier(newFuncName),
              node.arguments
            );
            path.replace(callExpr);
            return false;
          }
          if (
            node.callee.type === "Identifier" &&
            node.callee.name === "Number" &&
            node.arguments.length === 1
          ) {
            const callExpr = builders.callExpression(
              builders.identifier("numberParse"),
              [node.arguments[0]]
            );
            path.replace(callExpr);
            return false;
          }
          this.traverse(path);
        },
        visitMemberExpression(path) {
          const node = path.node;
          if (node.computed) {
            const callExpr = builders.callExpression(
              builders.identifier("elementAt"),
              [node.object, node.property]
            );
            path.replace(callExpr);
            return false;
          }

          if (
            !node.computed &&
            node.property.type === "Identifier" &&
            node.property.name === "length"
          ) {
            const callExpr = builders.callExpression(
              builders.identifier("lengthParse"),
              [node.object]
            );
            path.replace(callExpr);
            return false;
          }

          this.traverse(path);
        },
      });
      // console.log(print(ast).code);
      return print(ast).code;
    } catch (e) {
      console.log("error");
      console.log(e);
    }
  }
}
