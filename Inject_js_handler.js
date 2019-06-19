"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
class Inject_js_handler {
    /**
     *Creates an instance of Inject_js_handler.
     * @param {Array<string>} 数组: 脚本的相对于inject_js_handler.js的相对路径
     * @memberof Inject_js_handler
     */
    constructor(script_paths) {
        this.codes_lib = {};
        this.load_scripts(script_paths);
    }
    /**
     * 读取注入脚本
     *
     * @param {Array<string>} 数组: 脚本的相对于inject_js_handler.js的相对路径
     * @memberof Inject_js_handler
     */
    load_scripts(script_paths) {
        script_paths.forEach(item => {
            this.add_object(require(item));
        });
    }
    add_object(_obj) {
        lodash_1.default.merge(this.codes_lib, _obj);
        return this;
    }
    to_code_string(code_at_end = "") {
        let code = "";
        lodash_1.default.forIn(this.codes_lib, (v, k) => {
            code += "var " + k.toString() + " = " + v.toString() + "\n";
        });
        return code + code_at_end;
    }
}
exports.Inject_js_handler = Inject_js_handler;
