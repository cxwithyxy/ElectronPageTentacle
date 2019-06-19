import { Singleton } from "../../base/Singleton";
import _ from "lodash"
import login from "./func_lib/login"
import fuli from "./func_lib/fuli"
import renwu from "./func_lib/renwu";
import maomao618 from "./func_lib/maomao618";
import touch_emulator from "./func_lib/touch_emulator";
import zhuangyuan from "./func_lib/zhuangyuan";

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
        this.add_object(login)
        this.add_object(fuli)
        this.add_object(renwu)
        this.add_object(touch_emulator)
        this.add_object(zhuangyuan)
        this.add_object(maomao618)
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