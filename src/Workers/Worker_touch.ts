import { BrowserWindow, WebContents, clipboard, Event } from 'electron'
import { Inject_js_handler as IJH } from "../Inject_js_handler"
import sleep from "sleep-promise"
import pLimit from 'p-limit'
import _ from "lodash"
import forin_promise from 'forin_promise';
import robotjs from "robotjs"
import {Worker_mouse} from "./Worker_mouse"

export class Worker_touch extends Worker_mouse
{
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
}