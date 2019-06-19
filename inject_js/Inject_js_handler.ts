import { Singleton } from "../../base/Singleton";
import _ from "lodash"

export class Inject_js_handler extends Singleton
{
    public codes_lib:any;

    static instance:Inject_js_handler;
    
    public static getInstance():Inject_js_handler
    {
        if(!this.instance)
        {
            this.instance = new Inject_js_handler();
        }
        return this.instance;
    }
    constructor()
    {
        super()
        this.codes_lib = {}
        this.load_scripts([
            "./func_lib/login",
            "./func_lib/fuli",
            "./func_lib/renwu",
            "./func_lib/maomao618",
            "./func_lib/touch_emulator",
            "./func_lib/zhuangyuan"
        ])
    }

    /**
     * 读取注入脚本
     *
     * @param {Array<string>} 数组: 脚本的相对路径路径
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