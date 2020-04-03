import { BrowserWindow, WebContents, clipboard, Event } from 'electron'
import { Inject_js_handler as IJH } from "../Inject_js_handler"
import sleep from "sleep-promise"
import pLimit from 'p-limit'
import _ from "lodash"
import forin_promise from 'forin_promise';
import robotjs from "robotjs"
import {Worker_page} from "./Worker_page"

export class Worker extends Worker_page
{
    

    /**
     * 模拟鼠标移动事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    async mouse_move(_x: Number, _y: Number)
    {
        this.shine_focus(async () =>
        {
            this.wincc.sendInputEvent(<any>{
                type: "mouseMove",
                x: _x,
                y: _y
            })
        });
    }

    /**
     * 模拟鼠标左键按下事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    async mouse_down(_x: Number, _y: Number)
    {
        this.shine_focus(async () =>
        {
            this.wincc.sendInputEvent(<any>{
                type: "mouseDown",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            })
        });
    }

    /**
     * 模拟鼠标左键松开事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    async mouse_up(_x: Number, _y: Number)
    {
        this.shine_focus(async () =>
        {
            this.wincc.sendInputEvent(<any>{
                type: "mouseUp",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            })
        });
    }

    /**
     * 模拟鼠标拖拽事件
     *
     * @param {number} begin_x 鼠标按下时的x坐标
     * @param {number} begin_y 鼠标按下时的y坐标
     * @param {number} end_x 鼠标松开时的x坐标
     * @param {number} end_y 鼠标松开时的y坐标
     * @memberof Worker
     */
    async mouse_drag_drop(begin_x:number, begin_y: number, end_x: number, end_y: number)
    {
        await this.mouse_down(begin_x, begin_y)
        await this.mouse_up(end_x, end_y)
    }

    /**
     * 允许触摸模拟
     *
     * @memberof Worker
     */
    touch_emulation()
    {
        this.wincc.debugger.sendCommand('Emulation.setTouchEmulationEnabled', {
            enabled: true
        });
    }
    
    /**
     * 激活界面触摸模拟
     *
     * @memberof Worker
     */
    async screen_touch_emulation()
    {
        await this.wincc.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', {
            enabled: true,
            configuration: "mobile"
        });
    }

    /**
     * 基础的模拟触摸
     *
     * @param {("touchStart" | "touchEnd" | "touchMove" | "touchCancel")} _type
     * @param {number} _x
     * @param {number} _y
     * @memberof Worker
     */
    async touch_it(_type: "touchStart" | "touchEnd" | "touchMove" | "touchCancel", _x: number, _y: number)
    {
        let tp = [{x: _x, y: _y}]
        if(_type == "touchEnd" || _type =="touchCancel")
        {
            tp = []
        }
        await this.wincc.debugger.sendCommand('Input.dispatchTouchEvent', {
            type: _type,
            touchPoints: tp
        });
    }


    /**
     * 模拟鼠标输入, 未测试通过, 别用
     *
     * @param {("mousePressed" | "mouseReleased" | "mouseMoved" | "mouseWheel")} _type
     * @param {number} _x
     * @param {number} _y
     * @memberof Worker
     */
    async mouse_it(_type: "mousePressed" | "mouseReleased" | "mouseMoved" | "mouseWheel", _x: number, _y: number)
    {
       
        await this.wincc.debugger.sendCommand('Input.dispatchMouseEvent', {
            type: _type,
            x: _x,
            y: _y
        });
    }

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

    /**
     * 触摸拖拽
     *
     * @param {number} spend_time
     * @param {number} begin_x
     * @param {number} begin_y
     * @param {number} end_x
     * @param {number} end_y
     * @memberof Worker
     */
    async touch_drag_drop(spend_time: number, begin_x: number, begin_y: number, end_x: number, end_y: number)
    {
        await this.touch_it("touchStart", begin_x, begin_y)
        await this.touch_move(100, spend_time, begin_x, begin_y, end_x, end_y)
        await this.touch_it("touchEnd", end_x, end_y)
    }

    /**
     * 模拟touchmove
     *
     * @param {number} step 总步数
     * @param {number} spend_time 总耗时
     * @param {number} begin_x 起始x
     * @param {number} begin_y 起始y
     * @param {number} end_x 结束x
     * @param {number} end_y 结束y
     * @memberof Worker
     */
    async touch_move(step: number, spend_time: number, begin_x: number, begin_y: number, end_x: number, end_y: number)
    {
        let distance_x = end_x - begin_x;
        let distance_y = end_y - begin_y;
        let step_x = distance_x / step;
        let step_y = distance_y / step;
        let sleep_time = spend_time / step;
        let now_step = 1;
        while(true)
        {
            await this.touch_it("touchMove", begin_x + step_x * now_step, begin_y + step_y * now_step)
            await sleep(sleep_time)
            now_step ++;
            if(now_step >= step)
            {
                break
            }
        }
    }

    /**
     * 模拟tap
     *
     * @param {number} x
     * @param {number} y
     * @memberof Worker
     */
    async tap(x: number, y:number)
    {
        await this.touch_it("touchStart", x, y)
        await sleep(300)
        await this.touch_it("touchEnd", x, y)
    }

    /**
     * 模拟点击事件
     *
     * @param {Number} _x x轴
     * @param {Number} _y y轴
     * @memberof Worker
     */
    async click(_x: Number, _y: Number)
    {
        this.shine_focus(async () =>
        {
            this.wincc.sendInputEvent(<any>{
                type: "mouseDown",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            })
            await sleep(100 + Math.random() * 100)
            this.wincc.sendInputEvent(<any>{
                type: "mouseUp",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            })

        });
    }

    

    /**
     * 读取cookies
     *
     * @param {*} [filter={}] 过滤器, 见electron中session的cookies的get方法
     * @returns
     * @memberof Worker
     */
    async read_cookies(filter = {})
    {
        return new Promise((succ, fail) =>
        {
            this.wincc.session.cookies.get(filter , (e, the_cookie) =>
            {
                if(e)
                {
                    fail(e)
                }
                succ(the_cookie)
            })
        })
        
    }

    /**
     * 读取所有cookie, 你可在接下来的操作中进行持久化存储所有cookie的操作
     *
     * @returns {Promise<Array<any>>}
     * @memberof Worker
     */
    async get_all_cookie(): Promise<Array<any>>
    {
        let cookies = <Array<any>>await this.read_cookies()
        return (cookies);
    }

    /**
     * 载入cookie
     *
     * @param {string} url 见electron中session.cookies.set方法参数
     * @param {Array<any>} cookies cookie数组, 同见session.cookies
     * @memberof Worker
     */
    async load_all_cookie(url: string, cookies: Array<any>)
    {
        await this.set_cookies(url, cookies)
    }

    async set_cookies(url: string, cookies:Array<any> = [])
    {
        let limit:Function = pLimit(cookies.length)
        let queque:Array<any> = [];
        _.forEach(cookies, (v,k) =>
        {
            v.url = url
            if(!_.isUndefined(v.expirationDate))
            {
                v.expirationDate = new Date().getTime() / 1000 + 365 * 24 * 3600
            }
            queque.push(limit(async () =>
            {
                return new Promise((succ) =>
                {
                    this.wincc.session.cookies.set(
                        v,
                        ()=>
                        {
                            succ()
                        }
                    )
                })
            }))
        })
        await Promise.all(queque)

    }
}