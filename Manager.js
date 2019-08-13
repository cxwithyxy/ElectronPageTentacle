"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const _ = __importStar(require("lodash"));
const p_limit_1 = __importDefault(require("p-limit"));
class Manager {
    constructor(_w) {
        if (!_.isUndefined(_w) && !_.isArray(_w)) {
            this.workers = [_w];
        }
        if (_.isArray(_w)) {
            this.workers = _w;
        }
        if (_.isUndefined(_w)) {
            this.workers = [];
        }
    }
    /**
     * 默认初始化worker函数, 建议覆盖后写自己的逻辑
     *
     * @memberof Manager
     */
    init_worker() {
        this.set_workers([
            new index_1.Worker({
                width: 800,
                height: 600,
            })
        ]);
        this.workers_do(async (_w) => {
            _w.page_init();
            _w.set_inject_js(new index_1.Inject_js_handler());
        });
    }
    set_main_worker(_w) {
        let main_worker = _.head(this.workers);
        if (_.isUndefined(main_worker)) {
            this.workers.push(_w);
        }
        else {
            this.workers[0] = _w;
        }
        return this;
    }
    get_main_worker() {
        let main_worker = _.head(this.workers);
        if (_.isUndefined(main_worker)) {
            throw new Error("main_worker_have_not_set");
        }
        return main_worker;
    }
    deliver_main_worker_to(_m) {
        return _m.set_main_worker(this.get_main_worker());
    }
    set_workers(_workers) {
        this.workers = _workers;
        return this;
    }
    get_workers() {
        return this.workers;
    }
    add_worker(_w) {
        this.workers.push(_w);
    }
    /**
     * 把当前manager手下的worker递交给别的manager进行管理
     *
     * @param {Manager} _m 需要递交到的manager实例
     * @returns {Manager} 返回被递交到的manager实例
     * @memberof Manager
     */
    deliver_workers_to(_m) {
        return _m.set_workers(this.get_workers());
    }
    /**
     * 增殖worker
     *
     * @param {number} num 需要增殖的数量
     * @param {object} [setting] worker的基础设置
     * @returns {Manager}
     * @memberof Manager
     */
    proliferate_worker(num, setting) {
        let base_worker = this.get_main_worker();
        let current_url = base_worker.wincc.getURL();
        while (num--) {
            if (_.isUndefined(setting)) {
                setting = base_worker.win_settings;
            }
            let temp_worker = new index_1.Worker(setting);
            temp_worker.set_inject_js(base_worker.inject_js);
            temp_worker.page_init();
            temp_worker.set_ua(base_worker.ua);
            temp_worker.open_url(current_url);
            this.add_worker(temp_worker);
        }
        return this;
    }
    /**
     * 增殖worker到指定数量
     *
     * @param {number} num 需要增殖到的数量
     * @param {object} [setting] worker的基础设置
     * @returns {Manager}
     * @memberof Manager
     */
    proliferate_worker_until(num, setting) {
        let now_workers = this.get_workers();
        return this.proliferate_worker(num - now_workers.length, setting);
    }
    /**
     * 批量操作所有worker
     *
     * @param {(one_worker: Worker, index?: number) => Promise<any>} _func
     * @memberof Manager
     */
    async workers_do(_func) {
        let limit = p_limit_1.default(this.get_workers().length);
        let queque = [];
        _.forEach(this.get_workers(), (v, k) => {
            queque.push(limit(async () => {
                await _func(v, k);
            }));
        });
        await Promise.all(queque);
    }
    /**
     * 把worker们加入垃圾回收队列
     *
     * @memberof Manager
     */
    async close_workers() {
        await this.workers_do(async (_w) => {
            _w.close();
        });
    }
}
exports.Manager = Manager;
