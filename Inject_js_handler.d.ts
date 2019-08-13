export declare class Inject_js_handler {
    codes_lib: any;
    /**
     *Creates an instance of Inject_js_handler.
     * @param {Array<string>} 数组: 脚本的相对于inject_js_handler.js的相对路径
     * @memberof Inject_js_handler
     */
    constructor(script_paths?: Array<string>);
    /**
     * 读取注入脚本
     *
     * @param {Array<string>} 数组: 脚本的相对于inject_js_handler.js的相对路径
     * @memberof Inject_js_handler
     */
    load_scripts(script_paths: Array<string>): void;
    add_object(_obj: Object): this;
    to_code_string(code_at_end?: String): string;
}
