import { BrowserWindow, WebContents, clipboard, Event } from 'electron'
import { Inject_js_handler as IJH } from "../Inject_js_handler"
import sleep from "sleep-promise"
import pLimit from 'p-limit'
import _ from "lodash"
import forin_promise from 'forin_promise';
import robotjs from "robotjs"
import {Worker_touch} from "./Worker_touch"

export class Worker_type_input extends Worker_touch
{
    /**
     * 当input被激活的时候, 往里面输入东西
     * 这个函数是通过复制粘贴实现的, 所以这里可能会有多线程的问题
     *
     * @param {string} _s
     * @memberof Worker
     */
    async IME_type(_s: string)
    {
        var chars = String(_s).split('')
        for(;;)
        {
            var ch = chars.shift()
            await sleep(1000/180)
            await this.wincc.sendInputEvent(<any>{
                type: 'char',
                keyCode: ch
            })
            if(chars.length == 0)
            {
                break
            }
        }
         
    }
}