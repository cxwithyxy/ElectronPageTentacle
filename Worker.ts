import { BrowserWindow, WebContents } from 'electron'
import { Inject_js_handler as IJH } from "./inject_js/Inject_js_handler"
import { Config_helper } from "./../Config_helper"
import sleep from "sleep-promise"
import pLimit from 'p-limit'
import _ from "lodash"
import forin_promise from '../base/forin_promise';

export class Worker
{
    win!: BrowserWindow
    wincc!: WebContents
    win_settings: object
    page_load_lock = false
    ua!: string
    
    /**
     * 控制worker是否会被垃圾回收
     *
     * @memberof Worker
     */
    garbage_collection_marker = false

    /**
     * 当前已存活时间, 超过最大存活时间应该会被垃圾回收
     *
     * @memberof Worker
     */
    survival_time = 0
    
    /**
     * 最大存活时间
     *
     * @memberof Worker
     */
    max_survival_time = 60 * 10

    /**
     * worker存活时间控制句柄
     *
     * @static
     * @type {NodeJS.Timeout}
     * @memberof Worker
     */
    static worker_survival_timeout: NodeJS.Timeout

    /**
     * 全局的worker储存器, 便于垃圾回收等相关机制获取worker对象
     *
     * @static
     * @type {Array<Worker>}
     * @memberof Worker
     */
    static worker_box: Array<Worker> = []
    
    /**
     * 垃圾回收定时器句柄
     *
     * @static
     * @type {NodeJS.Timeout}
     * @memberof Worker
     */
    static worker_garbage_collection_timeout: NodeJS.Timeout
    
    /**
     * 添加worker实例到全局worker实例数组中
     *
     * @static
     * @param {Worker} _w 要被添加的worker实例
     * @memberof Worker
     */
    static add_worker(_w: Worker)
    {
        Worker.worker_box.push(_w)
        Worker.start_garbage_collection()
        Worker.start_survival_process()
    }

    static get_workers()
    {
        return Worker.worker_box
    }

    /**
     * 启动垃圾回收机制, 每5秒执行一次
     *
     * @static
     * @memberof Worker
     */
    static start_garbage_collection()
    {
        if(_.isUndefined(Worker.worker_garbage_collection_timeout))
        {
            Worker.worker_garbage_collection_timeout = setInterval(() =>
            {
                _.remove(Worker.worker_box, (_w: Worker) =>
                {
                    if(_w.garbage_collection_marker)
                    {
                        try
                        {
                            _w.win.close()
                        }
                        catch (error){}
                    }
                    return _w.garbage_collection_marker
                })
            }, 5000)
            return
        }
        
    }

    /**
     * 启动存活核算进程
     *
     * @static
     * @memberof Worker
     */
    static start_survival_process()
    {
        if(!_.isUndefined(Worker.worker_survival_timeout))
        {
            return
        }
        Worker.worker_survival_timeout = setInterval(async () =>
        {
            await Worker.all_worker_do(async (_w) =>
            {
                _w.survival_time += 5;
                if(_w.survival_time >= _w.max_survival_time)
                {
                    _w.close()
                }
            })
        }, 5000)
    }

    /**
     * 续命
     *
     * @param {number} adding_time 要续命多少秒呢
     * @memberof Worker
     */
    give_me_a_life(adding_time: number)
    {
        this.max_survival_time = this.survival_time + adding_time
    }

    /**
     * 批量操作所有的worker
     *
     * @static
     * @param {(_w: Worker) => Promise<any>} _func
     * @memberof Worker
     */
    static async all_worker_do(_func: (_w: Worker) => Promise<any>)
    {
        await forin_promise(
            Worker.worker_box,
            async (_v, _k) =>
            {
                _func(_v)
            }
        )
    }

    constructor (win_settings: {})
    {
        this.win_settings = win_settings;
        this.win_settings = _.merge(this.win_settings, {
            webPreferences: {
                backgroundThrottling: false
            }
        })
        Worker.add_worker(this)
    }

    /**
     * 把Worker置于等待垃圾回收队列中
     *
     * @memberof Worker
     */
    close()
    {
        this.garbage_collection_marker = true
    }

    open_url (url: string): Worker
    {
        this.wincc.loadURL(url)
        return this;
    }

    show()
    {
        // this.win.center()
    }

    is_show()
    {
        return false
    }

    hide()
    {
        // this.win.setPosition(-1920, 0)
    }

    /**
     * 初始化worker界面显示
     *
     * @returns {Worker}
     * @memberof Worker
     */
    page_init (): Worker
    {
        this.win = new BrowserWindow(this.win_settings)
        // this.win.setSkipTaskbar(true)
        this.wincc = this.win.webContents;
        this.ua = this.wincc.getUserAgent();
        this.init_page_load_lock()
        this.hide()
        this.debugger_bridger_init()
        this.touch_emulation()
        return this
    }

    /**
     * 初始化页面加载控制锁
     *
     * @memberof Worker
     */
    init_page_load_lock()
    {
        this.wincc.on("did-stop-loading", () =>
        {
            this.page_load_lock = false
        })
    }

    /**
     * 设置用户UA
     *
     * @param {string} ua
     * @returns {Worker}
     * @memberof Worker
     */
    set_ua (ua: string): Worker
    {
        this.wincc.setUserAgent(ua);
        this.ua = ua;
        return this;
    }

    /**
     * 打开控制台
     *
     * @returns {Worker}
     * @memberof Worker
     */
    open_dev(): Worker
    {
        this.wincc.openDevTools({mode: "undocked"});
        return this;
    }

    /**
     * 在窗口上下文中运行js代码
     *
     * @param {string} js_code
     * @returns
     * @memberof Worker
     */
    async exec_js(js_code: string)
    {
        return await this.wincc.executeJavaScript(
            IJH.getInstance().to_code_string(js_code)
        );
    }

    // 该函数等待废弃
    async shine_focus(_when_shine_do: () => Promise<any>)
    {
        this.wincc.focus()
        await sleep(300)
        await _when_shine_do()
    }

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
     * 初始化debugger调试, 便于实现后续功能
     *
     * @memberof Worker
     */
    debugger_bridger_init()
    {
        try
        {
            this.wincc.debugger.attach(`1.3`)
        }
        catch (err)
        {
            console.log('Debugger attach failed : ', err)
        }

        this.wincc.debugger.on('detach', (event, reason) => 
        {
            console.log('Debugger detached due to : ', reason)
        })
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
     * 重新加载窗口页面(刷新)
     *
     * @memberof Worker
     */
    async reload()
    {
        this.wincc.reload()
        await this.wait_page_load()
    }

    /**
     * 等待页面加载完成
     *
     * @returns
     * @memberof Worker
     */
    async wait_page_load()
    {
        this.page_load_lock = true
        while(this.page_load_lock)
        {
            await sleep(100)
        }
        return this
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
     * 持久化存储所有cookie, 存储到conf文件中
     *
     * @memberof Worker
     */
    async save_all_cookie_in_conf()
    {
        let cookies = await this.read_cookies()
        Config_helper.getInstance().set({cookies: JSON.stringify(cookies)})
    }

    /**
     * 从conf文件中载入所有cookie
     *
     * @param {string} url 见electron中session.cookies.set方法参数
     * @memberof Worker
     */
    async load_all_cookie_in_conf(url: string)
    {
        let login_cookies:Array<any> = JSON.parse(Config_helper.getInstance().get("cookies"))
        await this.set_cookies(url, login_cookies)
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