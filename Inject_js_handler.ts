import _ from "lodash"

export class Inject_js_handler
{
    public codes_lib:any;

    /**
     *Creates an instance of Inject_js_handler.
     * @param {Array<string>} 数组: 脚本的相对于inject_js_handler.js的相对路径
     * @memberof Inject_js_handler
     */
    constructor(script_paths: Array<string>)
    {
        this.codes_lib = {}
        this.load_scripts(script_paths)
    }

    /**
     * 读取注入脚本
     *
     * @param {Array<string>} 数组: 脚本的相对于inject_js_handler.js的相对路径
     * @memberof Inject_js_handler
     */
    load_scripts(script_paths: Array<string>)
    {
        script_paths.forEach(item => {
            this.add_object(require(item))
        });
    }

    add_object(_obj:Object){
        _.merge(this.codes_lib, _obj);
        return this;
    }

    to_code_string(code_at_end:String = "")
    {
        let code = "";
        _.forIn(this.codes_lib, (v: any,k: any) =>
        {
            code += "var " + k.toString() + " = " + v.toString() + "\n"
        });
        return code + code_at_end;
    }
}