"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sleep_promise_1 = __importDefault(require("sleep-promise"));
const p_limit_1 = __importDefault(require("p-limit"));
const lodash_1 = __importDefault(require("lodash"));
const forin_promise_1 = __importDefault(require("forin_promise"));
class Worker {
    constructor(win_settings) {
        this.page_load_lock = false;
        /**
         * 控制worker是否会被垃圾回收
         *
         * @memberof Worker
         */
        this.garbage_collection_marker = false;
        /**
         * 当前已存活时间, 超过最大存活时间应该会被垃圾回收
         *
         * @memberof Worker
         */
        this.survival_time = 0;
        /**
         * 最大存活时间
         *
         * @memberof Worker
         */
        this.max_survival_time = 60 * 10;
        this.win_settings = win_settings;
        this.win_settings = lodash_1.default.merge(this.win_settings, {
            webPreferences: {
                backgroundThrottling: false
            }
        });
        Worker.add_worker(this);
    }
    /**
     * 添加worker实例到全局worker实例数组中
     *
     * @static
     * @param {Worker} _w 要被添加的worker实例
     * @memberof Worker
     */
    static add_worker(_w) {
        Worker.worker_box.push(_w);
        Worker.start_garbage_collection();
        Worker.start_survival_process();
    }
    static get_workers() {
        return Worker.worker_box;
    }
    /**
     * 启动垃圾回收机制, 每5秒执行一次
     *
     * @static
     * @memberof Worker
     */
    static start_garbage_collection() {
        if (lodash_1.default.isUndefined(Worker.worker_garbage_collection_timeout)) {
            Worker.worker_garbage_collection_timeout = setInterval(() => {
                lodash_1.default.remove(Worker.worker_box, (_w) => {
                    if (_w.garbage_collection_marker) {
                        try {
                            _w.win.close();
                        }
                        catch (error) { }
                    }
                    return _w.garbage_collection_marker;
                });
            }, 5000);
            return;
        }
    }
    /**
     * 启动存活核算进程
     *
     * @static
     * @memberof Worker
     */
    static start_survival_process() {
        if (!lodash_1.default.isUndefined(Worker.worker_survival_timeout)) {
            return;
        }
        Worker.worker_survival_timeout = setInterval(async () => {
            await Worker.all_worker_do(async (_w) => {
                _w.survival_time += 5;
                if (_w.survival_time >= _w.max_survival_time) {
                    _w.close();
                }
            });
        }, 5000);
    }
    /**
     * 续命
     *
     * @param {number} adding_time 要续命多少秒呢
     * @memberof Worker
     */
    give_me_a_life(adding_time) {
        this.max_survival_time = this.survival_time + adding_time;
    }
    /**
     * 批量操作所有的worker
     *
     * @static
     * @param {(_w: Worker) => Promise<any>} _func
     * @memberof Worker
     */
    static async all_worker_do(_func) {
        await forin_promise_1.default(Worker.worker_box, async (_v, _k) => {
            _func(_v);
        });
    }
    set_inject_js(_ijh) {
        this.inject_js = _ijh;
        return this;
    }
    /**
     * 把Worker置于等待垃圾回收队列中
     *
     * @memberof Worker
     */
    close() {
        this.garbage_collection_marker = true;
    }
    open_url(url) {
        this.wincc.loadURL(url);
        return this;
    }
    show() {
        // this.win.center()
    }
    is_show() {
        return false;
    }
    hide() {
        // this.win.setPosition(-1920, 0)
    }
    /**
     * 初始化worker界面显示
     *
     * @returns {Worker}
     * @memberof Worker
     */
    page_init() {
        this.win = new electron_1.BrowserWindow(this.win_settings);
        // this.win.setSkipTaskbar(true)
        this.wincc = this.win.webContents;
        this.ua = this.wincc.getUserAgent();
        this.init_page_load_lock();
        this.hide();
        this.debugger_bridger_init();
        this.touch_emulation();
        return this;
    }
    /**
     * 初始化页面加载控制锁
     *
     * @memberof Worker
     */
    init_page_load_lock() {
        this.wincc.on("did-stop-loading", () => {
            this.page_load_lock = false;
        });
    }
    /**
     * 设置用户UA
     *
     * @param {string} ua
     * @returns {Worker}
     * @memberof Worker
     */
    set_ua(ua) {
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
    open_dev() {
        this.wincc.openDevTools({ mode: "undocked" });
        return this;
    }
    /**
     * 在窗口上下文中运行js代码
     *
     * @param {string} js_code
     * @returns
     * @memberof Worker
     */
    async exec_js(js_code) {
        return await this.wincc.executeJavaScript(this.inject_js.to_code_string(js_code));
    }
    // 该函数等待废弃
    async shine_focus(_when_shine_do) {
        this.wincc.focus();
        await sleep_promise_1.default(300);
        await _when_shine_do();
    }
    /**
     * 模拟鼠标移动事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    async mouse_move(_x, _y) {
        this.shine_focus(async () => {
            this.wincc.sendInputEvent({
                type: "mouseMove",
                x: _x,
                y: _y
            });
        });
    }
    /**
     * 模拟鼠标左键按下事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    async mouse_down(_x, _y) {
        this.shine_focus(async () => {
            this.wincc.sendInputEvent({
                type: "mouseDown",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            });
        });
    }
    /**
     * 模拟鼠标左键松开事件
     *
     * @param {Number} _x
     * @param {Number} _y
     * @memberof Worker
     */
    async mouse_up(_x, _y) {
        this.shine_focus(async () => {
            this.wincc.sendInputEvent({
                type: "mouseUp",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            });
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
    async mouse_drag_drop(begin_x, begin_y, end_x, end_y) {
        await this.mouse_down(begin_x, begin_y);
        await this.mouse_up(end_x, end_y);
    }
    /**
     * 初始化debugger调试, 便于实现后续功能
     *
     * @memberof Worker
     */
    debugger_bridger_init() {
        try {
            this.wincc.debugger.attach(`1.3`);
        }
        catch (err) {
            console.log('Debugger attach failed : ', err);
        }
        this.wincc.debugger.on('detach', (event, reason) => {
            console.log('Debugger detached due to : ', reason);
        });
    }
    /**
     * 允许触摸模拟
     *
     * @memberof Worker
     */
    touch_emulation() {
        this.wincc.debugger.sendCommand('Emulation.setTouchEmulationEnabled', {
            enabled: true
        });
    }
    /**
     * 激活界面触摸模拟
     *
     * @memberof Worker
     */
    async screen_touch_emulation() {
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
    async touch_it(_type, _x, _y) {
        let tp = [{ x: _x, y: _y }];
        if (_type == "touchEnd" || _type == "touchCancel") {
            tp = [];
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
    async touch_drag_drop(spend_time, begin_x, begin_y, end_x, end_y) {
        await this.touch_it("touchStart", begin_x, begin_y);
        await this.touch_move(100, spend_time, begin_x, begin_y, end_x, end_y);
        await this.touch_it("touchEnd", end_x, end_y);
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
    async touch_move(step, spend_time, begin_x, begin_y, end_x, end_y) {
        let distance_x = end_x - begin_x;
        let distance_y = end_y - begin_y;
        let step_x = distance_x / step;
        let step_y = distance_y / step;
        let sleep_time = spend_time / step;
        let now_step = 1;
        while (true) {
            await this.touch_it("touchMove", begin_x + step_x * now_step, begin_y + step_y * now_step);
            await sleep_promise_1.default(sleep_time);
            now_step++;
            if (now_step >= step) {
                break;
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
    async tap(x, y) {
        await this.touch_it("touchStart", x, y);
        await sleep_promise_1.default(300);
        await this.touch_it("touchEnd", x, y);
    }
    /**
     * 模拟点击事件
     *
     * @param {Number} _x x轴
     * @param {Number} _y y轴
     * @memberof Worker
     */
    async click(_x, _y) {
        this.shine_focus(async () => {
            this.wincc.sendInputEvent({
                type: "mouseDown",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            });
            await sleep_promise_1.default(100 + Math.random() * 100);
            this.wincc.sendInputEvent({
                type: "mouseUp",
                button: "left",
                x: _x,
                y: _y,
                clickCount: 1
            });
        });
    }
    /**
     * 重新加载窗口页面(刷新)
     *
     * @memberof Worker
     */
    async reload() {
        this.wincc.reload();
        await this.wait_page_load();
    }
    /**
     * 等待页面加载完成
     *
     * @returns
     * @memberof Worker
     */
    async wait_page_load(timeout = 10e3) {
        this.page_load_lock = true;
        let timeout_alive = true;
        (async () => {
            setTimeout(() => {
                if (timeout_alive && this.page_load_lock) {
                    this.page_load_lock = false;
                    timeout_alive = false;
                }
            }, timeout);
        })();
        while (this.page_load_lock) {
            await sleep_promise_1.default(100);
        }
        timeout_alive = false;
        return this;
    }
    /**
     * 读取cookies
     *
     * @param {*} [filter={}] 过滤器, 见electron中session的cookies的get方法
     * @returns
     * @memberof Worker
     */
    async read_cookies(filter = {}) {
        return new Promise((succ, fail) => {
            this.wincc.session.cookies.get(filter, (e, the_cookie) => {
                if (e) {
                    fail(e);
                }
                succ(the_cookie);
            });
        });
    }
    /**
     * 读取所有cookie, 你可在接下来的操作中进行持久化存储所有cookie的操作
     *
     * @returns {Promise<Array<any>>}
     * @memberof Worker
     */
    async get_all_cookie() {
        let cookies = await this.read_cookies();
        return (cookies);
    }
    /**
     * 载入cookie
     *
     * @param {string} url 见electron中session.cookies.set方法参数
     * @param {Array<any>} cookies cookie数组, 同见session.cookies
     * @memberof Worker
     */
    async load_all_cookie(url, cookies) {
        await this.set_cookies(url, cookies);
    }
    async set_cookies(url, cookies = []) {
        let limit = p_limit_1.default(cookies.length);
        let queque = [];
        lodash_1.default.forEach(cookies, (v, k) => {
            v.url = url;
            if (!lodash_1.default.isUndefined(v.expirationDate)) {
                v.expirationDate = new Date().getTime() / 1000 + 365 * 24 * 3600;
            }
            queque.push(limit(async () => {
                return new Promise((succ) => {
                    this.wincc.session.cookies.set(v, () => {
                        succ();
                    });
                });
            }));
        });
        await Promise.all(queque);
    }
}
/**
 * 全局的worker储存器, 便于垃圾回收等相关机制获取worker对象
 *
 * @static
 * @type {Array<Worker>}
 * @memberof Worker
 */
Worker.worker_box = [];
exports.Worker = Worker;
