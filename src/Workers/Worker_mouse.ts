import sleep from "sleep-promise"
import _ from "lodash"
import {Worker_page} from "./Worker_page"

export class Worker_mouse extends Worker_page
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
}