/// <reference types="node" />
import { BrowserWindow, WebContents } from 'electron';
import { Inject_js_handler as IJH } from "./Inject_js_handler";
export declare class Worker {
    win: BrowserWindow;
    wincc: WebContents;
    win_settings: object;
    page_load_lock: boolean;
    ua: string;
    inject_js: IJH;
    /**
     * 控制worker是否会被垃圾回收
     *
     * @memberof Worker
     */
    garbage_collection_marker: boolean;
    /**
     * 当前已存活时间, 超过最大存活时间应该会被垃圾回收
     *
     * @memberof Worker
     */
    survival_time: number;
    /**
     * 最大存活时间
     *
     * @memberof Worker
     */
    max_survival_time: number;
    /**
     * worker存活时间控制句柄
     *
     * @static
     * @type {NodeJS.Timeout}
     * @memberof Worker
     */
    static worker_survival_timeout: NodeJS.Timeout;
    /**
     * 全局的worker储存器, 便于垃圾回收等相关机制获取worker对象
     *
     * @static
     * @type {Array<Worker>}
     * @memberof Worker
     */
    static worker_box: Array<Worker>;
    /**
     * 垃圾回收定时器句柄
     *
     * @static
     * @type {NodeJS.Timeout}
     * @memberof Worker
     */
    static worker_garbage_collection_timeout: NodeJS.Timeout;
    /**
     * 添加worker实例到全局worker实例数组中
     *
     * @static
     * @param {Worker} _w 要被添加的worker实例
     * @memberof Worker
     */
    static add_worker(_w: Worker): void;
    static get_workers(): Worker[];
    /**
     * 启动垃圾回收机制, 每5秒执行一次
     *
     * @static
     * @memberof Worker
     */
    static start_garbage_collection(): void;
    /**
     * 启动存活核算进程
     *
     * @static
     * @memberof Worker
     */
    static start_survival_process(): void;
    /**
     * 续命
     *
     * @param {number} adding_time 要续命多少秒呢
     * @memberof Worker
     */
    give_me_a_life(adding_time: number): void;
    /**
     * 批量操作所有的worker
     *
     * @static
     * @param {(_w: Worker) => Promise<any>} _func
     * @memberof Worker
     */
    static all_worker_do(_func: (_w: Worker) => Promise<any>): Promise<void>;
    constructor(win_settings: {});
    set_inject_js(_ijh: IJH): this;
    /**
     * 把Worker置于等待垃圾回收队列中
     *
     * @memberof Worker
     */
    close(): void;
    open_url(url: string): Worker;
    show(): void;
    is_show(): boolean;
    hide(): void;
    /**
     * 初始化worker界面显示
     *
     * @returns {Worker}
     * @memberof Worker
     */
    page_init(): Worker;
    /**
     * 初始化页面加载控制锁
     *
     * @memberof Worker
     */
    init_page_load_lock(): void;
    /**
     * 设置用户UA
     *
     * @param {string} ua
     * @returns {Worker}
     * @memberof Worker
     */
    set_ua(ua: string): Worker;
    /**
     * 打开控制台
     *
     * @returns {Worker}
     * @memberof Worker
     */
    open_dev(): Worker;
    /**
     * 在窗口上下文中运行js代码
     *
     * @param {string} js_code
     * @returns
     * @memberof Worker
     */
    exec_js(js_code: string): Promise<any>;
    shine_focus(_when_shine_do: () => Promise<any>): Promise<void>;
    /**
     * 模拟鼠标移动事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    mouse_move(_x: Number, _y: Number): Promise<void>;
    /**
     * 模拟鼠标左键按下事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    mouse_down(_x: Number, _y: Number): Promise<void>;
    /**
     * 模拟鼠标左键松开事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    mouse_up(_x: Number, _y: Number): Promise<void>;
    /**
     * 模拟鼠标拖拽事件
     *
     * @param {number} begin_x 鼠标按下时的x坐标
     * @param {number} begin_y 鼠标按下时的y坐标
     * @param {number} end_x 鼠标松开时的x坐标
     * @param {number} end_y 鼠标松开时的y坐标
     * @memberof Worker
     */
    mouse_drag_drop(begin_x: number, begin_y: number, end_x: number, end_y: number): Promise<void>;
    /**
     * 初始化debugger调试, 便于实现后续功能
     *
     * @memberof Worker
     */
    debugger_bridger_init(): void;
    /**
     * 允许触摸模拟
     *
     * @memberof Worker
     */
    touch_emulation(): void;
    /**
     * 激活界面触摸模拟
     *
     * @memberof Worker
     */
    screen_touch_emulation(): Promise<void>;
    /**
     * 基础的模拟触摸
     *
     * @param {("touchStart" | "touchEnd" | "touchMove" | "touchCancel")} _type
     * @param {number} _x
     * @param {number} _y
     * @memberof Worker
     */
    touch_it(_type: "touchStart" | "touchEnd" | "touchMove" | "touchCancel", _x: number, _y: number): Promise<void>;
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
    touch_drag_drop(spend_time: number, begin_x: number, begin_y: number, end_x: number, end_y: number): Promise<void>;
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
    touch_move(step: number, spend_time: number, begin_x: number, begin_y: number, end_x: number, end_y: number): Promise<void>;
    /**
     * 模拟tap
     *
     * @param {number} x
     * @param {number} y
     * @memberof Worker
     */
    tap(x: number, y: number): Promise<void>;
    /**
     * 模拟点击事件
     *
     * @param {Number} _x x轴
     * @param {Number} _y y轴
     * @memberof Worker
     */
    click(_x: Number, _y: Number): Promise<void>;
    /**
     * 重新加载窗口页面(刷新)
     *
     * @memberof Worker
     */
    reload(): Promise<void>;
    /**
     * 等待页面加载完成
     *
     * @param {number} [timeout=10e3] 设置超时, 默认10s
     * @returns
     * @memberof Worker
     */
    wait_page_load(timeout?: number): Promise<this>;
    /**
     * 读取cookies
     *
     * @param {*} [filter={}] 过滤器, 见electron中session的cookies的get方法
     * @returns
     * @memberof Worker
     */
    read_cookies(filter?: {}): Promise<unknown>;
    /**
     * 读取所有cookie, 你可在接下来的操作中进行持久化存储所有cookie的操作
     *
     * @returns {Promise<Array<any>>}
     * @memberof Worker
     */
    get_all_cookie(): Promise<Array<any>>;
    /**
     * 载入cookie
     *
     * @param {string} url 见electron中session.cookies.set方法参数
     * @param {Array<any>} cookies cookie数组, 同见session.cookies
     * @memberof Worker
     */
    load_all_cookie(url: string, cookies: Array<any>): Promise<void>;
    set_cookies(url: string, cookies?: Array<any>): Promise<void>;
}
